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
export const COLOR_THEMES = {
  amber: {
    name: 'Kuning / Amber',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    headerAccent: 'border-t-amber-500',
    indicatorBg: 'bg-amber-500',
    dotColor: 'bg-amber-500',
  },
  blue: {
    name: 'Biru',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    headerAccent: 'border-t-blue-500',
    indicatorBg: 'bg-blue-500',
    dotColor: 'bg-blue-500',
  },
  emerald: {
    name: 'Hijau / Emerald',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    headerAccent: 'border-t-emerald-500',
    indicatorBg: 'bg-emerald-500',
    dotColor: 'bg-emerald-500',
  },
  indigo: {
    name: 'Indigo',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    headerAccent: 'border-t-indigo-500',
    indicatorBg: 'bg-indigo-500',
    dotColor: 'bg-indigo-500',
  },
  purple: {
    name: 'Ungu / Purple',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    headerAccent: 'border-t-purple-500',
    indicatorBg: 'bg-purple-500',
    dotColor: 'bg-purple-500',
  },
  rose: {
    name: 'Merah / Rose',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    headerAccent: 'border-t-rose-500',
    indicatorBg: 'bg-rose-500',
    dotColor: 'bg-rose-500',
  },
  cyan: {
    name: 'Cyan / Teal',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    headerAccent: 'border-t-cyan-500',
    indicatorBg: 'bg-cyan-500',
    dotColor: 'bg-cyan-500',
  },
  orange: {
    name: 'Orange',
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',
    headerAccent: 'border-t-orange-500',
    indicatorBg: 'bg-orange-500',
    dotColor: 'bg-orange-500',
  },
  slate: {
    name: 'Abu-abu / Slate',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
    headerAccent: 'border-t-slate-500',
    indicatorBg: 'bg-slate-500',
    dotColor: 'bg-slate-500',
  },
};

export function formatColumn(col) {
  const colorKey = (col.color && COLOR_THEMES[col.color]) ? col.color : 'indigo';
  const theme = COLOR_THEMES[colorKey] || COLOR_THEMES.indigo;
  return {
    id: col.column_key || col.id,
    column_id: col.id,
    title: col.title,
    description: col.description || '',
    color: colorKey,
    position: col.position ?? 0,
    badgeColor: theme.badgeColor,
    headerAccent: theme.headerAccent,
    indicatorBg: theme.indicatorBg,
  };
}

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

