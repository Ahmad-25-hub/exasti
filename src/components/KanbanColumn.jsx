import React, { useState } from 'react';
import TaskCard from './TaskCard';
import { Plus, Inbox } from 'lucide-react';

export default function KanbanColumn({
  column,
  tasks,
  onMoveTask,
  onDeleteTask,
  onOpenAddModal,
  onEditTask,
}) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!isDragOver) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e) => {
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskIdStr = e.dataTransfer.getData('taskId');
    if (taskIdStr) {
      const parsedId = Number(taskIdStr);
      onMoveTask(parsedId, column.id);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col bg-slate-100/90 rounded-2xl border-2 transition-all duration-200 min-h-[550px] ${
        isDragOver
          ? 'border-dashed border-indigo-500 bg-indigo-50/50 shadow-inner'
          : 'border-slate-200/80 shadow-xs'
      }`}
    >
      {/* Column Header */}
      <div className={`p-4 rounded-t-2xl border-t-4 bg-white border-b border-slate-200/80 ${column.headerAccent}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${column.indicatorBg}`} />
            <h3 className="font-bold text-slate-800 text-base tracking-tight">
              {column.title}
            </h3>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${column.badgeColor}`}>
              {tasks.length}
            </span>
          </div>

          <button
            onClick={() => onOpenAddModal(column.id)}
            title={`Tambah task ke ${column.title}`}
            className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <p className="mt-1 text-xs text-slate-500 line-clamp-1">
          {column.description}
        </p>
      </div>

      {/* Task List / Drop Zone */}
      <div className="flex-1 p-3 space-y-3 overflow-y-auto max-h-[calc(100vh-280px)]">
        {tasks.length === 0 ? (
          <div className="h-44 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-center p-4">
            <div className="w-10 h-10 rounded-full bg-slate-200/60 flex items-center justify-center text-slate-400 mb-2">
              <Inbox className="w-5 h-5" />
            </div>
            <p className="text-xs font-medium text-slate-500">
              Belum ada task di kolom ini
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Tarik task ke sini atau buat yang baru
            </p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onMoveTask={onMoveTask}
              onDeleteTask={onDeleteTask}
              onEditTask={onEditTask}
            />
          ))
        )}
      </div>

      {/* Column Footer: Quick Add Button */}
      <div className="p-3 pt-0">
        <button
          onClick={() => onOpenAddModal(column.id)}
          className="w-full py-2 px-3 rounded-xl border border-dashed border-slate-300 hover:border-indigo-400 bg-white/60 hover:bg-white text-slate-600 hover:text-indigo-600 text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs hover:shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Task</span>
        </button>
      </div>
    </div>
  );
}
