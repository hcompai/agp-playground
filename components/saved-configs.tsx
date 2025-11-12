'use client';

import { useEffect, useState } from 'react';
import { getSavedConfigurations, deleteConfiguration, type SavedConfiguration } from '@/lib/storage';

interface SavedConfigsProps {
  onLoad: (config: SavedConfiguration) => void;
  refreshKey?: number;
}

export function SavedConfigs({ onLoad, refreshKey = 0 }: SavedConfigsProps) {
  const [configs, setConfigs] = useState<SavedConfiguration[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const loadConfigs = () => {
    setConfigs(getSavedConfigurations());
  };

  useEffect(() => {
    loadConfigs();
  }, [refreshKey]);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this configuration?')) {
      deleteConfiguration(id);
      loadConfigs();
    }
  };

  const handleLoad = (config: SavedConfiguration) => {
    onLoad(config);
    setIsOpen(false);
  };

  if (configs.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
        Saved ({configs.length})
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-2 w-96 bg-card border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
            <div className="p-2">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-2 py-1.5">
                Saved Configurations
              </div>
              {configs.map((config) => (
                <div
                  key={config.id}
                  className="w-full text-left px-3 py-2.5 rounded-md hover:bg-muted transition-colors group cursor-pointer"
                  onClick={() => handleLoad(config)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {config.name}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 truncate">
                        {config.runMethod} • {config.startUrl}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(config.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDelete(config.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 rounded transition-all flex-shrink-0"
                      aria-label="Delete configuration"
                    >
                      <svg className="w-4 h-4 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

