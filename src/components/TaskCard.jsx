import React, { useState } from 'react';
import { 
  Trash2, 
  Pencil,
  Calendar, 
  ArrowRight, 
  ArrowLeft, 
  GripVertical,
  CircleDot
} from 'lucide-react';

export default function TaskCard({ 
  task, 
  columns = [],
  onMoveTask, 
  onDeleteTask, 
  onEditTask 
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  // Cari metadata kolom saat ini dari daftar columns dinamis
  const currentCol = columns.find((c) => c.id === task.status);
  const currentTitle = currentCol ? currentCol.title : task.status;
  const badgeColor = currentCol?.badgeColor || 'bg-slate-100 text-slate-700 border-slate-200';

  // Posisi prev & next column
  const currentIndex = columns.findIndex((c) => c.id === task.status);
  const prevCol = currentIndex > 0 ? columns[currentIndex - 1] : null;
  const nextCol = currentIndex >= 0 && currentIndex < columns.length - 1 ? columns[currentIndex + 1] : null;

  const handleDragStart = (e) => {
    e.dataTransfer.setData('taskId', String(task.id));
    e.dataTransfer.effectAllowed = 'move';
  };

  const confirmDelete = () => {
    if (isDeleting) {
      onDeleteTask(task.id);
    } else {
      setIsDeleting(true);
      setTimeout(() => setIsDeleting(false), 3500);
    }
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="group relative bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col gap-3 cursor-grab active:cursor-grabbing"
    >
      {/* Top Header: ID badge, Status, and Actions (Edit & Delete) */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-300 group-hover:text-slate-400 transition-colors">
            <GripVertical className="w-3.5 h-3.5" />
          </span>
          <span className="text-[11px] font-mono font-semibold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
            #{task.id}
          </span>
          <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border ${badgeColor}`}>
            <CircleDot className="w-3 h-3" />
            <span className="max-w-[120px] truncate">{currentTitle}</span>
          </span>
        </div>

        {/* Action Buttons: Edit & Delete */}
        <div className="flex items-center gap-1">
          {onEditTask && (
            <button
              onClick={() => onEditTask(task)}
              title="Edit task (Judul & Deskripsi)"
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={confirmDelete}
            title={isDeleting ? 'Klik lagi untuk konfirmasi hapus dari MySQL' : 'Hapus task'}
            className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              isDeleting
                ? 'bg-rose-600 text-white hover:bg-rose-700 animate-pulse'
                : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
            }`}
          >
            {isDeleting ? (
              <span className="flex items-center gap-1 px-1">
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yakin?</span>
              </span>
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Main Content: Title & Description */}
      <div>
        <h4 className="font-semibold text-slate-900 text-sm leading-snug group-hover:text-indigo-950">
          {task.title}
        </h4>
        {task.description && (
          <p className="mt-1.5 text-xs text-slate-600 leading-relaxed line-clamp-3">
            {task.description}
          </p>
        )}
      </div>

      {/* Footer: Date, Creator and Move Action Controls */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium flex-wrap">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            <span>{task.created_at}</span>
          </div>
          {task.creator_name && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold border border-slate-200">
              {task.creator_name}
            </span>
          )}
        </div>

        {/* Dynamic Move Buttons */}
        <div className="flex items-center gap-1">
          {prevCol && (
            <button
              onClick={() => onMoveTask(task.id, prevCol.id)}
              title={`Pindahkan ke ${prevCol.title}`}
              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-md bg-slate-50 hover:bg-slate-100 hover:text-slate-800 border border-slate-200 text-slate-600 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3 h-3" />
              <span className="max-w-[65px] truncate">{prevCol.title}</span>
            </button>
          )}

          {nextCol && (
            <button
              onClick={() => onMoveTask(task.id, nextCol.id)}
              title={`Pindahkan ke ${nextCol.title}`}
              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-md bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-800 border border-indigo-200 text-indigo-700 transition-colors cursor-pointer"
            >
              <span className="max-w-[65px] truncate">{nextCol.title}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
