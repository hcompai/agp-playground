'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface SaveConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
}

export function SaveConfigDialog({ isOpen, onClose, onSave }: SaveConfigDialogProps) {
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim());
      setName('');
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="relative bg-gray-1 rounded-lg shadow-lg p-6 w-full max-w-md mx-4 border border-gray-4">
        <h3 className="text-18-bold-heading text-gray-8 mb-4">Save Configuration</h3>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="config-name" className="text-14-medium-heading text-gray-7 block mb-2">
              Configuration Name
            </label>
            <input
              id="config-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g., Search and summarize workflow"
              autoFocus
              className="w-full px-3 py-2 border border-gray-4 rounded-md text-14-regular-body text-gray-8 placeholder-gray-5 focus:outline-none focus:ring-2 focus:ring-gray-6 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!name.trim()}
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

