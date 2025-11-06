import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Play, Sparkles, Zap, Target, User, BarChart3, Shield, Maximize, Minimize } from 'lucide-react';
import { GameSettings } from './utils';
import { DeviceStats } from '../admin/types';

interface GameInstructionsProps {
  settings: GameSettings;
  playerName: string;
  deviceStats: DeviceStats;
  onStartGame: () => void;
  isInOperatingHours: boolean;
}

export function GameInstructions({ 
  settings, 
  playerName,
  deviceStats, 
  onStartGame, 
  isInOperatingHours 
}: GameInstructionsProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const canStartGame = settings.currentPrizes > 0 && (!settings.operatingHoursEnabled || isInOperatingHours);
  
  // Check if fullscreen is supported and allowed
  const [isFullscreenSupported, setIsFullscreenSupported] = useState(false);

  // Check fullscreen status on mount and listen for changes
  useEffect(() => {
    // Check if fullscreen API is supported
    const isSupported = !!(
      document.documentElement.requestFullscreen ||
      (document.documentElement as any).webkitRequestFullscreen ||
      (document.documentElement as any).mozRequestFullScreen ||
      (document.documentElement as any).msRequestFullscreen
    );
    
    setIsFullscreenSupported(isSupported);

    if (!isSupported) return;

    const checkFullscreen = () => {
      setIsFullscreen(Boolean(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      ));
    };

    // Check initial state
    checkFullscreen();

    // Listen for fullscreen changes (with vendor prefixes)
    document.addEventListener('fullscreenchange', checkFullscreen);
    document.addEventListener('webkitfullscreenchange', checkFullscreen);
    document.addEventListener('mozfullscreenchange', checkFullscreen);
    document.addEventListener('msfullscreenchange', checkFullscreen);
    
    return () => {
      document.removeEventListener('fullscreenchange', checkFullscreen);
      document.removeEventListener('webkitfullscreenchange', checkFullscreen);
      document.removeEventListener('mozfullscreenchange', checkFullscreen);
      document.removeEventListener('msfullscreenchange', checkFullscreen);
    };
  }, []);

  const toggleFullscreen = async () => {
    if (!isFullscreenSupported) {
      alert('Fullscreen tidak didukung oleh browser Anda. Coba gunakan F11 atau gunakan browser yang mendukung fullscreen.');
      return;
    }

    try {
      if (!isFullscreen) {
        // Enter fullscreen with vendor prefixes
        const docEl = document.documentElement;
        if (docEl.requestFullscreen) {
          await docEl.requestFullscreen();
        } else if ((docEl as any).webkitRequestFullscreen) {
          await (docEl as any).webkitRequestFullscreen();
        } else if ((docEl as any).mozRequestFullScreen) {
          await (docEl as any).mozRequestFullScreen();
        } else if ((docEl as any).msRequestFullscreen) {
          await (docEl as any).msRequestFullscreen();
        }
      } else {
        // Exit fullscreen with vendor prefixes
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
          await (document as any).mozCancelFullScreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
      }
    } catch (error) {
      console.error('Fullscreen toggle failed:', error);
      
      // Provide user-friendly error messages
      if (error instanceof Error) {
        if (error.message.includes('permissions') || error.message.includes('policy')) {
          alert('Fullscreen diblokir oleh kebijakan browser. Coba tekan F11 untuk fullscreen manual, atau buka game di tab baru.');
        } else if (error.message.includes('user gesture')) {
          alert('Fullscreen harus diaktifkan melalui interaksi pengguna. Silakan coba klik tombol lagi.');
        } else {
          alert('Tidak dapat mengaktifkan fullscreen. Coba gunakan F11 atau buka di browser yang mendukung.');
        }
      } else {
        alert('Tidak dapat mengaktifkan fullscreen. Coba gunakan F11 sebagai alternatif.');
      }
    }
  };
  
  const getButtonText = () => {
    if (settings.currentPrizes <= 0) return 'HADIAH HABIS';
    if (settings.operatingHoursEnabled && !isInOperatingHours) return 'TUTUP';
    return 'MULAI PERMAINAN';
  };

  const getProgressColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage < 50) return 'bg-green-500';
    if (percentage < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card className="text-center bg-white border-2 border-blue-200 shadow-xl relative">
      {/* Fullscreen Toggle Button - Only show if supported */}
      {isFullscreenSupported && (
        <Button
          onClick={toggleFullscreen}
          size="sm"
          variant="ghost"
          className="absolute top-4 right-4 z-10 h-8 w-8 p-0 text-gray-600 hover:text-blue-600 hover:bg-blue-50"
          title={isFullscreen ? 'Keluar Fullscreen' : 'Masuk Fullscreen'}
        >
          {isFullscreen ? (
            <Minimize className="w-4 h-4" />
          ) : (
            <Maximize className="w-4 h-4" />
          )}
        </Button>
      )}

      <CardContent className="p-8">
        <div className="mb-6">
          <div className="relative mb-6">
            <Sparkles className="w-20 h-20 mx-auto mb-4 text-blue-500 animate-spin" style={{ animationDuration: '3s' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <Zap className="w-12 h-12 text-cyan-500 animate-pulse" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-3 text-blue-600">
            ⚡ POWER RUSH ⚡
          </h1>
          <p className="text-gray-700 text-lg mb-6">
            Isi power hingga penuh dalam {settings.duration} detik!
          </p>
          
          {/* Player Unique Name Display */}
          {playerName && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
              <div className="flex items-center justify-center gap-2 mb-2">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-800">Nama Pemain</h3>
              </div>
              <div className="text-2xl font-bold text-blue-900 bg-white px-4 py-2 rounded-lg border border-blue-300">
                {playerName}
              </div>
            </div>
          )}
        </div>
        
        <div className="mb-8 p-6 bg-blue-50 rounded-xl border-2 border-blue-200">
          <h3 className="text-lg font-semibold mb-4 text-blue-800 flex items-center justify-center gap-2">
            <Target className="w-5 h-5" />
            Cara Bermain
          </h3>
          <ul className="text-sm space-y-3 text-gray-700 text-left">
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Tap tombol "CHARGE" atau tekan SPASI/ENTER
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
              Isi power hingga 100%
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              Selesaikan dalam {settings.duration} detik
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-cyan-600 rounded-full"></div>
              Semakin cepat, semakin besar peluang menang!
            </li>
          </ul>
        </div>

        <Button 
          onClick={onStartGame} 
          size="lg" 
          disabled={!canStartGame}
          className={`w-full h-14 text-xl font-bold shadow-lg transition-all duration-200 ${
            !canStartGame
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white transform hover:scale-105'
          }`}
        >
          <Play className="w-6 h-6 mr-3" />
          {getButtonText()}
        </Button>
        
        {canStartGame && (
          <div className="mt-4 space-y-2">
            <p className="text-center text-gray-600">
              Atau tekan <span className="bg-blue-100 px-2 py-1 rounded font-mono text-blue-800">SPASI</span> / <span className="bg-blue-100 px-2 py-1 rounded font-mono text-blue-800">ENTER</span>
            </p>


          </div>
        )}
      </CardContent>
    </Card>
  );
}