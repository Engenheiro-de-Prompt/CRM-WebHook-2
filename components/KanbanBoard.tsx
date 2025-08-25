
import React, { useContext } from 'react';
import { TaskContext } from '../context/TaskContext';
import { STATUSES } from '../constants';
import KanbanColumn from './KanbanColumn';
import TaskModal from './TaskModal';
import { SpinnerIcon } from './Icons';

const KanbanBoard: React.FC = () => {
  const { tasks, isModalOpen, openModal } = useContext(TaskContext);

  if (tasks === undefined) {
    return (
      <div className="flex justify-center items-center h-full">
        <SpinnerIcon className="w-10 h-10 text-accent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
       <div className="mb-6 flex justify-end">
          <button
            onClick={() => openModal()}
            className="px-5 py-2.5 bg-accent text-white font-bold rounded-lg shadow-lg hover:bg-accent-hover transition-transform transform hover:scale-105 duration-300 ease-in-out"
          >
            + Adicionar Nova Tarefa
          </button>
        </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {STATUSES.map(status => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={tasks.filter(task => task.status === status)}
          />
        ))}
      </div>
      {isModalOpen && <TaskModal />}
    </div>
  );
};

export default KanbanBoard;