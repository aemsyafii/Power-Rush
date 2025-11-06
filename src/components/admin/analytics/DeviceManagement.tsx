import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Shield, Plus } from 'lucide-react';
import { GameSettings } from '../types';
import { ADMIN_MESSAGES } from '../constants';

interface DeviceManagementProps {
  settings: GameSettings;
  updateSettings: (settings: GameSettings) => void;
}

export function DeviceManagement({ settings, updateSettings }: DeviceManagementProps) {
  const [newWhitelistDevice, setNewWhitelistDevice] = useState('');

  const handleAddWhitelistDevice = () => {
    const trimmedDeviceId = newWhitelistDevice.trim().toUpperCase();
    if (trimmedDeviceId && !settings.gameRules.whitelistedDevices.includes(trimmedDeviceId)) {
      updateSettings({
        ...settings,
        gameRules: {
          ...settings.gameRules,
          whitelistedDevices: [...settings.gameRules.whitelistedDevices, trimmedDeviceId]
        }
      });
      setNewWhitelistDevice('');
    } else {
      alert(ADMIN_MESSAGES.DEVICE_EXISTS_OR_EMPTY);
    }
  };

  return (
    <Card className="bg-white border-2 border-gray-200 shadow-lg">
      <CardHeader>
        <CardTitle className="text-gray-900 text-xl flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Aturan Device & Batasan
        </CardTitle>
        <p className="text-gray-600">
          Kelola batasan permainan per device dan device whitelist
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Device Limits Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-3">
            <Label htmlFor="maxPlays" className="text-gray-800">Max Total Permainan</Label>
            <Input
              id="maxPlays"
              type="number"
              value={settings.gameRules.maxPlaysPerDevice}
              onChange={(e) => updateSettings({
                ...settings,
                gameRules: {
                  ...settings.gameRules,
                  maxPlaysPerDevice: parseInt(e.target.value) || 1
                }
              })}
              min="1"
              className="bg-white border-2 border-gray-300"
            />
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="maxWins" className="text-gray-800">Max Kemenangan</Label>
            <Input
              id="maxWins"
              type="number"
              value={settings.gameRules.maxWinsPerDevice}
              onChange={(e) => updateSettings({
                ...settings,
                gameRules: {
                  ...settings.gameRules,
                  maxWinsPerDevice: Math.min(
                    parseInt(e.target.value) || 1,
                    settings.gameRules.maxPlaysPerDevice
                  )
                }
              })}
              min="1"
              max={settings.gameRules.maxPlaysPerDevice}
              className="bg-white border-2 border-gray-300"
            />
          </div>
          
          <div className="space-y-3">
            <Label className="text-gray-800">Whitelisted Devices</Label>
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-green-800 font-semibold">{settings.gameRules.whitelistedDevices.length}</p>
              <p className="text-green-700 text-sm">devices exempted</p>
            </div>
          </div>
        </div>

        {/* Manual Whitelist Addition */}
        <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
          <h4 className="font-semibold text-green-900 mb-3">Tambah Device ke Whitelist</h4>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Masukkan Device ID"
              value={newWhitelistDevice}
              onChange={(e) => setNewWhitelistDevice(e.target.value.toUpperCase())}
              className="bg-white border-2 border-green-300"
              onKeyPress={(e) => e.key === 'Enter' && handleAddWhitelistDevice()}
            />
            <Button 
              onClick={handleAddWhitelistDevice}
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={!newWhitelistDevice.trim()}
            >
              <Plus className="w-4 h-4 mr-1" />
              Tambah
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}