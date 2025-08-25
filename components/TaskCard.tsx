
import React, { useContext } from 'react';
import { ITask } from '../types';
import { PRIORITY_COLORS, PRIORITY_LABELS } from '../constants';
import { TaskContext } from '../context/TaskContext';
import { ClockIcon, TagIcon } from './Icons';

interface TaskCardProps {
  task: ITask;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
    const { openModal } = useContext(TaskContext);

    const formatMinutes = (totalMinutes: number) => {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m`;
    };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("taskId", task.task_id);
  };

  return (
    <div 
        draggable
        onDragStart={handleDragStart}
        onClick={() => openModal(task)}
        className="bg-primary rounded-lg p-4 shadow-lg border border-border-color hover:border-accent cursor-pointer transition-all duration-200 transform hover:-translate-y-1"
    >
      <div className="flex justify-between items-start">
        <h3 className="font-bold text-text-primary mb-2 pr-2">{task.title}</h3>
        <span className={`px-2 py-1 text-xs font-semibold text-white rounded-full ${PRIORITY_COLORS[task.priority]}`}>
          {PRIORITY_LABELS[task.priority]}
        </span>
      </div>
      {task.description && (
        <p className="text-sm text-text-secondary mb-3 break-words">
          {task.description.substring(0, 100)}{task.description.length > 100 ? '...' : ''}
        </p>
      )}
      
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <TagIcon className="w-4 h-4 text-text-secondary" />
          {task.tags.slice(0, 3).map(tag => (
            <span key={tag} className="bg-border-color text-text-secondary text-xs font-medium px-2 py-1 rounded-full">{tag}</span>
          ))}
        </div>
      )}
      
      <div className="flex justify-between items-center text-xs text-text-secondary mt-2">
        <div className="flex items-center space-x-1">
          <ClockIcon className="w-4 h-4" />
          <span>{formatMinutes(task.tracked_total_min)}</span>
        </div>
        <span>{new Date(task.created_at).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

export default TaskCard;
