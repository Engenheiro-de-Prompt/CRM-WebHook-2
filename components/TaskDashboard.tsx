import React, { useState, useEffect } from 'react';
import { fetchTasks } from '../services/taskService';
import { CategorizedTasks } from '../types';
import TaskTable from './TaskTable';
import { Icons } from './Icons';

const TaskDashboard: React.FC = () => {
  const [tasks, setTasks] = useState<CategorizedTasks | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        const fetchedTasks = await fetchTasks();
        setTasks(fetchedTasks);
        setError(null);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-center">
        <Icons.spinner className="h-12 w-12 animate-spin text-accent mb-4" />
        <p className="text-text-secondary">Carregando tarefas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-center bg-destructive/10 border border-destructive rounded-lg p-8">
        <Icons.error className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-bold text-destructive mb-2">Erro ao Carregar Tarefas</h2>
        <p className="text-text-destructive max-w-md">{error}</p>
        <p className="text-text-secondary mt-4 text-sm">
          Por favor, verifique se o servidor backend está rodando e se as configurações no arquivo <code>.env</code> estão corretas.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-text-primary mb-6">Visão Geral das Tarefas</h1>
      {tasks && (
        <>
          <TaskTable title="Tarefas para Hoje" tasks={tasks.today} />
          <TaskTable title="Tarefas Atrasadas" tasks={tasks.overdue} />
          <TaskTable title="Próximas Tarefas (7 dias)" tasks={tasks.upcoming} />
        </>
      )}
    </div>
  );
};

export default TaskDashboard;
