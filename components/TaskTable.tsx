import React from 'react';
import { SheetTask } from '../types';
import { Icons } from './Icons';

interface TaskTableProps {
  title: string;
  tasks: SheetTask[];
}

const TaskTable: React.FC<TaskTableProps> = ({ title, tasks }) => {
  if (tasks.length === 0) {
    return (
      <div className="bg-primary-foreground rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-text-primary mb-4">{title}</h2>
        <p className="text-text-secondary">Nenhuma tarefa encontrada nesta categoria.</p>
      </div>
    );
  }

  // Dynamically get headers from the first task, but prioritize common ones.
  const allHeaders = Object.keys(tasks[0]);
  const preferredHeaders = ['task name', 'priority', 'status', 'due date', 'assignee'];
  const headers = preferredHeaders.filter(h => allHeaders.includes(h));
  // Add any remaining headers
  allHeaders.forEach(h => {
    if (!headers.includes(h)) {
      headers.push(h);
    }
  });


  return (
    <div className="bg-primary-foreground rounded-lg shadow-md p-4 sm:p-6 mb-8 overflow-x-auto">
      <h2 className="text-2xl font-bold text-text-primary mb-4">{title}</h2>
      <div className="w-full">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-primary">
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider"
                >
                  {header.replace(/_/g, ' ')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-primary-foreground divide-y divide-border">
            {tasks.map((task, index) => (
              <tr key={index} className="hover:bg-muted/50">
                {headers.map((header) => (
                  <td
                    key={header}
                    className="px-6 py-4 whitespace-nowrap text-sm text-text-primary"
                  >
                    {task[header] || 'N/A'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaskTable;
