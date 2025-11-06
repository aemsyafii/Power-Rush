import React from 'react';
import { Button } from '../ui/button';
import { Save, AlertTriangle } from 'lucide-react';
import { GameSettings } from './types';
import { getAnalyticsData } from './utils';
import { AnalyticsOverview } from './analytics/AnalyticsOverview';
import { TopDevices } from './analytics/TopDevices';
import { GameLogs } from './analytics/GameLogs';

interface AnalyticsTabProps {
  settings: GameSettings;
  currentDeviceId: string;
  updateSettings: (settings: GameSettings) => void;
  hasUnsavedChanges: boolean;
  onSave: () => void;
  onDiscard: () => void;
}

export function AnalyticsTab({ 
  settings, 
  currentDeviceId, 
  updateSettings, 
  hasUnsavedChanges,
  onSave,
  onDiscard 
}: AnalyticsTabProps) {

  const analytics = getAnalyticsData(settings.gameLogs);

  const handleClearLogs = () => {
    updateSettings({
      ...settings,
      gameLogs: []
    });
  };

  return (
    <div className="space-y-6">
      {/* Analytics Overview Cards */}
      <AnalyticsOverview analytics={analytics} />

      {/* Top Devices Activity */}
      <TopDevices 
        analytics={analytics}
        settings={settings}
        currentDeviceId={currentDeviceId}
        updateSettings={updateSettings}
      />

      {/* Game Logs */}
      <GameLogs 
        logs={settings.gameLogs}
        onClearLogs={handleClearLogs}
      />

      {/* Save Changes Section */}
      {hasUnsavedChanges && (
        <div className="sticky bottom-0 bg-white border-t-2 border-orange-200 p-4 shadow-lg">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-orange-800 font-semibold">Perubahan Analytics Belum Disimpan</p>
                <p className="text-orange-700 text-sm">Klik "Simpan" untuk menerapkan perubahan ke sistem</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={onDiscard}
                className="border-orange-300 text-orange-700 hover:bg-orange-100"
              >
                Batal
              </Button>
              <Button 
                onClick={onSave}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Save className="w-4 h-4 mr-1" />
                Simpan
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}