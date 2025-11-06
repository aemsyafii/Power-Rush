import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Trophy, RotateCcw, X, Play } from 'lucide-react';

interface SimulationStartOverlayProps {
  onStart: () => void;
  onCancel?: () => void;
}

export function SimulationStartOverlay({ onStart, onCancel }: SimulationStartOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-500/30 backdrop-blur-lg p-4">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-xl border-2 border-white/50 shadow-2xl">
        <CardContent className="p-8 text-center">
          <div className="mb-8">
            <div className="text-8xl mb-6 animate-bounce">🎮</div>
            <h2 className="text-4xl font-bold text-blue-600 mb-4 animate-pulse">
              SIMULASI KEMENANGAN
            </h2>
            <p className="text-gray-700 text-xl mb-6">
              Mode admin untuk mensimulasikan overlay kemenangan
            </p>
            <div className="p-6 bg-blue-50 rounded-xl border-2 border-blue-200">
              <p className="text-blue-800 text-lg font-semibold mb-2">
                🎯 FITUR SIMULASI 🎯
              </p>
              <p className="text-blue-700 text-sm">
                Klik "Mulai" untuk melihat simulasi overlay kemenangan dengan nomor hadiah acak!
              </p>
            </div>
          </div>
          
          <Button 
            onClick={onStart}
            size="lg" 
            className="w-full h-14 text-xl font-bold shadow-lg transition-all duration-200 bg-blue-600 hover:bg-blue-700 text-white transform hover:scale-105"
          >
            <Play className="w-6 h-6 mr-3" />
            MULAI SIMULASI
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

interface SimulationResultOverlayProps {
  prizeNumber: number | null;
  isSpinning: boolean;
  displayNumber: number;
  canUseButtons: boolean;
  countdown: number;
  onRandomAgain: () => void;
  onExit: () => void;
}

export function SimulationResultOverlay({
  prizeNumber,
  isSpinning,
  displayNumber,
  canUseButtons,
  countdown,
  onRandomAgain,
  onExit
}: SimulationResultOverlayProps) {
  // Simulasi dengan data yang sama seperti overlay menang sesungguhnya
  const playerName = "ADMIN";
  const batteryLevel = 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-500/30 backdrop-blur-lg p-4">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-xl border-2 border-white/50 shadow-2xl">
        <CardContent className="p-8 text-center">
          <div className="mb-8">
            <div className="text-8xl mb-6 animate-bounce">🎉</div>
            <h2 className="text-4xl font-bold text-green-600 mb-4 animate-pulse">
              SELAMAT {playerName}!
            </h2>
            <p className="text-gray-700 text-xl mb-6">
              Power terisi {Math.round(batteryLevel)}%!
            </p>
            <div className="p-6 bg-green-50 rounded-xl border-2 border-green-200">
              <Trophy className="w-12 h-12 mx-auto mb-3 text-green-600" />
              <p className="text-green-800 text-lg font-semibold mb-2">
                🎁 ANDA MENANG HADIAH! 🎁
              </p>
              {prizeNumber && (
                <div className="mb-3 p-4 bg-yellow-100 rounded-lg border-2 border-yellow-300">
                  <p className="text-yellow-800 font-bold text-xl mb-2">HADIAH NOMOR</p>
                  <div className={`text-yellow-800 font-bold text-4xl ${isSpinning ? 'animate-pulse' : ''}`}>
                    {isSpinning ? displayNumber : prizeNumber}
                  </div>
                  {isSpinning && (
                    <div className="mt-2 flex justify-center space-x-1">
                      <div className="w-2 h-2 bg-yellow-600 rounded-full animate-bounce delay-0"></div>
                      <div className="w-2 h-2 bg-yellow-600 rounded-full animate-bounce delay-150"></div>
                      <div className="w-2 h-2 bg-yellow-600 rounded-full animate-bounce delay-300"></div>
                    </div>
                  )}
                </div>
              )}
              <p className="text-green-700 text-sm">
                Tunjukkan layar ini kepada petugas untuk mengambil hadiah!
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button 
              onClick={onRandomAgain}
              disabled={!canUseButtons}
              size="lg" 
              className={`flex-1 h-14 text-lg font-bold shadow-lg transition-all duration-200 ${
                canUseButtons 
                  ? 'bg-orange-600 hover:bg-orange-700 text-white transform hover:scale-105'
                  : 'bg-gray-400 text-gray-600 cursor-not-allowed'
              }`}
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              {canUseButtons ? 'ACAK LAGI' : `(${countdown}s)`}
            </Button>
            
            <Button 
              onClick={onExit}
              disabled={!canUseButtons}
              size="lg" 
              className={`flex-1 h-14 text-lg font-bold shadow-lg transition-all duration-200 ${
                canUseButtons 
                  ? 'bg-red-600 hover:bg-red-700 text-white transform hover:scale-105'
                  : 'bg-gray-400 text-gray-600 cursor-not-allowed'
              }`}
            >
              <X className="w-5 h-5 mr-2" />
              {canUseButtons ? 'KELUAR' : `(${countdown}s)`}
            </Button>
          </div>
          
          {canUseButtons && (
            <p className="text-center text-gray-600 mt-4">
              Pilih "Acak Lagi" untuk simulasi baru atau "Keluar" untuk kembali ke dashboard
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}