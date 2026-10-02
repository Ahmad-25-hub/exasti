import React from 'react';
import KanbanColumn from './KanbanColumn';
import { Plus, LayoutGrid } from 'lucide-react';

export default function KanbanBoard({
  columns = [],
  tasks = [],
  onMoveTask,
  onDeleteTask,
  onOpenAddModal,
  onEditTask,
  onOpenAddColumnModal,
  onEditColumn,
  onDeleteColumn,
}) {
  return (
    <div className="w-full">
      {/* Horizontally scrollable flex container for dynamic multi-columns */}
      <div className="flex items-start gap-6 overflow-x-auto pb-6 pt-1 select-none">
        
        {/* Render Each Dynamic Column */}
        {columns.map((column) => {
          const columnTasks = tasks.filter((task) => task.status === column.id);

          return (
            <KanbanColumn
              key={column.id}
              column={column}
              columns={columns}
              tasks={columnTasks}
              onMoveTask={onMoveTask}
              onDeleteTask={onDeleteTask}
              onOpenAddModal={onOpenAddModal}
              onEditTask={onEditTask}
              onEditColumn={onEditColumn}
              onDeleteColumn={onDeleteColumn}
              canDelete={columns.length > 1}
            />
          );
        })}

        {/* Add Column Card Button at the end */}
        <div className="w-80 shrink-0">
          <button
            type="button"
            onClick={onOpenAddColumnModal}
            className="w-full h-32 rounded-2xl border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-white/40 hover:bg-indigo-50/40 text-slate-500 hover:text-indigo-600 transition-all flex flex-col items-center justify-center gap-2 p-5 cursor-pointer shadow-2xs hover:shadow-sm group"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-indigo-600 text-slate-500 group-hover:text-white flex items-center justify-center transition-all shadow-xs">
              <Plus className="w-5 h-5" />
            </div>
            <div className="text-center">
              <span className="text-sm font-bold block">Tambah Kolom Board</span>
              <span className="text-[11px] text-slate-400 group-hover:text-indigo-500 font-medium">
                Sesuaikan alur kerja tim Anda
              </span>
            </div>
          </button>
        </div>

      </div>
    </div>
  );
}
