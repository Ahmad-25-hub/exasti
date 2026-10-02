export const initialTasks = [
  {
    id: 1,
    title: 'Riset Kebutuhan Pengguna',
    description: 'Wawancara calon pengguna untuk memetakan alur kerja manajemen tugas harian.',
    status: 'todo',
    created_at: '2026-09-28 09:15',
  },
  {
    id: 2,
    title: 'Desain Wireframe UI/UX',
    description: 'Membuat rancangan tampilan halaman utama, layout kolom kanban, dan modal input.',
    status: 'todo',
    created_at: '2026-09-29 14:00',
  },
  {
    id: 3,
    title: 'Slicing Komponen Frontend',
    description: 'Membangun komponen Navbar, KanbanBoard, KanbanColumn, dan TaskCard menggunakan Tailwind CSS.',
    status: 'in-progress',
    created_at: '2026-09-30 11:20',
  },
  {
    id: 4,
    title: 'Implementasi State Management',
    description: 'Menghubungkan state React untuk operasi create, delete, dan update status antar kolom.',
    status: 'in-progress',
    created_at: '2026-10-01 08:45',
  },
  {
    id: 5,
    title: 'Inisialisasi Repositori Project',
    description: 'Setup Vite, React, konfigurasi Tailwind CSS, dan struktur folder awal.',
    status: 'done',
    created_at: '2026-09-27 16:30',
  },
  {
    id: 6,
    title: 'Penyusunan Jadwal & Milestone',
    description: 'Menentukan pembagian sesi pengerjaan tugas kuliah dari frontend hingga integrasi backend.',
    status: 'done',
    created_at: '2026-09-27 19:10',
  }
];

export const COLUMNS = [
  {
    id: 'todo',
    title: 'To Do',
    description: 'Tugas yang baru direncanakan atau siap dikerjakan',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    headerAccent: 'border-t-amber-500',
    indicatorBg: 'bg-amber-500',
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    description: 'Tugas yang sedang dalam tahap pengerjaan aktif',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    headerAccent: 'border-t-blue-500',
    indicatorBg: 'bg-blue-500',
  },
  {
    id: 'done',
    title: 'Done',
    description: 'Tugas yang sudah selesai dan terverifikasi',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    headerAccent: 'border-t-emerald-500',
    indicatorBg: 'bg-emerald-500',
  }
];
