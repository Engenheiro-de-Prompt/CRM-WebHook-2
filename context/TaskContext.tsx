
import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../services/db';
import { ITask, IWebhookEvent, ITaskSnapshot } from '../types';
import { postEventToWebhook } from '../services/webhookService';

interface TaskContextType {
  tasks: ITask[] | undefined; // Undefined during initial load
  saveTask: (task: Partial<ITask>, sessionMinutes?: number) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  isModalOpen: boolean;
  currentTask: ITask | null;
  openModal: (task?: ITask) => void;
  closeModal: () => void;
  logs: string[];
  addLog: (message: string) => void;
}

export const TaskContext = createContext<TaskContextType>({} as TaskContextType);

interface TaskProviderProps {
  children: ReactNode;
  webhookUrl: string | null;
  activeView?: string | null;
  tagQuery?: string;
}

export const TaskProvider: React.FC<TaskProviderProps> = ({ children, webhookUrl, activeView, tagQuery }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<ITask | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const rawTasks = useLiveQuery(
    () => {
      if (activeView === 'today') {
        const today = new Date();
        today.setHours(23, 59, 59, 999); // Include all of today
        const todayISO = today.toISOString().split('T')[0];
        return db.tasks.where('scheduled_for').belowOrEqual(todayISO).toArray();
      }
      // if activeView is null, show all tasks. If it's a string, filter by folder_id
      if (activeView) {
        return db.tasks.where('folder_id').equals(activeView).toArray();
      }
      return db.tasks.toArray();
    },
    [activeView] // Rerun query when activeView changes
    // No default value, will be undefined on first render
  );

  const filteredTasks = React.useMemo(() => {
    if (!rawTasks) return undefined; // Pass undefined through if still loading
    if (!tagQuery || tagQuery.trim() === '') {
      return rawTasks;
    }
    const lowerCaseQuery = tagQuery.toLowerCase();
    return rawTasks.filter(task =>
      task.tags?.some(tag => tag.toLowerCase().includes(lowerCaseQuery))
    );
  }, [rawTasks, tagQuery]);

  const addLog = useCallback((message: string) => {
    setLogs(prev => [...prev.slice(-50), `${new Date().toISOString()} - ${message}`]);
  }, []);

  const openModal = useCallback((task?: ITask) => {
    setCurrentTask(task || null);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setCurrentTask(null);
  }, []);

  const saveTask = useCallback(async (taskData: Partial<ITask>, sessionMinutes = 0) => {
    const isNewTask = !taskData.task_id;
    const now = new Date().toISOString();

    let taskToSave: ITask;
    let change_delta_tracked_min: number | undefined = undefined;

    if (isNewTask) {
      const isFolderView = activeView && activeView !== 'today';
      taskToSave = {
        task_id: uuidv4(),
        version: 1,
        created_at: now,
        updated_at: now,
        status: 'backlog',
        priority: 'med',
        tracked_total_min: sessionMinutes,
        folder_id: isFolderView ? activeView : taskData.folder_id || '',
        folder_path: taskData.folder_path || 'Caixa de Entrada',
        ...taskData,
        title: taskData.title || 'Nova Tarefa',
      };
      await db.tasks.add(taskToSave);
      addLog(`Nova tarefa criada: ${taskToSave.title}`);
    } else {
      const existingTask = await db.tasks.get(taskData.task_id!);
      if (!existingTask) {
        addLog(`Erro: Tarefa com ID ${taskData.task_id} não encontrada.`);
        return;
      }
      const newTotalTime = (existingTask.tracked_total_min || 0) + sessionMinutes;
      if (sessionMinutes > 0) {
        change_delta_tracked_min = sessionMinutes;
      }
      taskToSave = {
        ...existingTask,
        ...taskData,
        version: existingTask.version + 1,
        updated_at: now,
        tracked_total_min: newTotalTime,
      };
      await db.tasks.put(taskToSave);
      addLog(`Tarefa atualizada: ${taskToSave.title}`);
    }
    
    if (webhookUrl) {
      addLog(`Preparando evento de webhook para: ${taskToSave.title}`);

      const snapshot: ITaskSnapshot = {
        title: taskToSave.title,
        description: taskToSave.description,
        status: taskToSave.status,
        priority: taskToSave.priority,
        tags: taskToSave.tags,
        folder_id: taskToSave.folder_id,
        folder_path: taskToSave.folder_path,
        created_at: taskToSave.created_at,
        updated_at: taskToSave.updated_at,
        scheduled_for: taskToSave.scheduled_for,
        tracked_total_min: taskToSave.tracked_total_min,
      };

      const event: IWebhookEvent = {
        event_type: isNewTask ? 'task.created' : 'task.updated',
        idempotency_key: uuidv4(),
        payload: {
          task_id: taskToSave.task_id,
          version: taskToSave.version,
          snapshot: snapshot,
          change_delta_tracked_min: change_delta_tracked_min,
        },
      };

      try {
        await postEventToWebhook(webhookUrl, event);
        addLog(`Evento enviado com sucesso para: ${taskToSave.title}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        addLog(`Falha ao enviar evento: ${errorMessage}`);
      }
    }

    closeModal();
  }, [addLog, closeModal, activeView, webhookUrl]);

  const deleteTask = useCallback(async (taskId: string) => {
    await db.tasks.delete(taskId);
    addLog(`Tarefa removida: ${taskId}`);
    // Note: The spec doesn't mention a 'task.deleted' event.
    // This is a local-only operation for now.
  }, [addLog]);

  return (
    <TaskContext.Provider value={{ tasks: filteredTasks, saveTask, deleteTask, isModalOpen, currentTask, openModal, closeModal, logs, addLog }}>
      {children}
    </TaskContext.Provider>
  );
};
