
import React, { useContext } from 'react';
import { ITask, TaskStatus } from '../types';
import { STATUS_LABELS } from '../constants';
import { TaskContext } from '../context/TaskContext';
import TaskCard from './TaskCard';

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: ITask[];
}

const statusBorders: { [key in TaskStatus]: string } = {
  backlog: 'border-t-gray-400',
  doing: 'border-t-blue-500',
  blocked: 'border-t-red-500',
  done: 'border-t-green-500',
};

const KanbanColumn: React.FC<KanbanColumnProps> = ({ status, tasks }) => {
  const { saveTask } = useContext(TaskContext);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    // Avoid re-saving if the status is the same
    const task = tasks.find(t => t.task_id === taskId);
    if (task && task.status !== status) {
      await saveTask({ task_id: taskId, status: status });
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`bg-secondary rounded-lg shadow-xl p-4 flex flex-col border-t-4 ${statusBorders[status]}`}
    >
      <h2 className="text-lg font-bold text-text-primary mb-4 flex justify-between items-center">
        <span>{STATUS_LABELS[status]}</span>
        <span className="text-sm font-normal bg-primary text-text-secondary rounded-full px-2 py-1">{tasks.length}</span>
      </h2>
      <div className="space-y-4 overflow-y-auto flex-grow h-96 pr-2">
        {tasks.length > 0 ? (
          tasks.map(task => (
            <TaskCard key={task.task_id} task={task} />
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