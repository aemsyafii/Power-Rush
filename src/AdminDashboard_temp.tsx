import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Badge } from './components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Switch } from './components/ui/switch';
import { Slider } from './components/ui/slider';
import { Separator } from './components/ui/separator';
import { 
  Settings, 
  Clock, 
  Gift, 
  Users, 
  TrendingUp, 
  Save,
  AlertCircle,
  Eye,
  EyeOff,
  Hash,
  Plus,
  Trash2,
  RotateCcw,
  Key,
  Lock,
  Target,
  Activity,
  AlertTriangle,
  Trophy,
  Play,
  RefreshCw,
  X,
  User,
  Tag,
  FileText,
  Shield,
  UserCheck,
  UserX,
  Filter,
  Download,
  Search,
  BarChart3,
  Edit3,
  Check,
  Copy,
  CheckCheck,
  Calendar,
  Info,
  Maximize,
  Minimize,
  Toggle,
  SliderIcon
} from 'lucide-react';
import { GameSettings, UsedPrizeNumber } from './components/admin/types';
import { AnalyticsTab } from './components/admin/AnalyticsTab';
import { SimulationStartOverlay, SimulationResultOverlay } from './components/game/SimulationOverlays';
import { animatePrizeNumberSpinning, getCurrentUsedPrizeNumbers, getCurrentEffectiveDifficulty } from './components/game/utils';

interface AdminDashboardProps {
  settings: GameSettings;
  currentDeviceId: string;
  onSettingsChange: (settings: GameSettings) => void;
  onToggleView: () => void;
}

export function AdminDashboard({ settings, currentDeviceId, onSettingsChange, onToggleView }: AdminDashboardProps) {
  // ... (semua state dan fungsi yang ada seperti sebelumnya)
  
  // Di bagian main tabs, saya akan menambahkan:
  
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Background dan header seperti sebelumnya */}
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header dan warning sections */}
        
        {/* Main Navigation & Content */}
        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-white border-2 border-blue-200">
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Pengaturan
            </TabsTrigger>
            <TabsTrigger value="prizes" className="flex items-center gap-2">
              <Gift className="w-4 h-4" />
              Kelola Hadiah
            </TabsTrigger>
            <TabsTrigger value="players" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Data Pemain
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            {/* Game Duration */}
            <Card className="bg-white border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <Clock className="w-5 h-5" />
                  Durasi Game
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Durasi (detik): {localSettings.duration}</Label>
                    <Slider
                      value={[localSettings.duration]}
                      onValueChange={(value) => updateLocalSettings({
                        ...localSettings,
                        duration: value[0]
                      })}
                      max={60}
                      min={10}
                      step={5}
                      className="mt-2"
                    />
                    <p className="text-xs text-gray-600 mt-1">Rekomendasi: 25-30 detik untuk pengalaman optimal</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Operating Hours */}
            <Card className="bg-white border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <Clock className="w-5 h-5" />
                  Jam Operasional
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Aktifkan Jam Operasional</Label>
                    <Switch
                      checked={localSettings.operatingHoursEnabled}
                      onCheckedChange={(checked) => updateLocalSettings({
                        ...localSettings,
                        operatingHoursEnabled: checked
                      })}
                    />
                  </div>
                  
                  {localSettings.operatingHoursEnabled && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Jam Mulai</Label>
                        <Input
                          type="time"
                          value={localSettings.operatingHours.start}
                          onChange={(e) => updateLocalSettings({
                            ...localSettings,
                            operatingHours: {
                              ...localSettings.operatingHours,
                              start: e.target.value
                            }
                          })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Jam Selesai</Label>
                        <Input
                          type="time"
                          value={localSettings.operatingHours.end}
                          onChange={(e) => updateLocalSettings({
                            ...localSettings,
                            operatingHours: {
                              ...localSettings.operatingHours,
                              end: e.target.value
                            }
                          })}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="text-center">
                    <Badge 
                      variant={isOperatingHours() ? "default" : "destructive"}
                      className={isOperatingHours() ? 'bg-green-600' : 'bg-red-500'}
                    >
                      Status: {isOperatingHours() ? 'Sedang Beroperasi' : 'Di Luar Jam Operasional'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Difficulty Settings */}
            <Card className="bg-white border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <Target className="w-5 h-5" />
                  Tingkat Kesulitan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Auto Difficulty Toggle */}
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>
                      <Label className="text-base font-medium">Tingkat Kesulitan Otomatis</Label>
                      <p className="text-sm text-gray-600 mt-1">
                        Sistem akan menyesuaikan tingkat kesulitan berdasarkan waktu operasional dan sisa hadiah
                      </p>
                    </div>
                    <Switch
                      checked={localSettings.autoDifficultyEnabled}
                      onCheckedChange={(checked) => updateLocalSettings({
                        ...localSettings,
                        autoDifficultyEnabled: checked
                      })}
                    />
                  </div>

                  {/* Manual Difficulty Slider */}
                  <div>
                    <Label>
                      Tingkat Kesulitan {localSettings.autoDifficultyEnabled ? '(Base/Acuan)' : '(Manual)'}: {localSettings.difficultyMultiplier}%
                    </Label>
                    <Slider
                      value={[localSettings.difficultyMultiplier]}
                      onValueChange={(value) => updateLocalSettings({
                        ...localSettings,
                        difficultyMultiplier: value[0]
                      })}
                      max={100}
                      min={0}
                      step={5}
                      className="mt-2"
                    />
                    <div className="flex justify-between text-xs text-gray-600 mt-1">
                      <span>0% (Sangat Mudah)</span>
                      <span>50% (Normal)</span>
                      <span>100% (Sangat Sulit)</span>
                    </div>
                  </div>

                  {/* Auto Difficulty Max Limit */}
                  {localSettings.autoDifficultyEnabled && (
                    <div>
                      <Label>
                        Batas Maksimal Auto Difficulty: {localSettings.autoDifficultyMaxLimit || 80}%
                      </Label>
                      <Slider
                        value={[localSettings.autoDifficultyMaxLimit || 80]}
                        onValueChange={(value) => updateLocalSettings({
                          ...localSettings,
                          autoDifficultyMaxLimit: value[0]
                        })}
                        max={100}
                        min={30}
                        step={5}
                        className="mt-2"
                      />
                      <p className="text-xs text-gray-600 mt-1">
                        Sistem auto difficulty tidak akan melebihi batas ini (minimum 30%)
                      </p>
                    </div>
                  )}

                  {/* Current Effective Difficulty Display */}
                  {effectiveDifficulty.isAuto && (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 text-green-700">
                        <Activity className="w-4 h-4" />
                        <span className="font-medium">
                          Tingkat Kesulitan Aktif: {effectiveDifficulty.difficulty}%
                        </span>
                      </div>
                      <p className="text-sm text-green-600 mt-1">
                        {effectiveDifficulty.info}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Prize System Settings */}
            <Card className="bg-white border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <Gift className="w-5 h-5" />
                  Sistem Hadiah
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Prize Numbers Toggle */}
                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div>
                      <Label className="text-base font-medium">Aktifkan Nomor Hadiah</Label>
                      <p className="text-sm text-gray-600 mt-1">
                        Ketika dinonaktifkan, pemain tetap menang tapi tidak mendapat nomor hadiah
                      </p>
                    </div>
                    <Switch
                      checked={localSettings.prizeNumbersEnabled !== false}
                      onCheckedChange={(checked) => updateLocalSettings({
                        ...localSettings,
                        prizeNumbersEnabled: checked
                      })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Total Hadiah</Label>
                      <Input
                        type="number"
                        value={localSettings.totalPrizes}
                        onChange={(e) => updateLocalSettings({
                          ...localSettings,
                          totalPrizes: parseInt(e.target.value) || 100
                        })}
                        min="1"
                        max="1000"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Hadiah Tersisa</Label>
                      <Input
                        type="number"
                        value={localSettings.currentPrizes}
                        onChange={(e) => updateLocalSettings({
                          ...localSettings,
                          currentPrizes: Math.min(parseInt(e.target.value) || 0, localSettings.totalPrizes)
                        })}
                        min="0"
                        max={localSettings.totalPrizes}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span>Hadiah Terpakai: {localSettings.totalPrizes - localSettings.currentPrizes}</span>
                    <span>Progress: {Math.round(((localSettings.totalPrizes - localSettings.currentPrizes) / localSettings.totalPrizes) * 100)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save/Discard Actions */}
            <div className="flex gap-3 justify-end">
              {hasUnsavedChanges && (
                <Button 
                  variant="outline" 
                  onClick={handleDiscardChanges}
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  <X className="w-4 h-4 mr-2" />
                  Buang Perubahan
                </Button>
              )}
              <Button 
                onClick={handleSaveSettings}
                disabled={!hasUnsavedChanges}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Simpan Pengaturan
              </Button>
            </div>
          </TabsContent>

          {/* Prizes Tab */}
          <TabsContent value="prizes" className="space-y-6">
            {/* Prize System Status */}
            <Card className="bg-white border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <Toggle className="w-5 h-5" />
                  Status Sistem Hadiah
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Prize Numbers Enabled Toggle */}
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>
                      <Label className="text-base font-medium">Fitur Nomor Hadiah</Label>
                      <p className="text-sm text-gray-600 mt-1">
                        {localSettings.prizeNumbersEnabled !== false 
                          ? 'Pemain yang menang akan mendapat nomor hadiah'
                          : 'Pemain yang menang tidak mendapat nomor hadiah (hanya menang)'
                        }
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant={localSettings.prizeNumbersEnabled !== false ? "default" : "destructive"}
                        className={localSettings.prizeNumbersEnabled !== false ? 'bg-green-600' : 'bg-red-500'}
                      >
                        {localSettings.prizeNumbersEnabled !== false ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                      <Switch
                        checked={localSettings.prizeNumbersEnabled !== false}
                        onCheckedChange={(checked) => updateLocalSettings({
                          ...localSettings,
                          prizeNumbersEnabled: checked
                        })}
                      />
                    </div>
                  </div>

                  {/* Prize Statistics */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{localSettings.totalPrizes}</div>
                      <div className="text-sm text-gray-600">Total Hadiah</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{localSettings.currentPrizes}</div>
                      <div className="text-sm text-gray-600">Tersisa</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {localSettings.totalPrizes - localSettings.currentPrizes}
                      </div>
                      <div className="text-sm text-gray-600">Terpakai</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rest of the prizes management UI would go here... */}
          </TabsContent>

          {/* Other tabs... */}
        </Tabs>
      </div>
    </div>
  );
}