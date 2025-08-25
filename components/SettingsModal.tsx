
import React, { useState } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (url: string) => void;
  onClear: () => void;
  currentUrl: string | null;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave, onClear, currentUrl }) => {
  const [url, setUrl] = useState(currentUrl || '');

  if (!isOpen) return null;
  
  const handleSave = () => {
      if(url.trim()){
          onSave(url);
      }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-secondary rounded-lg shadow-xl w-full max-w-lg p-8" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-text-primary mb-4">Configurações</h2>
        <p className="text-text-secondary mb-6">Insira a URL do seu Webhook do Google Apps Script para conectar seu quadro de tarefas ao Google Sheets. Todas as tarefas criadas e atualizadas serão registradas.</p>
        
        <div>
          <label htmlFor="webhook-url" className="block text-sm font-medium text-text-secondary mb-2">URL do Webhook</label>
          <input
            id="webhook-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://script.google.com/macros/s/..."
            className="w-full bg-primary text-text-primary p-2 rounded-md border border-border-color focus:ring-2 focus:ring-accent focus:outline-none"
          />
        </div>
        
        <div className="mt-8 flex justify-between items-center">
            <button
                onClick={onClear}
                className="px-4 py-2 text-sm text-red-400 font-semibold rounded-lg hover:bg-red-900/50 transition-colors"
                >
                Limpar Webhook e Dados
            </button>
            <div className="flex gap-4">
                <button
                    onClick={onClose}
                    className="px-6 py-2 bg-border-color text-text-primary font-semibold rounded-lg hover:bg-gray-600 transition-colors"
                >
                    Cancelar
                </button>
                <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-accent text-white font-semibold rounded-lg hover:bg-accent-hover transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                    disabled={!url.trim()}
                >
                    Salvar
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;