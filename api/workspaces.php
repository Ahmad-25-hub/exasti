<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($method) {
    case 'GET':
        if (!empty($_GET['id'])) {
            handleGetWorkspaceDetail($pdo, (int)$_GET['id']);
        } elseif (!empty($_GET['user_id'])) {
            handleGetUserWorkspaces($pdo, (int)$_GET['user_id']);
        } else {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Parameter user_id atau id wajib disertakan"]);
        }
        break;

    case 'POST':
        $rawInput = file_get_contents('php://input');
        $input = json_decode($rawInput, true) ?: [];

        if (empty($action) && isset($input['action'])) {
            $action = $input['action'];
        }

        if ($action === 'create') {
            handleCreateWorkspace($pdo, $input);
        } elseif ($action === 'join') {
            handleJoinWorkspace($pdo, $input);
        } else {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Aksi tidak valid. Gunakan action=create atau action=join"]);
        }
        break;

    case 'DELETE':
        handleDeleteWorkspace($pdo);
        break;

    default:
        http_response_code(405);
        echo json_encode(["status" => "error", "message" => "Metode HTTP '{$method}' tidak diizinkan"]);
        break;
}

/**
 * Mengambil daftar workspace yang diikuti oleh seorang user
 */
function handleGetUserWorkspaces($pdo, $userId) {
    try {
        $stmt = $pdo->prepare("
            SELECT 
                w.id,
                w.name,
                w.description,
                w.join_code,
                w.created_by,
                w.created_at,
                wm.role,
                u.name AS owner_name,
                (SELECT COUNT(*) FROM workspace_members WHERE workspace_id = w.id) AS total_members,
                (SELECT COUNT(*) FROM tasks WHERE workspace_id = w.id) AS total_tasks
            FROM workspaces w
            INNER JOIN workspace_members wm ON w.id = wm.workspace_id
            INNER JOIN users u ON w.created_by = u.id
            WHERE wm.user_id = :uid
            ORDER BY w.id DESC
        ");
        $stmt->execute([':uid' => $userId]);
        $workspaces = $stmt->fetchAll();

        foreach ($workspaces as &$ws) {
            $ws['id'] = (int) $ws['id'];
            $ws['created_by'] = (int) $ws['created_by'];
            $ws['total_members'] = (int) $ws['total_members'];
            $ws['total_tasks'] = (int) $ws['total_tasks'];
        }

        echo json_encode([
            "status" => "success",
            "data" => $workspaces
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
    }
}

/**
 * Mengambil detail 1 workspace beserta daftar anggotanya
 */
function handleGetWorkspaceDetail($pdo, $workspaceId) {
    try {
        $stmt = $pdo->prepare("
            SELECT w.*, u.name AS owner_name
            FROM workspaces w
            INNER JOIN users u ON w.created_by = u.id
            WHERE w.id = :id
        ");
        $stmt->execute([':id' => $workspaceId]);
        $ws = $stmt->fetch();

        if (!$ws) {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "Workspace tidak ditemukan"]);
            return;
        }

        $ws['id'] = (int) $ws['id'];

        // Ambil daftar anggota
        $memStmt = $pdo->prepare("
            SELECT u.id, u.name, u.email, wm.role, wm.joined_at
            FROM workspace_members wm
            INNER JOIN users u ON wm.user_id = u.id
            WHERE wm.workspace_id = :id
            ORDER BY wm.role ASC, wm.joined_at ASC
        ");
        $memStmt->execute([':id' => $workspaceId]);
        $members = $memStmt->fetchAll();
        foreach ($members as &$m) {
            $m['id'] = (int) $m['id'];
        }

        $ws['members'] = $members;

        echo json_encode([
            "status" => "success",
            "data" => $ws
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
    }
}

/**
 * Membuat Workspace Baru
 */
function handleCreateWorkspace($pdo, $input) {
    $name = trim($input['name'] ?? '');
    $description = trim($input['description'] ?? '');
    $userId = (int) ($input['user_id'] ?? 0);

    if (empty($name) || !$userId) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Nama workspace dan user_id wajib diisi"]);
        return;
    }

    try {
        $joinCode = generateUniqueJoinCode($pdo);

        $stmt = $pdo->prepare("INSERT INTO workspaces (name, description, join_code, created_by, created_at) VALUES (:name, :desc, :code, :uid, NOW())");
        $stmt->execute([
            ':name' => $name,
            ':desc' => $description,
            ':code' => $joinCode,
            ':uid' => $userId
        ]);

        $workspaceId = (int) $pdo->lastInsertId();

        // Tambahkan pembuat sebagai owner
        $memStmt = $pdo->prepare("INSERT INTO workspace_members (workspace_id, user_id, role, joined_at) VALUES (:ws_id, :uid, 'owner', NOW())");
        $memStmt->execute([
            ':ws_id' => $workspaceId,
            ':uid' => $userId
        ]);

        // Berikan 1 contoh task perdana
        $taskStmt = $pdo->prepare("INSERT INTO tasks (workspace_id, user_id, title, description, status, created_at) VALUES (:ws_id, :uid, 'Rencana Tugas Pertama', 'Buat dan atur task pertama untuk workspace ini', 'todo', NOW())");
        $taskStmt->execute([':ws_id' => $workspaceId, ':uid' => $userId]);

        echo json_encode([
            "status" => "success",
            "message" => "Workspace '{$name}' berhasil dibuat!",
            "data" => [
                "id" => $workspaceId,
                "name" => $name,
                "description" => $description,
                "join_code" => $joinCode,
                "created_by" => $userId,
                "role" => "owner"
            ]
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
    }
}

/**
 * Bergabung ke Workspace Menggunakan Kode Undangan
 */
function handleJoinWorkspace($pdo, $input) {
    $joinCode = strtoupper(trim($input['join_code'] ?? ''));
    $userId = (int) ($input['user_id'] ?? 0);

    if (empty($joinCode) || !$userId) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Kode workspace dan user_id wajib diisi"]);
        return;
    }

    try {
        // Cari workspace berdasarkan join_code
        $stmt = $pdo->prepare("SELECT * FROM workspaces WHERE join_code = :code");
        $stmt->execute([':code' => $joinCode]);
        $ws = $stmt->fetch();

        if (!$ws) {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "Kode workspace '{$joinCode}' tidak ditemukan. Mohon periksa kembali."]);
            return;
        }

        $workspaceId = (int) $ws['id'];

        // Periksa apakah user sudah bergabung sebelumnya
        $checkStmt = $pdo->prepare("SELECT id FROM workspace_members WHERE workspace_id = :ws_id AND user_id = :uid");
        $checkStmt->execute([':ws_id' => $workspaceId, ':uid' => $userId]);
        if ($checkStmt->fetch()) {
            http_response_code(400);
            echo json_encode([
                "status" => "error", 
                "message" => "Anda sudah menjadi anggota di workspace '{$ws['name']}'.",
                "data" => $ws
            ]);
            return;
        }

        // Tambahkan ke anggota sebagai 'member'
        $addStmt = $pdo->prepare("INSERT INTO workspace_members (workspace_id, user_id, role, joined_at) VALUES (:ws_id, :uid, 'member', NOW())");
        $addStmt->execute([':ws_id' => $workspaceId, ':uid' => $userId]);

        echo json_encode([
            "status" => "success",
            "message" => "Berhasil bergabung ke workspace '{$ws['name']}'!",
            "data" => [
                "id" => $workspaceId,
                "name" => $ws['name'],
                "description" => $ws['description'],
                "join_code" => $ws['join_code'],
                "role" => "member"
            ]
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
    }
}

/**
 * Menghapus workspace (Hanya pembuat/owner)
 */
function handleDeleteWorkspace($pdo) {
    $workspaceId = isset($_GET['id']) ? (int) $_GET['id'] : 0;
    $userId = isset($_GET['user_id']) ? (int) $_GET['user_id'] : 0;

    if (!$workspaceId || !$userId) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "id workspace dan user_id wajib disertakan"]);
        return;
    }

    try {
        $stmt = $pdo->prepare("SELECT created_by, name FROM workspaces WHERE id = :id");
        $stmt->execute([':id' => $workspaceId]);
        $ws = $stmt->fetch();

        if (!$ws) {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "Workspace tidak ditemukan"]);
            return;
        }

        if ((int) $ws['created_by'] !== $userId) {
            http_response_code(403);
            echo json_encode(["status" => "error", "message" => "Hanya pembuat workspace yang dapat menghapus workspace ini"]);
            return;
        }

        $delStmt = $pdo->prepare("DELETE FROM workspaces WHERE id = :id");
        $delStmt->execute([':id' => $workspaceId]);

        echo json_encode([
            "status" => "success",
            "message" => "Workspace '{$ws['name']}' berhasil dihapus",
            "data" => ["id" => $workspaceId]
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
    }
}

function generateUniqueJoinCode($pdo) {
    $chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    for ($i = 0; $i < 10; $i++) {
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
