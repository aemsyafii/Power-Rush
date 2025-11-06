import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { BarChart3, Eye, Shield, Plus, Trash2 } from 'lucide-react';
import { AnalyticsData, GameSettings, DeviceStats } from '../types';
import { getDeviceStats } from '../utils';

interface TopDevicesProps {
  analytics: AnalyticsData;
  settings: GameSettings;
  currentDeviceId: string;
  updateSettings: (settings: GameSettings) => void;
}

export function TopDevices({ analytics, settings, currentDeviceId, updateSettings }: TopDevicesProps) {
  const [showDeviceDetails, setShowDeviceDetails] = useState<string | null>(null);

  const addToWhitelist = (deviceId: string) => {
    if (!settings.gameRules.whitelistedDevices.includes(deviceId)) {
      updateSettings({
        ...settings,
        gameRules: {
          ...settings.gameRules,
          whitelistedDevices: [...settings.gameRules.whitelistedDevices, deviceId]
        }
      });
    }
  };

  const removeFromWhitelist = (deviceId: string) => {
    updateSettings({
      ...settings,
      gameRules: {
        ...settings.gameRules,
        whitelistedDevices: settings.gameRules.whitelistedDevices.filter(id => id !== deviceId)
      }
    });
  };

  const getDeviceDetails = (deviceId: string): DeviceStats => {
    return getDeviceStats(deviceId, settings.gameLogs, settings.gameRules.whitelistedDevices);
  };

  return (
    <Card className="bg-white border-2 border-gray-200 shadow-lg">
      <CardHeader>
        <CardTitle className="text-gray-900 text-xl flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Top Devices by Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {analytics.topDevices.length === 0 ? (
          <div className="p-8 text-center bg-gray-50 rounded-lg">
            <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p className="text-gray-600">Belum ada data device</p>
          </div>
        ) : (
          <div className="space-y-3">
            {analytics.topDevices.map((device, index) => {
              const deviceStats = getDeviceDetails(device.deviceId);
              const winRate = device.plays > 0 ? Math.round((device.wins / device.plays) * 100) : 0;
              
              return (
                <div key={device.deviceId} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-800 font-semibold text-sm">#{index + 1}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-gray-900">{device.deviceId}</span>
                          {deviceStats.isWhitelisted && (
                            <Shield className="w-4 h-4 text-green-600" title="Whitelisted" />
                          )}
                          {device.deviceId === currentDeviceId && (
                            <Badge variant="outline" className="text-xs text-purple-700 border-purple-300">
                              Device Ini
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          {device.plays} games • {device.wins} wins • {winRate}% win rate
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => setShowDeviceDetails(showDeviceDetails === device.deviceId ? null : device.deviceId)}
                        size="sm"
                        variant="outline"
                        className="border-gray-300"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Detail
                      </Button>
                      
                      {!deviceStats.isWhitelisted ? (
                        <Button
                          onClick={() => addToWhitelist(device.deviceId)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Whitelist
                        </Button>
                      ) : (
                        <Button
                          onClick={() => removeFromWhitelist(device.deviceId)}
                          size="sm"
                          variant="destructive"
                          className="bg-red-500 hover:bg-red-600 text-white"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Device Details Expansion */}
                  {showDeviceDetails === device.deviceId && (
                    <div className="mt-4 pt-4 border-t border-gray-300">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Total Plays:</p>
                          <p className="font-semibold text-gray-900">{deviceStats.totalPlays}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Total Wins:</p>
                          <p className="font-semibold text-green-600">{deviceStats.totalWins}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Total Losses:</p>
                          <p className="font-semibold text-red-600">{deviceStats.totalLosses}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Status:</p>
                          <p className={`font-semibold ${deviceStats.isWhitelisted ? 'text-green-600' : 'text-gray-600'}`}>
                            {deviceStats.isWhitelisted ? 'Whitelisted' : 'Normal'}
                          </p>
                        </div>
                      </div>
                      
                      {/* Rules Status */}
                      {!deviceStats.isWhitelisted && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-blue-800 text-sm font-semibold mb-1">Device Limits:</p>
                          <div className="grid grid-cols-2 gap-2 text-xs text-blue-700">
                            <p>Plays: {deviceStats.totalPlays} / {settings.gameRules.maxPlaysPerDevice}</p>
                            <p>Wins: {deviceStats.totalWins} / {settings.gameRules.maxWinsPerDevice}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}