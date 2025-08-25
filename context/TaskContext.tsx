
import React, { createContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { Task } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { postTaskToSheet } from '../services/webhookService';

interface TaskContextType {
  tasks: Task[];
  saveTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> | Task) => void;
  deleteTask: (id: string) => void;
  isModalOpen: boolean;
  currentTask: Task | null;
  openModal: (task?: Task) => void;
  closeModal: () => void;
}

export const TaskContext = createContext<TaskContextType>({} as TaskContextType);

interface TaskProviderProps {
  children: ReactNode;
  webhookUrl: string | null;
}

export const TaskProvider: React.FC<TaskProviderProps> = ({ children, webhookUrl }) => {
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);

  // Clear tasks if webhookUrl is cleared
  useEffect(() => {
    if(!webhookUrl) {
      setTasks([]);
    }
  }, [webhookUrl, setTasks]);

  const openModal = useCallback((task?: Task) => {
    setCurrentTask(task || null);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setCurrentTask(null);
  }, []);

  const saveTask = useCallback((taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> | Task) => {
    let taskToSave: Task;

    if ('id' in taskData) {
      // It's an existing task
      taskToSave = { ...taskData, updatedAt: new Date().toISOString() };
      setTasks(prevTasks => prevTasks.map(t => t.id === taskData.id ? taskToSave : t));
    } else {
      // It's a new task
      const now = new Date().toISOString();
      taskToSave = {
        ...taskData,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      };
      setTasks(prevTasks => [...prevTasks, taskToSave]);
    }
    
    if (webhookUrl) {
        postTaskToSheet(webhookUrl, taskToSave);
    }

    closeModal();
  }, [setTasks, closeModal, webhookUrl]);

  const deleteTask = useCallback((id: string) => {
    setTasks(prevTasks => prevTasks.filter(t => t.id !== id));
    // Note: The provided webhook script does not support deletion.
    // This action only affects the local state.
    // A log could be sent to mark it as 'deleted' if desired.
    closeModal();
  }, [setTasks, closeModal]);

  return (
    <TaskContext.Provider value={{ tasks, saveTask, deleteTask, isModalOpen, currentTask, openModal, closeModal }}>
      {children}
    </TaskContext.Provider>
  );
};
