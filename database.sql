-- Skema Database MySQL untuk Aplikasi Kanban Board Exasti

CREATE DATABASE IF NOT EXISTS `exasti` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `exasti`;

-- 1. Tabel users
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(191) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabel workspaces
CREATE TABLE IF NOT EXISTS `workspaces` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `description` VARCHAR(255) DEFAULT '',
    `join_code` VARCHAR(20) NOT NULL UNIQUE,
    `created_by` INT NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_workspaces_users` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabel workspace_members
CREATE TABLE IF NOT EXISTS `workspace_members` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `workspace_id` INT NOT NULL,
    `user_id` INT NOT NULL,
    `role` ENUM('owner', 'member') NOT NULL DEFAULT 'member',
    `joined_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `unique_ws_user` (`workspace_id`, `user_id`),
    CONSTRAINT `fk_wm_workspaces` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_wm_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Tabel workspace_columns (Kolom / Board Kustom per Workspace)
CREATE TABLE IF NOT EXISTS `workspace_columns` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `workspace_id` INT NOT NULL,
    `column_key` VARCHAR(100) NOT NULL,
    `title` VARCHAR(100) NOT NULL,
    `description` VARCHAR(255) DEFAULT '',
    `color` VARCHAR(50) DEFAULT 'indigo',
    `position` INT NOT NULL DEFAULT 0,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `unique_ws_col` (`workspace_id`, `column_key`),
    CONSTRAINT `fk_col_workspaces` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Tabel tasks
CREATE TABLE IF NOT EXISTS `tasks` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `workspace_id` INT NULL,
    `user_id` INT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `status` VARCHAR(100) NOT NULL DEFAULT 'todo',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_tasks_workspaces` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_tasks_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed Data Akun Demo
INSERT INTO `users` (`id`, `name`, `email`, `password`, `created_at`) VALUES
(1, 'Ahmad', 'ahmad@example.com', '$2y$10$n0ODupTqW24Y7jGEvh3rOuh8t0LAZLbJd66c0LucLGzK6thxtLPAS', NOW()),
(2, 'Siti', 'siti@example.com', '$2y$10$n0ODupTqW24Y7jGEvh3rOuh8t0LAZLbJd66c0LucLGzK6thxtLPAS', NOW())
ON DUPLICATE KEY UPDATE `id`=`id`;

-- Seed Workspace Utama
INSERT INTO `workspaces` (`id`, `name`, `description`, `join_code`, `created_by`, `created_at`) VALUES
(1, 'Workspace Tim Unggul', 'Ruang kolaborasi tugas akhir & lomba teknologi informasi', 'EXA-95Z2X', 1, NOW())
ON DUPLICATE KEY UPDATE `id`=`id`;

-- Seed Membership
INSERT INTO `workspace_members` (`id`, `workspace_id`, `user_id`, `role`, `joined_at`) VALUES
(1, 1, 1, 'owner', NOW()),
(2, 1, 2, 'member', NOW())
ON DUPLICATE KEY UPDATE `id`=`id`;

-- Seed Default Columns untuk Workspace 1
INSERT INTO `workspace_columns` (`id`, `workspace_id`, `column_key`, `title`, `description`, `color`, `position`, `created_at`) VALUES
(1, 1, 'todo', 'To Do', 'Tugas yang baru direncanakan atau siap dikerjakan', 'amber', 0, NOW()),
(2, 1, 'in-progress', 'In Progress', 'Tugas yang sedang dalam tahap pengerjaan aktif', 'blue', 1, NOW()),
(3, 1, 'done', 'Done', 'Tugas yang sudah selesai dan terverifikasi', 'emerald', 2, NOW())
ON DUPLICATE KEY UPDATE `id`=`id`;

-- Seed Initial Tasks
INSERT INTO `tasks` (`id`, `workspace_id`, `user_id`, `title`, `description`, `status`, `created_at`) VALUES
(1, 1, 1, 'Riset Kebutuhan Pengguna', 'Wawancara calon pengguna untuk memetakan alur kerja manajemen tugas harian.', 'todo', NOW()),
(2, 1, 2, 'Desain Wireframe UI/UX', 'Membuat rancangan tampilan halaman utama, layout kolom kanban, dan modal input.', 'todo', NOW()),
(3, 1, 1, 'Slicing Komponen Frontend', 'Membangun komponen Navbar, KanbanBoard, KanbanColumn, dan TaskCard menggunakan Tailwind CSS.', 'in-progress', NOW()),
(4, 1, 2, 'Implementasi State Management', 'Menghubungkan state React untuk operasi create, delete, dan update status antar kolom.', 'in-progress', NOW()),
(5, 1, 1, 'Inisialisasi Repositori Project', 'Setup Vite, React, konfigurasi Tailwind CSS, dan struktur folder awal.', 'done', NOW()),
(6, 1, 2, 'Penyusunan Jadwal & Milestone', 'Menentukan pembagian sesi pengerjaan tugas kuliah dari frontend hingga integrasi backend.', 'done', NOW())
ON DUPLICATE KEY UPDATE `id`=`id`;
