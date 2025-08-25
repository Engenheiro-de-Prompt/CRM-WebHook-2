
// --- Interfaces based on the product specification ---

export type TaskStatus = 'backlog' | 'doing' | 'blocked' | 'done';
export type TaskPriority = 'low' | 'med' | 'high';

export interface ITask {
  task_id: string; // Primary Key
  version: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  tags?: string[];
  folder_id: string; // Foreign Key to IFolder
  folder_path: string;
  created_at: string; // ISO Date String
  updated_at: string; // ISO Date String
  scheduled_for?: string; // YYYY-MM-DD
  tracked_total_min: number;
}

export interface IFolder {
  folder_id: string; // Primary Key
  created_at: string; // ISO Date String
  name: string;
  path: string; // e.g., "Work/Client X"
  parent_folder_id?: string; // Optional for root folders
}

// --- Webhook Event related types ---

export interface ITaskSnapshot {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  tags?: string[];
  folder_id: string;
  folder_path: string;
  created_at: string;
  updated_at: string;
  scheduled_for?: string;
  tracked_total_min: number;
}

export interface IWebhookPayload {
  task_id: string;
  version: number;
  snapshot: ITaskSnapshot;
  change_delta_tracked_min?: number;
}

export interface IWebhookEvent {
  event_type: 'task.created' | 'task.updated' | 'folder.created';
  idempotency_key: string;
  payload: IWebhookPayload | IFolder;
}