import React, { useContext } from 'react';
import { TaskContext } from '../context/TaskContext';

const LogPanel: React.FC = () => {
  const { logs } = useContext(TaskContext);

  if (!logs.length) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black bg-opacity-80 text-green-400 text-xs max-h-40 overflow-y-auto p-2 font-mono z-50">
      {logs.map((log, index) => (
        <div key={index} className="whitespace-pre-wrap">{log}</div>
      ))}
    </div>
  );
};

export default LogPanel;
