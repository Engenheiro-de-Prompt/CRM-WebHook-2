
export enum Status {
  ToDo = 'A Fazer',
  InProgress = 'Em Progresso',
  Done = 'Concluído',
}

export enum Priority {
  Low = 'Baixa',
  Medium = 'Média',
  High = 'Alta',
  Urgent = 'Urgente',
}

export interface CustomField {
  id: string;
  key: string;
  value: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  tags: string[];
  customFields: CustomField[];
  timeSpent: number; // in seconds
  createdAt: string;
  updatedAt: string;
}