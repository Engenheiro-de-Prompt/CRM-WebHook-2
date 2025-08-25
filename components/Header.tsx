
import React from 'react';
import { GearIcon } from './Icons';

interface HeaderProps {
  onOpenSettings: () => void;
  tagQuery: string;
  onTagQueryChange: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenSettings, tagQuery, onTagQueryChange }) => {
  return (
    <header className="bg-secondary shadow-md p-4 flex justify-between items-center border-b border-border-color z-10">
      <div className="flex items-center space-x-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-accent" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
        </svg>
        <h1 className="text-2xl font-bold text-text-primary">IntelliTask CRM</h1>
      </div>
      <div className="flex-1 max-w-md mx-4">
        <input
          type="text"
          placeholder="Filtrar por tag..."
          value={tagQuery}
          onChange={(e) => onTagQueryChange(e.target.value)}
          className="w-full bg-primary p-2 rounded-md border border-border-color focus:ring-2 focus:ring-accent focus:outline-none"
        />
      </div>
      <button
        onClick={onOpenSettings}
        className="p-2 rounded-full hover:bg-border-color transition-colors duration-200"
        aria-label="Abrir Configurações"
      >
        <GearIcon className="w-6 h-6 text-text-secondary" />
      </button>
    </header>
  );
};

export default Header;