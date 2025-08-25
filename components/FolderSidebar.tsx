import React, { useState, useContext } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Folder, CalendarIcon } from './Icons';
import { TaskContext } from '../context/TaskContext';
import { postEventToWebhook } from '../services/webhookService';
import { IWebhookEvent, IFolder } from '../types';

type ActiveView = string | null; // null is 'All', 'today' is special, string is folder_id

interface FolderSidebarProps {
  activeView: ActiveView;
  onSelectView: (view: ActiveView) => void;
}

const FolderSidebar: React.FC<FolderSidebarProps> = ({ activeView, onSelectView }) => {
  const { addLog } = useContext(TaskContext);
  // This is a bit of a hack. The webhookUrl is not in the TaskContext type.
  // A better solution would be a dedicated AppContext, but for now, this works.
  const { webhookUrl } = useContext(TaskContext) as any;

  const folders = useLiveQuery(() => db.folders.toArray(), []);
  const [newFolderName, setNewFolderName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddFolder = async () => {
    if (newFolderName.trim() === '') return;

    const newFolder: IFolder = {
      folder_id: uuidv4(),
      name: newFolderName.trim(),
      path: newFolderName.trim(), // Simple path for now
      created_at: new Date().toISOString(),
    };

    try {
      await db.folders.add(newFolder);
      addLog(`Pasta criada localmente: ${newFolder.name}`);
      setNewFolderName('');
      setIsAdding(false);

      if (webhookUrl) {
        const event: IWebhookEvent = {
          event_type: 'folder.created',
          idempotency_key: uuidv4(),
          payload: newFolder,
        };
        try {
          await postEventToWebhook(webhookUrl, event);
          addLog(`Evento de pasta criada enviado para: ${newFolder.name}`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
          addLog(`Falha ao enviar evento de pasta: ${errorMessage}`);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      addLog(`Falha ao criar pasta: ${errorMessage}`);
      console.error('Failed to add folder:', error);
    }
  };

  return (
    <aside className="w-64 bg-secondary p-4 flex flex-col">
      <h2 className="text-lg font-bold text-text-primary mb-4">Navegação</h2>
      <div className="flex-grow">
        <ul className="space-y-1">
          {/* Today View */}
          <li
            className={`flex items-center p-2 rounded-md cursor-pointer ${
              activeView === 'today' ? 'bg-accent' : 'hover:bg-primary'
            }`}
            onClick={() => onSelectView('today')}
          >
            <CalendarIcon className="w-5 h-5 mr-3" />
            <span>Hoje</span>
          </li>

          <h3 className="text-lg font-bold text-text-primary mb-2 mt-4 pt-2 border-t border-border-color">Pastas</h3>

          {/* All Folders */}
          <li
            className={`flex items-center p-2 rounded-md cursor-pointer ${
              activeView === null ? 'bg-accent' : 'hover:bg-primary'
            }`}
            onClick={() => onSelectView(null)}
          >
            <Folder className="w-5 h-5 mr-3" />
            <span>Todas as Pastas</span>
          </li>

          {folders?.map((folder) => (
            <li
              key={folder.folder_id}
              className={`flex items-center p-2 rounded-md cursor-pointer ${
                activeView === folder.folder_id ? 'bg-accent' : 'hover:bg-primary'
              }`}
              onClick={() => onSelectView(folder.folder_id)}
            >
              <Folder className="w-5 h-5 mr-3" />
              <span>{folder.name}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-4">
        {isAdding ? (
          <div>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Nome da nova pasta"
              className="w-full p-2 bg-primary border border-border-color rounded-md text-text-primary"
              onKeyDown={(e) => e.key === 'Enter' && handleAddFolder()}
            />
            <div className="flex justify-end mt-2">
              <button onClick={() => setIsAdding(false)} className="text-text-secondary mr-2">Cancelar</button>
              <button onClick={handleAddFolder} className="px-3 py-1 bg-accent text-white rounded-md">Salvar</button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center w-full p-2 rounded-md hover:bg-primary text-text-secondary"
          >
            <Plus className="w-5 h-5 mr-3" />
            <span>Nova Pasta</span>
          </button>
        )}
      </div>
    </aside>
  );
};

export default FolderSidebar;
