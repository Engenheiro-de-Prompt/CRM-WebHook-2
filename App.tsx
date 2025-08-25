
import React, { useState, useEffect, useCallback } from 'react';
import { TaskProvider } from './context/TaskContext';
import SettingsModal from './components/SettingsModal';
import Header from './components/Header';
import KanbanBoard from './components/KanbanBoard';
import FolderSidebar from './components/FolderSidebar';
import TodayView from './components/TodayView';
import LogPanel from './components/LogPanel';
import { useLocalStorage } from './hooks/useLocalStorage';

const App: React.FC = () => {
  const [webhookUrl, setWebhookUrl] = useLocalStorage<string | null>('webhookUrl', null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(!webhookUrl);
  const [activeView, setActiveView] = useState<string | null>(null); // null = All, 'today', or folder_id
  const [tagQuery, setTagQuery] = useState('');

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

  const renderMainView = () => {
    if (!webhookUrl) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <h2 className="text-2xl font-bold text-text-primary mb-4">Bem-vindo ao IntelliTask CRM</h2>
          <p className="text-text-secondary mb-6 max-w-md">Por favor, configure a URL do seu Webhook do Google Sheets para começar a gerenciar suas tarefas.</p>
          <button
            onClick={handleOpenSettings}
            className="px-6 py-2 bg-accent text-white font-semibold rounded-lg shadow-md hover:bg-accent-hover transition-colors duration-300"
          >
            Configurar Webhook
          </button>
        </div>
      );
    }

    if (activeView === 'today') {
      return <TodayView />;
    }

    return <KanbanBoard />;
  };

  return (
    <TaskProvider webhookUrl={webhookUrl} activeView={activeView} tagQuery={tagQuery}>
      <div className="flex h-screen bg-primary font-sans text-text-primary">
        {webhookUrl && (
          <FolderSidebar
            activeView={activeView}
            onSelectView={setActiveView}
          />
        )}
        <div className="flex flex-col flex-grow">
          <Header
            onOpenSettings={handleOpenSettings}
            tagQuery={tagQuery}
            onTagQueryChange={setTagQuery}
          />
          {isSettingsOpen && (
            <SettingsModal
              isOpen={isSettingsOpen}
              onClose={() => { if(webhookUrl) setIsSettingsOpen(false) }}
              onSave={handleSaveSettings}
              currentUrl={webhookUrl}
              onClear={handleClearWebhook}
            />
          )}
          <main className="flex-grow p-4 sm:p-6 lg:p-8 overflow-auto">
            {renderMainView()}
          </main>
        </div>
        <LogPanel />
      </div>
    </TaskProvider>
  );
};
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
        </div>
        <LogPanel />
      </div>
    </TaskProvider>
  );
};

export default App;