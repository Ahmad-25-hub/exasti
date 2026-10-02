<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        handleGetTasks($pdo);
        break;
    case 'POST':
        handleCreateTask($pdo);
        break;
    case 'PUT':
        handleUpdateTask($pdo);
        break;
    case 'DELETE':
        handleDeleteTask($pdo);
        break;
    default:
        http_response_code(405);
        echo json_encode(["status" => "error", "message" => "Metode HTTP '{$method}' tidak diizinkan"]);
        break;
}

/**
 * Normalisasi format status ('in_progress' <-> 'in-progress')
 */
function normalizeStatus($status) {
    if (!$status) return 'todo';
    $status = strtolower(trim($status));
    if ($status === 'in_progress' || $status === 'in-progress') {
        return 'in-progress';
    }
    if ($status === 'done') {
        return 'done';
    }
    return 'todo';
}

/**
 * 1. GET /api/tasks.php?workspace_id={workspace_id}
 * Mengambil daftar task dari database MySQL berdasarkan Workspace yang aktif
 */
function handleGetTasks($pdo) {
    $workspaceId = isset($_GET['workspace_id']) ? (int) $_GET['workspace_id'] : 0;

    try {
        if ($workspaceId > 0) {
            $stmt = $pdo->prepare("
                SELECT 
                    t.id, 
                    t.workspace_id, 
                    t.user_id, 
                    t.title, 
                    t.description, 
                    t.status, 
                    DATE_FORMAT(t.created_at, '%Y-%m-%d %H:%i') as created_at,
                    u.name as creator_name
                FROM tasks t
                LEFT JOIN users u ON t.user_id = u.id
                WHERE t.workspace_id = :ws_id
                ORDER BY t.id DESC
            ");
            $stmt->execute([':ws_id' => $workspaceId]);
        } else {
            // Fallback jika tidak ada workspace_id spesifik (ambil task umum/tanpa workspace)
            $stmt = $pdo->query("
                SELECT 
                    t.id, 
                    t.workspace_id, 
                    t.user_id, 
                    t.title, 
                    t.description, 
                    t.status, 
                    DATE_FORMAT(t.created_at, '%Y-%m-%d %H:%i') as created_at,
                    u.name as creator_name
                FROM tasks t
                LEFT JOIN users u ON t.user_id = u.id
                ORDER BY t.id DESC
            ");
        }

        $tasks = $stmt->fetchAll();
        
        foreach ($tasks as &$task) {
            $task['id'] = (int) $task['id'];
            $task['workspace_id'] = $task['workspace_id'] ? (int) $task['workspace_id'] : null;
            $task['user_id'] = $task['user_id'] ? (int) $task['user_id'] : null;
            if ($task['description'] === null) {
                $task['description'] = '';
            }
            $task['status'] = normalizeStatus($task['status']);
        }
        
        echo json_encode([
            "status" => "success",
            "message" => "Berhasil memuat daftar task",
            "data" => $tasks
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            "status" => "error",
            "message" => "Database error saat mengambil data: " . $e->getMessage()
        ]);
    }
}

/**
 * 2. POST /api/tasks.php
 * Menambahkan task baru dengan relasi ke workspace dan pembuatnya
 */
function handleCreateTask($pdo) {
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true);

    if (json_last_error() !== JSON_ERROR_NONE || empty($input['title'])) {
        http_response_code(400);
        echo json_encode([
            "status" => "error",
            "message" => "Format input tidak valid atau judul task masih kosong"
        ]);
        return;
    }

    $title = trim($input['title']);
    $description = isset($input['description']) ? trim($input['description']) : '';
    $status = normalizeStatus(isset($input['status']) ? $input['status'] : 'todo');
    $workspaceId = isset($input['workspace_id']) && (int)$input['workspace_id'] > 0 ? (int)$input['workspace_id'] : null;
    $userId = isset($input['user_id']) && (int)$input['user_id'] > 0 ? (int)$input['user_id'] : null;

    try {
        $stmt = $pdo->prepare("
            INSERT INTO tasks (workspace_id, user_id, title, description, status, created_at) 
            VALUES (:ws_id, :uid, :title, :description, :status, NOW())
        ");
        $stmt->execute([
            ':ws_id' => $workspaceId,
            ':uid' => $userId,
            ':title' => $title,
            ':description' => $description,
            ':status' => $status,
        ]);

        $lastId = (int) $pdo->lastInsertId();

        // Ambil data task yang baru saja dibuat
        $getStmt = $pdo->prepare("
            SELECT 
                t.id, 
                t.workspace_id, 
                t.user_id, 
                t.title, 
                t.description, 
                t.status, 
                DATE_FORMAT(t.created_at, '%Y-%m-%d %H:%i') as created_at,
                u.name as creator_name
            FROM tasks t
            LEFT JOIN users u ON t.user_id = u.id
            WHERE t.id = :id
        ");
        $getStmt->execute([':id' => $lastId]);
        $newTask = $getStmt->fetch();
        
        $newTask['id'] = (int) $newTask['id'];
        $newTask['workspace_id'] = $newTask['workspace_id'] ? (int) $newTask['workspace_id'] : null;
        $newTask['user_id'] = $newTask['user_id'] ? (int) $newTask['user_id'] : null;
        if ($newTask['description'] === null) {
            $newTask['description'] = '';
        }
        $newTask['status'] = normalizeStatus($newTask['status']);

        http_response_code(201);
        echo json_encode([
            "status" => "success",
            "message" => "Task berhasil ditambahkan",
            "data" => $newTask
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            "status" => "error",
            "message" => "Database error saat menyimpan task: " . $e->getMessage()
        ]);
    }
}

/**
 * 3 & 5. PUT /api/tasks.php?id={id}
 * Mengupdate status, judul, atau deskripsi task
 */
function handleUpdateTask($pdo) {
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true);

    $id = null;
    if (!empty($_GET['id'])) {
        $id = (int) $_GET['id'];
    } elseif (!empty($input['id'])) {
        $id = (int) $input['id'];
    }

    if (!$id) {
        http_response_code(400);
        echo json_encode([
            "status" => "error",
            "message" => "Parameter ID task wajib disertakan (misal: ?id=1 atau dalam JSON body)"
        ]);
        return;
    }

    try {
        $checkStmt = $pdo->prepare("SELECT * FROM tasks WHERE id = :id");
        $checkStmt->execute([':id' => $id]);
        $existing = $checkStmt->fetch();

        if (!$existing) {
            http_response_code(404);
            echo json_encode([
                "status" => "error",
                "message" => "Task dengan ID {$id} tidak ditemukan"
            ]);
            return;
        }

        $title = (isset($input['title']) && trim($input['title']) !== '') ? trim($input['title']) : $existing['title'];
        $description = isset($input['description']) ? trim($input['description']) : ($existing['description'] ?? '');
        $status = isset($input['status']) ? normalizeStatus($input['status']) : $existing['status'];

        $stmt = $pdo->prepare("UPDATE tasks SET title = :title, description = :description, status = :status WHERE id = :id");
        $stmt->execute([
            ':title' => $title,
            ':description' => $description,
            ':status' => $status,
            ':id' => $id,
        ]);

        $getStmt = $pdo->prepare("
            SELECT 
                t.id, 
                t.workspace_id, 
                t.user_id, 
                t.title, 
                t.description, 
                t.status, 
                DATE_FORMAT(t.created_at, '%Y-%m-%d %H:%i') as created_at,
                u.name as creator_name
            FROM tasks t
            LEFT JOIN users u ON t.user_id = u.id
            WHERE t.id = :id
        ");
        $getStmt->execute([':id' => $id]);
        $updatedTask = $getStmt->fetch();
        
        $updatedTask['id'] = (int) $updatedTask['id'];
        $updatedTask['workspace_id'] = $updatedTask['workspace_id'] ? (int) $updatedTask['workspace_id'] : null;
        $updatedTask['user_id'] = $updatedTask['user_id'] ? (int) $updatedTask['user_id'] : null;
        if ($updatedTask['description'] === null) {
            $updatedTask['description'] = '';
        }
        $updatedTask['status'] = normalizeStatus($updatedTask['status']);

        echo json_encode([
            "status" => "success",
            "message" => "Task berhasil diperbarui",
            "data" => $updatedTask
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            "status" => "error",
            "message" => "Database error saat memperbarui task: " . $e->getMessage()
        ]);
    }
}

/**
 * 4. DELETE /api/tasks.php?id={id}
 * Menghapus task dari database
 */
function handleDeleteTask($pdo) {
    $id = null;
    if (!empty($_GET['id'])) {
        $id = (int) $_GET['id'];
    } else {
        $rawInput = file_get_contents('php://input');
        $input = json_decode($rawInput, true);
        if (!empty($input['id'])) {
            $id = (int) $input['id'];
        }
    }

    if (!$id) {
        http_response_code(400);
        echo json_encode([
            "status" => "error",
            "message" => "Parameter ID task wajib disertakan (misal: ?id=1)"
        ]);
        return;
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM tasks WHERE id = :id");
        $stmt->execute([':id' => $id]);

        if ($stmt->rowCount() > 0) {
            echo json_encode([
                "status" => "success",
                "message" => "Task berhasil dihapus dari database",
                "data" => ["id" => $id]
            ]);
        } else {
            http_response_code(404);
            echo json_encode([
                "status" => "error",
                "message" => "Task tidak ditemukan atau sudah pernah dihapus"
            ]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            "status" => "error",
            "message" => "Database error saat menghapus task: " . $e->getMessage()
        ]);
    }
}
