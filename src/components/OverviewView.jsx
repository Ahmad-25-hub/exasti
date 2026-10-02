import React from 'react';
import { 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  ListTodo, 
  ArrowLeft, 
  Plus, 
  Kanban, 
  Users, 
  KeyRound, 
  Sparkles,
  TrendingUp,
  Building2
} from 'lucide-react';

export default function OverviewView({
  currentWorkspace,
  tasks,
  taskCounts,
  onBackToBoard,
  onOpenAddModal,
  onOpenTeamView,
}) {
  const { total = 0, todo = 0, inProgress = 0, done = 0 } = taskCounts || {};
  const completionPercentage = total > 0 ? Math.round((done / total) * 100) : 0;

  // Recent 5 tasks
  const recentTasks = [...tasks].slice(0, 5);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'done':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-2.5 h-2.5" />
            <span>Selesai</span>
          </span>
        );
      case 'in-progress':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-2.5 h-2.5" />
            <span>Dikerjakan</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <ListTodo className="w-2.5 h-2.5" />
            <span>To Do</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button
            onClick={onBackToBoard}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 mb-2 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Papan Kanban</span>
          </button>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-600" />
            <span>Ringkasan &amp; Statistik Proyek</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Pantau progres dan produktivitas tim di workspace <strong>{currentWorkspace?.name}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenAddModal('todo')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Task</span>
          </button>
          <button
            onClick={onBackToBoard}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
          >
            <Kanban className="w-3.5 h-3.5 text-indigo-600" />
            <span>Buka Board</span>
          </button>
        </div>
      </div>

      {/* Progress Completion Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Tingkat Penyelesaian
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-3xl font-extrabold text-slate-900">
                {completionPercentage}%
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                ({done} dari {total} task selesai)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold">
            {completionPercentage === 100 && total > 0 ? (
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Semua task selesai! Luar biasa!
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                {total - done} task tersisa
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden p-0.5 border border-slate-200/60">
          <div
            className="bg-gradient-to-r from-indigo-500 via-indigo-600 to-emerald-500 h-full rounded-full transition-all duration-500 shadow-xs"
            style={{ width: `${Math.max(completionPercentage, total === 0 ? 0 : 3)}%` }}
          />
        </div>

        {/* Progress Breakdown Indicators */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100 text-center">
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold">To Do</p>
            <p className="text-sm font-extrabold text-amber-600 mt-0.5">{todo}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold">In Progress</p>
            <p className="text-sm font-extrabold text-blue-600 mt-0.5">{inProgress}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold">Done</p>
            <p className="text-sm font-extrabold text-emerald-600 mt-0.5">{done}</p>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tasks Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Total Tugas</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Kanban className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{total}</p>
          <p className="text-[11px] text-slate-400 mt-1">Di dalam workspace ini</p>
        </div>

        {/* To Do Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Belum Dimulai</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ListTodo className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-amber-600 mt-2">{todo}</p>
          <p className="text-[11px] text-slate-400 mt-1">Menunggu dikerjakan</p>
        </div>

        {/* In Progress Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Dalam Proses</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-blue-600 mt-2">{inProgress}</p>
          <p className="text-[11px] text-slate-400 mt-1">Sedang aktif dikerjakan</p>
        </div>

        {/* Done Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Selesai</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-600 mt-2">{done}</p>
          <p className="text-[11px] text-slate-400 mt-1">Telah diselesaikan</p>
        </div>
      </div>

      {/* Bottom Section: Workspace Metadata & Recent Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workspace Info Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Informasi Workspace</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Nama Workspace</p>
              <p className="font-bold text-slate-800 text-sm mt-0.5">
                {currentWorkspace?.name}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {currentWorkspace?.description || 'Tanpa deskripsi tambahan'}
              </p>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-2 text-slate-600">
                <KeyRound className="w-4 h-4 text-amber-500" />
                <span className="font-semibold">Kode Undangan</span>
              </div>
              <span className="font-mono font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                {currentWorkspace?.join_code}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-2 text-slate-600">
                <Users className="w-4 h-4 text-purple-500" />
                <span className="font-semibold">Total Anggota</span>
              </div>
              <button
                onClick={onOpenTeamView}
                className="font-bold text-indigo-600 hover:underline cursor-pointer"
              >
                {currentWorkspace?.total_members || 1} Orang (Lihat)
              </button>
            </div>
          </div>
        </div>

        {/* Recent Tasks List */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Tugas Terbaru ({recentTasks.length})
            </h3>
            <button
              onClick={onBackToBoard}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
            >
              Lihat di Board &rarr;
            </button>
          </div>

          {recentTasks.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">
              Belum ada tugas di workspace ini. Klik &ldquo;Tambah Task&rdquo; untuk memulai!
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      {task.creator_name && <span>Oleh: <strong>{task.creator_name}</strong></span>}
                      {task.created_at && (
                        <>
                          <span>•</span>
                          <span>{task.created_at}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0">
                    {getStatusBadge(task.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
