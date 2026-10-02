<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

if ($method === 'POST') {
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true) ?: [];

    if (empty($action) && isset($input['action'])) {
        $action = $input['action'];
    }

    switch ($action) {
        case 'register':
            handleRegister($pdo, $input);
            break;
        case 'login':
            handleLogin($pdo, $input);
            break;
        default:
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Aksi autentikasi tidak valid. Gunakan action=register atau action=login"]);
            break;
    }
} elseif ($method === 'GET') {
    if ($action === 'me') {
        handleGetProfile($pdo);
    } else {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Aksi GET tidak valid"]);
    }
} else {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Metode HTTP tidak diizinkan"]);
}

/**
 * Handle Registrasi Pengguna Baru
 */
function handleRegister($pdo, $input) {
    $name = trim($input['name'] ?? '');
    $email = strtolower(trim($input['email'] ?? ''));
    $password = $input['password'] ?? '';

    if (empty($name) || empty($email) || empty($password)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Nama, email, dan password wajib diisi"]);
        return;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Format email tidak valid"]);
        return;
    }

    if (strlen($password) < 6) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Password minimal 6 karakter"]);
        return;
    }

    try {
        // Cek apakah email sudah terdaftar
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = :email");
        $stmt->execute([':email' => $email]);
        if ($stmt->fetch()) {
            http_response_code(409);
            echo json_encode(["status" => "error", "message" => "Email sudah digunakan oleh akun lain"]);
            return;
        }

        // Hash password dengan algoritma BCRYPT aman
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

        $insertStmt = $pdo->prepare("INSERT INTO users (name, email, password, created_at) VALUES (:name, :email, :password, NOW())");
        $insertStmt->execute([
            ':name' => $name,
            ':email' => $email,
            ':password' => $hashedPassword
        ]);

        $userId = (int) $pdo->lastInsertId();

        // Otomatis buat 1 Workspace Utama untuk user baru
        $joinCode = generateJoinCode($pdo);
        $wsName = "Workspace {$name}";
        $wsDesc = "Ruang kerja utama untuk manajemen tugas proyek";

        $wsStmt = $pdo->prepare("INSERT INTO workspaces (name, description, join_code, created_by, created_at) VALUES (:name, :desc, :code, :created_by, NOW())");
        $wsStmt->execute([
            ':name' => $wsName,
            ':desc' => $wsDesc,
            ':code' => $joinCode,
            ':created_by' => $userId
        ]);
        $wsId = (int) $pdo->lastInsertId();

        // Tambahkan user sebagai owner di workspace_members
        $memStmt = $pdo->prepare("INSERT INTO workspace_members (workspace_id, user_id, role, joined_at) VALUES (:ws_id, :user_id, 'owner', NOW())");
        $memStmt->execute([
            ':ws_id' => $wsId,
            ':user_id' => $userId
        ]);

        // Berikan contoh task selamat datang di workspace baru
        $taskStmt = $pdo->prepare("INSERT INTO tasks (workspace_id, user_id, title, description, status, created_at) VALUES (:ws_id, :uid, :title, :desc, :status, NOW())");
        $taskStmt->execute([
            ':ws_id' => $wsId,
            ':uid' => $userId,
            ':title' => 'Selamat datang di Kanban Board!',
            ':desc' => 'Ini adalah workspace pertama Anda. Anda dapat mengundang teman dengan kode unik di atas.',
            ':status' => 'todo'
        ]);
        $taskStmt->execute([
            ':ws_id' => $wsId,
            ':uid' => $userId,
            ':title' => 'Bagikan Kode Workspace',
            ':desc' => 'Salin kode unik dan kirimkan ke rekan tim Anda untuk mulai berkolaborasi.',
            ':status' => 'in-progress'
        ]);

        $userData = [
            'id' => $userId,
            'name' => $name,
            'email' => $email,
            'default_workspace_id' => $wsId
        ];

        http_response_code(201);
        echo json_encode([
            "status" => "success",
            "message" => "Registrasi berhasil! Workspace perdana telah dibuat.",
            "data" => [
                "user" => $userData
            ]
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Database error saat registrasi: " . $e->getMessage()]);
    }
}

/**
 * Handle Login Pengguna
 */
function handleLogin($pdo, $input) {
    $email = strtolower(trim($input['email'] ?? ''));
    $password = $input['password'] ?? '';

    if (empty($email) || empty($password)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Email dan password wajib diisi"]);
        return;
    }

    try {
        $stmt = $pdo->prepare("SELECT id, name, email, password FROM users WHERE email = :email");
        $stmt->execute([':email' => $email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password'])) {
            http_response_code(401);
            echo json_encode(["status" => "error", "message" => "Email atau password yang Anda masukkan salah"]);
            return;
        }

        // Ambil workspace pertama yang dimiliki atau diikuti user
        $wsStmt = $pdo->prepare("SELECT w.id FROM workspaces w INNER JOIN workspace_members wm ON w.id = wm.workspace_id WHERE wm.user_id = :uid ORDER BY wm.id ASC LIMIT 1");
        $wsStmt->execute([':uid' => $user['id']]);
        $firstWs = $wsStmt->fetch();

        $userData = [
            'id' => (int) $user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'default_workspace_id' => $firstWs ? (int) $firstWs['id'] : null
        ];

        echo json_encode([
            "status" => "success",
            "message" => "Login berhasil! Selamat datang kembali, " . htmlspecialchars($user['name']),
            "data" => [
                "user" => $userData
            ]
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Database error saat login: " . $e->getMessage()]);
    }
}

/**
 * Handle Get Profile
 */
function handleGetProfile($pdo) {
    $userId = isset($_GET['user_id']) ? (int) $_GET['user_id'] : 0;
    if (!$userId) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "user_id wajib disertakan"]);
        return;
    }

    try {
        $stmt = $pdo->prepare("SELECT id, name, email, created_at FROM users WHERE id = :id");
        $stmt->execute([':id' => $userId]);
        $user = $stmt->fetch();

        if (!$user) {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "Pengguna tidak ditemukan"]);
            return;
        }

        $user['id'] = (int) $user['id'];
        echo json_encode([
            "status" => "success",
            "data" => $user
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
    }
}

/**
 * Helper Generate Unique Join Code (Format: EXA-XXXX)
 */
function generateJoinCode($pdo) {
    $chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    $maxAttempts = 10;
    
    for ($i = 0; $i < $maxAttempts; $i++) {
        $random = '';
        for ($c = 0; $c < 5; $c++) {
            $random .= $chars[rand(0, strlen($chars) - 1)];
        }
        $code = "EXA-" . $random;

        $check = $pdo->prepare("SELECT id FROM workspaces WHERE join_code = :code");
        $check->execute([':code' => $code]);
        if (!$check->fetch()) {
            return $code;
        }
    }
    return "EXA-" . strtoupper(substr(uniqid(), -5));
}
