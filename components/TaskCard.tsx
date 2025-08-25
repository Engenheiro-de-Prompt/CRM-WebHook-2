
import React, { useContext } from 'react';
import { Task } from '../types';
import { PRIORITY_COLORS } from '../constants';
import { TaskContext } from '../context/TaskContext';
import { ClockIcon } from './Icons';

interface TaskCardProps {
  task: Task;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
    const { openModal } = useContext(TaskContext);

    const formatTime = (totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

  return (
    <div 
        onClick={() => openModal(task)}
        className="bg-primary rounded-lg p-4 shadow-lg border border-border-color hover:border-accent cursor-pointer transition-all duration-200 transform hover:-translate-y-1"
    >
      <div className="flex justify-between items-start">
        <h3 className="font-bold text-text-primary mb-2 pr-2">{task.title}</h3>
        <span className={`px-2 py-1 text-xs font-semibold text-white rounded-full ${PRIORITY_COLORS[task.priority]}`}>
          {task.priority}
        </span>
      </div>
      <p className="text-sm text-text-secondary mb-3 break-words">{task.description.substring(0, 100)}{task.description.length > 100 ? '...' : ''}</p>
      
      {task.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
              {task.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="bg-border-color text-text-secondary text-xs font-medium px-2 py-1 rounded-full">{tag}</span>
              ))}
          </div>
      )}
      
      <div className="flex justify-between items-center text-xs text-text-secondary mt-2">
        <div className="flex items-center space-x-1">
            <ClockIcon className="w-4 h-4" />
            <span>{formatTime(task.timeSpent)}</span>
        </div>
        <span>{new Date(task.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

export default TaskCard;
