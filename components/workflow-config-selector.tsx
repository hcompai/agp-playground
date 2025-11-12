'use client';

import { useEffect, useState } from 'react';
import { getSavedConfigurations, type SavedConfiguration } from '@/lib/storage';
import { Button } from '@/components/ui/button';

interface WorkflowConfigSelectorProps {
  selectedConfigs: SavedConfiguration[];
  onAdd: (config: SavedConfiguration) => void;
}

export function WorkflowConfigSelector({ selectedConfigs, onAdd }: WorkflowConfigSelectorProps) {
  const [configs, setConfigs] = useState<SavedConfiguration[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const loadConfigs = () => {
    setConfigs(getSavedConfigurations());
  };

  useEffect(() => {
    loadConfigs();
  }, []);

  const availableConfigs = configs.filter(
    config => !selectedConfigs.find(sc => sc.id === config.id)
  );

  if (availableConfigs.length === 0) {
    return (
      <Button disabled variant="outline" size="sm">
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Step
      </Button>
    );
  }

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="default"
        size="sm"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Step
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full right-0 mt-2 w-96 bg-gray-1 border border-gray-4 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
            <div className="p-2">
              <div className="text-12-medium-heading text-gray-6 uppercase tracking-wide px-2 py-1.5">
                Select Configuration
              </div>
              {availableConfigs.map((config) => (
                <button
                  key={config.id}
                  onClick={() => {
                    onAdd(config);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-md hover:bg-gray-3 transition-colors"
                >
                  <div className="text-14-medium-heading text-gray-8 truncate">
                    {config.name}
                  </div>
                  <div className="text-12-regular-body text-gray-6 mt-0.5 truncate">
                    {config.runMethod} • {config.startUrl}
                  </div>
                  <div className="text-12-regular-body text-gray-6 mt-1">
                    {new Date(config.updatedAt).toLocaleDateString()}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

