
import React from 'react';
import { Status, Task } from '../types';
import TaskCard from './TaskCard';

interface KanbanColumnProps {
  status: Status;
  tasks: Task[];
}

const statusColors: { [key in Status]: string } = {
  [Status.ToDo]: 'border-t-red-500',
  [Status.InProgress]: 'border-t-yellow-500',
  [Status.Done]: 'border-t-green-500',
};

const KanbanColumn: React.FC<KanbanColumnProps> = ({ status, tasks }) => {
  return (
    <div className={`bg-secondary rounded-lg shadow-xl p-4 flex flex-col border-t-4 ${statusColors[status]}`}>
      <h2 className="text-lg font-bold text-text-primary mb-4 flex justify-between items-center">
        <span>{status}</span>
        <span className="text-sm font-normal bg-primary text-text-secondary rounded-full px-2 py-1">{tasks.length}</span>
      </h2>
      <div className="space-y-4 overflow-y-auto flex-grow h-96 pr-2">
        {tasks.length > 0 ? (
          tasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))
        ) : (
          <div className="text-center text-text-secondary py-10">
            <p>Nenhuma tarefa aqui.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;