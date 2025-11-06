import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import { Play, Volume2, VolumeX, Music, Settings } from 'lucide-react';
import { useAudioContext } from '../AudioProvider';

export function AudioTab() {
  const { 
    audioSettings, 
    updateAudioSettings, 
    playSound, 
    isInitialized, 
    initializeAudio 
  } = useAudioContext();

  const [testingSound, setTestingSound] = useState<string | null>(null);

  // Handle sound testing with feedback
  const testSound = async (soundName: string, displayName: string) => {
    if (!isInitialized) {
      await initializeAudio();
    }
    
    setTestingSound(soundName);
    playSound(soundName as any, 1.0);
    
    // Clear testing state after a short delay
    setTimeout(() => {
      setTestingSound(null);
    }, 500);
  };

  // Sound effect definitions for testing
  const soundEffects = [
    { name: 'tap', display: 'Tap Sound', description: 'Sound saat tap/klik game' },
    { name: 'win', display: 'Win Sound', description: 'Sound saat menang' },
    { name: 'loss', display: 'Loss Sound', description: 'Sound saat kalah' },
    { name: 'prizeSpinning', display: 'Prize Spinning', description: 'Sound saat putaran hadiah' },
    { name: 'countdown', display: 'Countdown', description: 'Sound countdown game' },
    { name: 'notification', display: 'Notification', description: 'Sound notifikasi umum' },
    { name: 'buttonHover', display: 'Button Hover', description: 'Sound hover button' }
  ];

  return (
    <div className="space-y-6">
      {/* Master Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="w-5 h-5" />
            Audio Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sound Enable Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Enable Sound Effects</Label>
              <p className="text-sm text-gray-600">Turn on/off all game sounds</p>
            </div>
            <Switch
              checked={audioSettings.soundEnabled}
              onCheckedChange={(enabled) => updateAudioSettings({ soundEnabled: enabled })}
            />
          </div>

          {/* Audio Status */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="w-4 h-4" />
              <span className="font-medium">Audio Status</span>
            </div>
            <div className="text-sm space-y-1">
              <p>
                Audio System: {' '}
                <span className={`font-semibold ${isInitialized ? 'text-green-600' : 'text-orange-600'}`}>
                  {isInitialized ? 'Initialized' : 'Not Initialized'}
                </span>
              </p>
              <p>
                Sound: {' '}
                <span className={`font-semibold ${audioSettings.soundEnabled ? 'text-green-600' : 'text-red-600'}`}>
                  {audioSettings.soundEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </p>
              {!isInitialized && (
                <p className="text-orange-600 text-xs">
                  Audio akan diinisialisasi saat game dimulai pertama kali
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Volume Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="w-5 h-5" />
            Volume Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Master Volume */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Master Volume</Label>
              <span className="text-sm text-gray-600">
                {Math.round(audioSettings.masterVolume * 100)}%
              </span>
            </div>
            <Slider
              value={[audioSettings.masterVolume * 100]}
              onValueChange={([value]) => updateAudioSettings({ masterVolume: value / 100 })}
              max={100}
              min={0}
              step={5}
              className="w-full"
              disabled={!audioSettings.soundEnabled}
            />
          </div>

          {/* SFX Volume */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Sound Effects Volume</Label>
              <span className="text-sm text-gray-600">
                {Math.round(audioSettings.sfxVolume * 100)}%
              </span>
            </div>
            <Slider
              value={[audioSettings.sfxVolume * 100]}
              onValueChange={([value]) => updateAudioSettings({ sfxVolume: value / 100 })}
              max={100}
              min={0}
              step={5}
              className="w-full"
              disabled={!audioSettings.soundEnabled}
            />
            <p className="text-xs text-gray-500">
              Volume untuk tap sounds, win/loss sounds, dan efek game
            </p>
          </div>

          {/* Music Volume */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Background Music Volume</Label>
              <span className="text-sm text-gray-600">
                {Math.round(audioSettings.musicVolume * 100)}%
              </span>
            </div>
            <Slider
              value={[audioSettings.musicVolume * 100]}
              onValueChange={([value]) => updateAudioSettings({ musicVolume: value / 100 })}
              max={100}
              min={0}
              step={5}
              className="w-full"
              disabled={!audioSettings.soundEnabled}
            />
            <p className="text-xs text-gray-500">
              Volume untuk background ambient music (future feature)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Sound Effects Testing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="w-5 h-5" />
            Sound Effects Testing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {soundEffects.map((sound) => (
              <div
                key={sound.name}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">{sound.display}</h4>
                    <p className="text-sm text-gray-600">{sound.description}</p>
                  </div>
                  <Button
                    onClick={() => testSound(sound.name, sound.display)}
                    size="sm"
                    variant="outline"
                    disabled={!audioSettings.soundEnabled || testingSound === sound.name}
                    className="ml-3"
                  >
                    {testingSound === sound.name ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {!audioSettings.soundEnabled && (
            <div className="mt-4 p-3 bg-gray-100 rounded-lg text-center text-gray-600">
              <VolumeX className="w-6 h-6 mx-auto mb-2" />
              <p className="text-sm">Sound effects are disabled. Enable sound to test.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Presets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Quick Presets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              onClick={() => updateAudioSettings({
                masterVolume: 0,
                sfxVolume: 0,
                musicVolume: 0,
                soundEnabled: false
              })}
              variant="outline"
              size="sm"
            >
              <VolumeX className="w-4 h-4 mr-2" />
              Mute All
            </Button>
            
            <Button
              onClick={() => updateAudioSettings({
                masterVolume: 0.3,
                sfxVolume: 0.5,
                musicVolume: 0.2,
                soundEnabled: true
              })}
              variant="outline"
              size="sm"
            >
              Low Volume
            </Button>
            
            <Button
              onClick={() => updateAudioSettings({
                masterVolume: 0.7,
                sfxVolume: 0.8,
                musicVolume: 0.4,
                soundEnabled: true
              })}
              variant="outline"
              size="sm"
            >
              Medium Volume
            </Button>
            
            <Button
              onClick={() => updateAudioSettings({
                masterVolume: 1.0,
                sfxVolume: 1.0,
                musicVolume: 0.6,
                soundEnabled: true
              })}
              variant="outline"
              size="sm"
            >
              High Volume
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Help & Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="w-5 h-5" />
            Audio Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm space-y-2 text-gray-600">
            <p>• Sound effects menggunakan Web Audio API untuk performa optimal</p>
            <p>• Audio akan diinisialisasi secara otomatis saat game dimulai</p>
            <p>• Semua sound effects dibuat secara sintetis untuk load time yang cepat</p>
            <p>• Settings audio disimpan secara lokal di browser</p>
            <p>• Background music masih dalam pengembangan</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}