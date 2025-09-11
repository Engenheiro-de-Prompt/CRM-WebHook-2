
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

// Represents a task as it comes from the Google Sheet via the backend API.
// It's a flexible record of string key-value pairs.
export interface SheetTask {
  [key: string]: string;
}

// Represents the structure of the API response from the backend.
export interface CategorizedTasks {
  today: SheetTask[];
  overdue: SheetTask[];
  upcoming: SheetTask[];
}