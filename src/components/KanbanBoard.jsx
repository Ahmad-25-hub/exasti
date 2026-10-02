import React from 'react';
import KanbanColumn from './KanbanColumn';
import { COLUMNS } from '../data/initialTasks';

export default function KanbanBoard({
  tasks,
  onMoveTask,
  onDeleteTask,
  onOpenAddModal,
  onEditTask,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
      {COLUMNS.map((column) => {
        const columnTasks = tasks.filter((task) => task.status === column.id);

        return (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={columnTasks}
            onMoveTask={onMoveTask}
            onDeleteTask={onDeleteTask}
            onOpenAddModal={onOpenAddModal}
            onEditTask={onEditTask}
          />
        );
      })}
    </div>
  );
}
