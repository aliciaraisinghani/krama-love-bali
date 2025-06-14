import React from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { PreferencesWizard } from './PreferencesWizard';
import { PlayerPreferences, DEFAULT_PREFERENCES } from '@/lib/playerPreferences';

interface PreferencesSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (preferences: PlayerPreferences) => void;
  playerName?: string;
}

export const PreferencesSetupModal: React.FC<PreferencesSetupModalProps> = ({
  isOpen,
  onClose,
  onSave,
  playerName
}) => {
  const handleComplete = (preferences: PlayerPreferences) => {
    onSave(preferences);
    onClose();
  };

  const handleCancel = () => {
    onSave(DEFAULT_PREFERENCES);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto p-6">
        <PreferencesWizard
          initialPreferences={DEFAULT_PREFERENCES}
          onComplete={handleComplete}
          onCancel={handleCancel}
          playerName={playerName}
        />
      </DialogContent>
    </Dialog>
  );
}; 