import React, { useState } from 'react';
import TaskCard from './TaskCard';
import { Plus, Inbox, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

export default function KanbanColumn({
  column,
  columns = [],
  tasks,
  onMoveTask,
  onDeleteTask,
  onOpenAddModal,
  onEditTask,
  onEditColumn,
  onDeleteColumn,
  canDelete = true,
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

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

  const handleDeleteClick = () => {
    if (isConfirmingDelete) {
      if (onDeleteColumn) {
        onDeleteColumn(column);
      }
      setIsConfirmingDelete(false);
      setShowMenu(false);
    } else {
      setIsConfirmingDelete(true);
      setTimeout(() => setIsConfirmingDelete(false), 3500);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col bg-slate-100/90 rounded-2xl border-2 transition-all duration-200 min-h-[550px] w-80 shrink-0 ${
        isDragOver
          ? 'border-dashed border-indigo-500 bg-indigo-50/50 shadow-inner'
          : 'border-slate-200/80 shadow-xs'
      }`}
    >
      {/* Column Header */}
      <div className={`p-4 rounded-t-2xl border-t-4 bg-white border-b border-slate-200/80 relative ${column.headerAccent || 'border-t-indigo-500'}`}>
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-2 min-w-0">
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${column.indicatorBg || 'bg-indigo-500'}`} />
            <h3 className="font-bold text-slate-800 text-base tracking-tight truncate" title={column.title}>
              {column.title}
            </h3>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border shrink-0 ${column.badgeColor || 'bg-indigo-100 text-indigo-800 border-indigo-200'}`}>
              {tasks.length}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Add Task Button */}
            <button
              onClick={() => onOpenAddModal(column.id)}
              title={`Tambah task ke ${column.title}`}
              className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>

            {/* Column Options Menu Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMenu(!showMenu)}
                title="Opsi Kolom Board"
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {/* Dropdown Menu */}
              {showMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-20" 
                    onClick={() => { setShowMenu(false); setIsConfirmingDelete(false); }} 
                  />
                  <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 animate-in fade-in duration-100 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        if (onEditColumn) onEditColumn(column);
                      }}
                      className="w-full px-3 py-2 text-left flex items-center gap-2 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5 text-slate-400" />
                      <span>Edit Kolom</span>
                    </button>

                    {canDelete && (
                      <button
                        type="button"
                        onClick={handleDeleteClick}
                        className={`w-full px-3 py-2 text-left flex items-center gap-2 transition-colors cursor-pointer ${
                          isConfirmingDelete 
                            ? 'bg-rose-50 text-rose-700 font-bold' 
                            : 'text-rose-600 hover:bg-rose-50'
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{isConfirmingDelete ? 'Yakin Hapus Kolom?' : 'Hapus Kolom'}</span>
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>

          </div>
        </div>

        {column.description && (
          <p className="mt-1 text-xs text-slate-500 line-clamp-1" title={column.description}>
            {column.description}
          </p>
        )}
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
              columns={columns}
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
