
import React, { useState, useEffect, useCallback } from 'react';
import { TaskProvider } from './context/TaskContext';
import SettingsModal from './components/SettingsModal';
import Header from './components/Header';
import KanbanBoard from './components/KanbanBoard';
import LogPanel from './components/LogPanel';
import { useLocalStorage } from './hooks/useLocalStorage';

const App: React.FC = () => {
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
    <TaskProvider webhookUrl={webhookUrl}>
      <div className="min-h-screen bg-primary font-sans">
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
          {webhookUrl ? (
            <KanbanBoard />
          ) : (
            <div className="flex flex-col items-center justify-center h-[80vh] text-center">
              <h2 className="text-2xl font-bold text-text-primary mb-4">Bem-vindo ao IntelliTask CRM</h2>
              <p className="text-text-secondary mb-6 max-w-md">Por favor, configure a URL do seu Webhook do Google Sheets para começar a gerenciar suas tarefas.</p>
              <button
                onClick={handleOpenSettings}
                className="px-6 py-2 bg-accent text-white font-semibold rounded-lg shadow-md hover:bg-accent-hover transition-colors duration-300"
              >
                Configurar Webhook
              </button>
            </div>
          )}
        </main>
        <LogPanel />
      </div>
    </TaskProvider>
  );
};

export default App;