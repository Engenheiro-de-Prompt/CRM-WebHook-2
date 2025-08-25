import Dexie, { Table } from 'dexie';
import { v4 as uuidv4 } from 'uuid';

// --- Interfaces based on the product specification ---

export interface ITask {
  task_id: string; // Primary Key
  version: number;
  title: string;
  description?: string;
  status: 'backlog' | 'doing' | 'blocked' | 'done';
  priority: 'low' | 'med' | 'high';
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

// --- Dexie DB Class ---

class LocalDB extends Dexie {
  tasks!: Table<ITask>;
  folders!: Table<IFolder>;

  constructor() {
    super('IntelliTaskDB');
    this.version(1).stores({
      // Primary key is task_id. Additional indexes for querying.
      tasks: 'task_id, status, priority, folder_id, scheduled_for, updated_at',
      // Primary key is folder_id. 'path' is indexed for easy lookups.
      folders: 'folder_id, path',
    });
  }
}

export const db = new LocalDB();

// --- Seed/Default Data (for initial setup) ---

db.on('populate', async () => {
  const rootFolderId = uuidv4();
  await db.folders.add({
    folder_id: rootFolderId,
    created_at: new Date().toISOString(),
    name: 'Caixa de Entrada',
    path: 'Caixa de Entrada',
  });

  await db.tasks.add({
    task_id: uuidv4(),
    version: 1,
    title: 'Bem-vindo ao seu novo gerenciador de tarefas!',
    description: 'Este é um app local-first. Suas tarefas ficam salvas no seu navegador e são sincronizadas com o Google Sheets.',
    status: 'backlog',
    priority: 'med',
    folder_id: rootFolderId,
    folder_path: 'Caixa de Entrada',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    tracked_total_min: 0,
  });
});
