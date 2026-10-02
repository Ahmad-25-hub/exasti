import React, { useState } from 'react';
import { 
  Trash2, 
  Pencil,
  Calendar, 
  ArrowRight, 
  ArrowLeft, 
  GripVertical,
  CheckCircle2,
  Clock,
  CircleDot
} from 'lucide-react';

export default function TaskCard({ task, onMoveTask, onDeleteTask, onEditTask }) {
  const [isDeleting, setIsDeleting] = useState(false);

  // Status configuration details
  const statusMeta = {
    'todo': {
      label: 'To Do',
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: CircleDot,
    },
    'in-progress': {
      label: 'In Progress',
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: Clock,
    },
    'done': {
      label: 'Done',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCircle2,
    },
  };

  const currentMeta = statusMeta[task.status] || statusMeta['todo'];
  const StatusIcon = currentMeta.icon;

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
          <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border ${currentMeta.color}`}>
            <StatusIcon className="w-3 h-3" />
            {currentMeta.label}
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

      {/* Footer: Date and Move Action Controls */}
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

        {/* Move Buttons */}
        <div className="flex items-center gap-1">
          {task.status === 'in-progress' && (
            <button
              onClick={() => onMoveTask(task.id, 'todo')}
              title="Pindahkan ke To Do"
              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-md bg-slate-50 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 border border-slate-200 text-slate-600 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>To Do</span>
            </button>
          )}

          {task.status === 'done' && (
            <button
              onClick={() => onMoveTask(task.id, 'in-progress')}
              title="Kembalikan ke In Progress"
              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-md bg-slate-50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200 text-slate-600 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>In Progress</span>
            </button>
          )}

          {task.status === 'todo' && (
            <button
              onClick={() => onMoveTask(task.id, 'in-progress')}
              title="Pindahkan ke In Progress"
              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-md bg-slate-50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200 text-slate-600 transition-colors cursor-pointer"
            >
              <span>Progress</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}

          {task.status === 'in-progress' && (
            <button
              onClick={() => onMoveTask(task.id, 'done')}
              title="Pindahkan ke Done"
              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-md bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 border border-slate-200 text-slate-600 transition-colors cursor-pointer"
            >
              <span>Done</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}

          {task.status === 'done' && (
            <button
              onClick={() => onMoveTask(task.id, 'todo')}
              title="Pindahkan kembali ke To Do"
              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-md bg-slate-50 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 border border-slate-200 text-slate-600 transition-colors cursor-pointer"
            >
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
