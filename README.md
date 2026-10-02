# Kanban Board - Multi-Workspace & Tim Kolaborasi (React + PHP + MySQL)

Aplikasi Web **Kanban Board** kolaboratif yang mengintegrasikan frontend **React (Vite + Tailwind CSS)** dengan backend **REST API PHP** dan database **MySQL di XAMPP**.

Aplikasi ini mendukung **Sistem Autentikasi Pengguna**, **Multi-Workspace**, dan fitur **Gabung Tim via Kode Undangan Unik**.

---

## 🌟 Fitur Utama

1. **Sistem Autentikasi (Login & Register)**:
   - Pengguna dapat mendaftar dengan nama, email, dan password terenkripsi (BCrypt).
   - Login aman dengan verifikasi password.
   - Sesi login tersimpan secara persisten.
   - Tersedia tombol **1-Klik Akun Demo** untuk kemudahan demonstrasi tugas kuliah (`Ahmad` & `Siti`).

2. **Multi-Workspace & Kolaborasi Tim**:
   - Setiap pengguna baru otomatis memiliki workspace utama.
   - Pengguna dapat membuat **Workspace Baru** tanpa batas.
   - Setiap workspace memiliki **Kode Undangan Unik** (contoh: `EXA-95Z2X`).
   - Anggota tim dapat **Bergabung ke Workspace** hanya dengan memasukkan kode undangan tersebut.
   - Mendukung peran (*role*): `Owner` dan `Member`.

3. **Kanban Board Terisolasi per Workspace**:
   - Setiap workspace memiliki papan tugas (Kanban Board) sendiri yang tidak bercampur dengan workspace lain.
   - 3 Kolom Status: **To Do**, **In Progress**, dan **Done**.
   - Setiap task menampilkan judul, deskripsi, timestamp, dan **Nama Pembuat Task** (`creator_name`).
   - Fitur CRUD Task lengkap: Tambah (POST), Edit Judul/Deskripsi (PUT), Pindah Kolom (PUT via Drag-and-Drop / Tombol Cepat), dan Hapus (DELETE).

---

## 🗄️ Skema Database MySQL (`exasti`)

1. **`users`**:
   - `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
   - `name` (VARCHAR 100)
   - `email` (VARCHAR 191, UNIQUE)
   - `password` (VARCHAR 255, HASHED BCRYPT)
   - `created_at` (DATETIME)

2. **`workspaces`**:
   - `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
   - `name` (VARCHAR 100)
   - `description` (VARCHAR 255)
   - `join_code` (VARCHAR 20, UNIQUE)
   - `created_by` (INT, FK -> users.id)
   - `created_at` (DATETIME)

3. **`workspace_members`**:
   - `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
   - `workspace_id` (INT, FK -> workspaces.id)
   - `user_id` (INT, FK -> users.id)
   - `role` (ENUM: `'owner'`, `'member'`)
   - `joined_at` (DATETIME)

4. **`tasks`**:
   - `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
   - `workspace_id` (INT, FK -> workspaces.id)
   - `user_id` (INT, FK -> users.id)
   - `title` (VARCHAR 255)
   - `description` (TEXT)
   - `status` (ENUM: `'todo'`, `'in-progress'`, `'done'`)
   - `created_at` (DATETIME)

---

## 🌐 Endpoint REST API PHP

| Method | Endpoint | Fungsi |
|---|---|---|
| `POST` | `/api/auth.php?action=register` | Registrasi akun baru + auto generate workspace |
| `POST` | `/api/auth.php?action=login` | Login akun |
| `GET` | `/api/workspaces.php?user_id={id}` | Ambil semua workspace yang diikuti user |
| `POST` | `/api/workspaces.php?action=create` | Buat workspace baru + generate kode |
| `POST` | `/api/workspaces.php?action=join` | Gabung workspace menggunakan kode undangan |
| `GET` | `/api/tasks.php?workspace_id={id}` | Ambil daftar task di workspace aktif |
| `POST` | `/api/tasks.php` | Tambah task ke workspace |
| `PUT` | `/api/tasks.php?id={id}` | Update status / edit task |
| `DELETE` | `/api/tasks.php?id={id}` | Hapus task |

---

## 🚀 Cara Menjalankan Project

1. **Nyalakan XAMPP**:
   - Buka XAMPP Control Panel.
   - Pastikan **Apache** dan **MySQL** aktif (**Running**).

2. **Jalankan Frontend React**:
   ```powershell
   cd c:\lomba\exasti
   npm run dev
   ```

3. **Buka di Browser**:
   - Akses: **`http://localhost:5173`**
   - Masuk menggunakan tombol **Akun Demo Cepat** (atau daftar akun baru).
   - Coba salin kode undangan dari header dan buka di jendela incognito untuk bergabung dengan akun kedua!
