
import { TaskStatus, TaskPriority } from './types';

export const STATUSES: TaskStatus[] = ['backlog', 'doing', 'blocked', 'done'];
export const PRIORITIES: TaskPriority[] = ['low', 'med', 'high'];

export const STATUS_LABELS: { [key in TaskStatus]: string } = {
  backlog: 'Backlog',
  doing: 'Em Progresso',
  blocked: 'Bloqueado',
  done: 'Concluído',
};

export const PRIORITY_LABELS: { [key in TaskPriority]: string } = {
  low: 'Baixa',
  med: 'Média',
  high: 'Alta',
};

export const PRIORITY_COLORS: { [key in TaskPriority]: string } = {
  low: 'bg-green-500',
  med: 'bg-blue-500',
  high: 'bg-red-500',
};
