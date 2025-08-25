import React, { useContext, useMemo } from 'react';
import { TaskContext } from '../context/TaskContext';
import { ITask, TaskPriority } from '../types';
import TaskCard from './TaskCard';
import { SpinnerIcon } from './Icons';

const priorityOrder: { [key in TaskPriority]: number } = {
  high: 1,
  med: 2,
  low: 3,
};

const TodayView: React.FC = () => {
  const { tasks } = useContext(TaskContext);

  const groupedAndSortedTasks = useMemo(() => {
    if (!tasks) return {};

    // 1. Group by folder_path
    const grouped = tasks.reduce((acc, task) => {
      const key = task.folder_path || 'Sem Pasta';
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(task);
      return acc;
    }, {} as { [key: string]: ITask[] });

    // 2. Sort tasks within each group by priority
    for (const folderPath in grouped) {
      grouped[folderPath].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    }

    return grouped;
  }, [tasks]);

  if (tasks === undefined) {
    return (
      <div className="flex justify-center items-center h-full">
        <SpinnerIcon className="w-10 h-10 text-accent" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-6">Hoje</h1>

      {tasks.length === 0 ? (
        <div className="text-center text-text-secondary py-10">
          <p>Nenhuma tarefa agendada para hoje ou atrasada. Bom trabalho!</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedAndSortedTasks).map(([folderPath, tasksInGroup]) => (
            <div key={folderPath}>
              <h2 className="text-xl font-semibold text-text-primary mb-4 border-b border-border-color pb-2">
                {folderPath}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {tasksInGroup.map(task => (
                  <TaskCard key={task.task_id} task={task} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TodayView;
