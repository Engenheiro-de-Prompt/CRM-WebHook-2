
import React, { useState, useEffect, useCallback } from 'react';
import { TaskProvider } from './context/TaskContext';
import SettingsModal from './components/SettingsModal';
import Header from './components/Header';
import TaskDashboard from './components/TaskDashboard';
import { useLocalStorage } from './hooks/useLocalStorage';

const App: React.FC = () => {
  // We keep the webhookUrl logic for potential future use or for other parts
  // of the app, but our new dashboard doesn't depend on it directly.
  // We'll consider the app "configured" if a URL is present.
  const [webhookUrl, setWebhookUrl] = useLocalStorage<string | null>('webhookUrl', null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(!webhookUrl);

  useEffect(() => {
    if (!webhookUrl) {
      setIsSettingsOpen(true);
    }
  }, [webhookUrl]);

  const handleSaveSettings = (url: string) => {
    setWebhookUrl(url);
    setIsSettingsOpen(false);
  };

  const handleOpenSettings = useCallback(() => {
    setIsSettingsOpen(true);
  }, []);

  const handleClearWebhook = useCallback(() => {
    setWebhookUrl(null);
    setIsSettingsOpen(true);
  }, [setWebhookUrl]);

  return (
    // The TaskProvider might not be used by the new dashboard, but we keep it
    // for other potential parts of the application like the Kanban board.
    <TaskProvider webhookUrl={webhookUrl}>
      <div className="min-h-screen bg-primary font-sans text-text-primary">
        <Header onOpenSettings={handleOpenSettings} />
        {isSettingsOpen && (
          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => { if(webhookUrl) setIsSettingsOpen(false) }}
            onSave={handleSaveSettings}
            currentUrl={webhookUrl}
            onClear={handleClearWebhook}
          />
        )}
        <main className="p-4 sm:p-6 lg:p-8">
          {/*
            We now show the TaskDashboard instead of the KanbanBoard.
            The user's primary request was for a new table-based interface.
            The old Kanban board could be added back as a separate view later.
          */}
          {webhookUrl ? (
            <TaskDashboard />
          ) : (
            <div className="flex flex-col items-center justify-center h-[80vh] text-center">
              <h2 className="text-2xl font-bold text-text-primary mb-4">Bem-vindo ao Gerenciador de Tarefas</h2>
              <p className="text-text-secondary mb-6 max-w-md">Para começar, por favor, configure a aplicação. Esta configuração (como a URL de um webhook) será usada para outras funcionalidades.</p>
              <button
                onClick={handleOpenSettings}
                className="px-6 py-2 bg-accent text-white font-semibold rounded-lg shadow-md hover:bg-accent-hover transition-colors duration-300"
              >
                Configurar
              </button>
            </div>
          )}
        </main>
      </div>
    </TaskProvider>
  );
};

export default App;
