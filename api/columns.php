<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($method) {
    case 'GET':
        handleGetColumns($pdo);
        break;
    case 'POST':
        $rawInput = file_get_contents('php://input');
        $input = json_decode($rawInput, true) ?: [];
        if (empty($action) && isset($input['action'])) {
            $action = $input['action'];
        }
        handleCreateColumn($pdo, $input);
        break;
    case 'PUT':
        handleUpdateColumn($pdo);
        break;
    case 'DELETE':
        handleDeleteColumn($pdo);
        break;
    default:
        http_response_code(405);
        echo json_encode(["status" => "error", "message" => "Metode HTTP '{$method}' tidak diizinkan"]);
        break;
}

/**
 * 1. GET /api/columns.php?workspace_id={id}
 * Mengambil daftar kolom/board per workspace. Jika belum ada, otomatis inisialisasi 3 kolom standar.
 */
function handleGetColumns($pdo) {
    $workspaceId = isset($_GET['workspace_id']) ? (int) $_GET['workspace_id'] : 0;

    if (!$workspaceId) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Parameter workspace_id wajib disertakan"]);
        return;
    }

    try {
        // Cek kolom yang ada
        $stmt = $pdo->prepare("SELECT * FROM workspace_columns WHERE workspace_id = :ws_id ORDER BY position ASC, id ASC");
        $stmt->execute([':ws_id' => $workspaceId]);
        $columns = $stmt->fetchAll();

        // Jika belum ada kolom (misal workspace baru dibuat), inisialisasi default 3 kolom
        if (empty($columns)) {
            $defaults = [
                ['todo', 'To Do', 'Tugas yang baru direncanakan atau siap dikerjakan', 'amber', 0],
                ['in-progress', 'In Progress', 'Tugas yang sedang dalam tahap pengerjaan aktif', 'blue', 1],
                ['done', 'Done', 'Tugas yang sudah selesai dan terverifikasi', 'emerald', 2],
            ];

            $insertStmt = $pdo->prepare("
                INSERT INTO workspace_columns (workspace_id, column_key, title, description, color, position, created_at)
                VALUES (:ws_id, :key, :title, :desc, :color, :pos, NOW())
            ");

            foreach ($defaults as $col) {
                $insertStmt->execute([
                    ':ws_id' => $workspaceId,
                    ':key' => $col[0],
                    ':title' => $col[1],
                    ':desc' => $col[2],
                    ':color' => $col[3],
                    ':pos' => $col[4],
                ]);
            }

            // Ambil ulang setelah di-seed
            $stmt->execute([':ws_id' => $workspaceId]);
            $columns = $stmt->fetchAll();
        }

        foreach ($columns as &$c) {
            $c['id'] = (int) $c['id'];
            $c['workspace_id'] = (int) $c['workspace_id'];
            $c['position'] = (int) $c['position'];
        }

        echo json_encode([
            "status" => "success",
            "data" => $columns
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Database error saat memuat kolom: " . $e->getMessage()]);
    }
}

/**
 * 2. POST /api/columns.php
 * Menambahkan kolom baru ke dalam workspace
 */
function handleCreateColumn($pdo, $input) {
    $workspaceId = (int) ($input['workspace_id'] ?? 0);
    $title = trim($input['title'] ?? '');
    $description = trim($input['description'] ?? '');
    $color = trim($input['color'] ?? 'indigo');

    if (!$workspaceId || empty($title)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "workspace_id dan title kolom wajib diisi"]);
        return;
    }

    try {
        // Buat slug column_key dari title
        $baseKey = strtolower(trim(preg_replace('/[^A-Za-z0-9]+/', '-', $title), '-'));
        if (empty($baseKey)) {
            $baseKey = 'col';
        }

        $columnKey = $baseKey;
        $counter = 1;

        // Pastikan unik dalam workspace
        while (true) {
            $checkStmt = $pdo->prepare("SELECT id FROM workspace_columns WHERE workspace_id = :ws_id AND column_key = :ck");
            $checkStmt->execute([':ws_id' => $workspaceId, ':ck' => $columnKey]);
            if (!$checkStmt->fetch()) {
                break;
            }
            $counter++;
            $columnKey = "{$baseKey}-{$counter}";
        }

        // Tentukan posisi berikutnya
        $posStmt = $pdo->prepare("SELECT COALESCE(MAX(position), -1) + 1 AS next_pos FROM workspace_columns WHERE workspace_id = :ws_id");
        $posStmt->execute([':ws_id' => $workspaceId]);
        $nextPos = (int) $posStmt->fetchColumn();

        $insert = $pdo->prepare("
            INSERT INTO workspace_columns (workspace_id, column_key, title, description, color, position, created_at)
            VALUES (:ws_id, :ck, :title, :desc, :color, :pos, NOW())
        ");
        $insert->execute([
            ':ws_id' => $workspaceId,
            ':ck' => $columnKey,
            ':title' => $title,
            ':desc' => $description,
            ':color' => $color,
            ':pos' => $nextPos,
        ]);

        $colId = (int) $pdo->lastInsertId();

        $getStmt = $pdo->prepare("SELECT * FROM workspace_columns WHERE id = :id");
        $getStmt->execute([':id' => $colId]);
        $newCol = $getStmt->fetch();
        $newCol['id'] = (int) $newCol['id'];
        $newCol['workspace_id'] = (int) $newCol['workspace_id'];
        $newCol['position'] = (int) $newCol['position'];

        http_response_code(201);
        echo json_encode([
            "status" => "success",
            "message" => "Kolom '{$title}' berhasil ditambahkan ke workspace",
            "data" => $newCol
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Database error saat membuat kolom: " . $e->getMessage()]);
    }
}

/**
 * 3. PUT /api/columns.php?id={id}
 * Memperbarui data kolom (title, description, color, position)
 */
function handleUpdateColumn($pdo) {
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true) ?: [];

    $id = isset($_GET['id']) ? (int) $_GET['id'] : (int) ($input['id'] ?? 0);

    if (!$id) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "ID kolom wajib disertakan"]);
        return;
    }

    try {
        $stmt = $pdo->prepare("SELECT * FROM workspace_columns WHERE id = :id");
        $stmt->execute([':id' => $id]);
        $existing = $stmt->fetch();

        if (!$existing) {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "Kolom tidak ditemukan"]);
            return;
        }

        $title = isset($input['title']) && trim($input['title']) !== '' ? trim($input['title']) : $existing['title'];
        $description = isset($input['description']) ? trim($input['description']) : $existing['description'];
        $color = isset($input['color']) ? trim($input['color']) : $existing['color'];
        $position = isset($input['position']) ? (int) $input['position'] : (int) $existing['position'];

        $update = $pdo->prepare("
            UPDATE workspace_columns 
            SET title = :title, description = :desc, color = :color, position = :pos 
            WHERE id = :id
        ");
        $update->execute([
            ':title' => $title,
            ':desc' => $description,
            ':color' => $color,
            ':pos' => $position,
            ':id' => $id
        ]);

        $stmt->execute([':id' => $id]);
        $updated = $stmt->fetch();
        $updated['id'] = (int) $updated['id'];
        $updated['workspace_id'] = (int) $updated['workspace_id'];
        $updated['position'] = (int) $updated['position'];

        echo json_encode([
            "status" => "success",
            "message" => "Kolom berhasil diperbarui",
            "data" => $updated
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Database error saat update kolom: " . $e->getMessage()]);
    }
}

/**
 * 4. DELETE /api/columns.php?id={id}
 * Menghapus kolom dari workspace dan mengamankan task yang ada di dalamnya
 */
function handleDeleteColumn($pdo) {
    $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
    if (!$id) {
        $rawInput = file_get_contents('php://input');
        $input = json_decode($rawInput, true) ?: [];
        $id = (int) ($input['id'] ?? 0);
    }

    if (!$id) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "ID kolom wajib disertakan"]);
        return;
    }

    try {
        $stmt = $pdo->prepare("SELECT * FROM workspace_columns WHERE id = :id");
        $stmt->execute([':id' => $id]);
        $col = $stmt->fetch();

        if (!$col) {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "Kolom tidak ditemukan"]);
            return;
        }

        $workspaceId = (int) $col['workspace_id'];
        $colKey = $col['column_key'];

        // Cek total kolom yang tersisa di workspace
        $countStmt = $pdo->prepare("SELECT COUNT(*) FROM workspace_columns WHERE workspace_id = :ws_id");
        $countStmt->execute([':ws_id' => $workspaceId]);
        $totalCols = (int) $countStmt->fetchColumn();

        if ($totalCols <= 1) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Tidak dapat menghapus kolom terakhir. Workspace minimal harus memiliki 1 kolom papan."]);
            return;
        }

        // Cari kolom lain untuk menampung task (jika ada task pada kolom yang akan dihapus)
        $fallbackStmt = $pdo->prepare("SELECT column_key FROM workspace_columns WHERE workspace_id = :ws_id AND id != :id ORDER BY position ASC LIMIT 1");
        $fallbackStmt->execute([':ws_id' => $workspaceId, ':id' => $id]);
        $fallbackKey = $fallbackStmt->fetchColumn();

        if ($fallbackKey) {
            // Pindahkan task dari kolom yang dihapus ke kolom fallback agar data tidak hilang
            $moveTasks = $pdo->prepare("UPDATE tasks SET status = :target WHERE workspace_id = :ws_id AND status = :old");
            $moveTasks->execute([
                ':target' => $fallbackKey,
                ':ws_id' => $workspaceId,
                ':old' => $colKey
            ]);
        }

        // Hapus kolom
        $del = $pdo->prepare("DELETE FROM workspace_columns WHERE id = :id");
        $del->execute([':id' => $id]);

        echo json_encode([
            "status" => "success",
            "message" => "Kolom '{$col['title']}' berhasil dihapus. Task di dalamnya dipindahkan ke kolom pertama.",
            "data" => [
                "id" => $id,
                "workspace_id" => $workspaceId,
                "fallback_column_key" => $fallbackKey
            ]
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Database error saat menghapus kolom: " . $e->getMessage()]);
    }
}
