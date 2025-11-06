import React from 'react';
import { Button } from '../ui/button';
import { Zap } from 'lucide-react';
import { getBatteryColorClass, getBatteryGlowColor, generateParticleStyle } from './utils';
import { GAME_CONSTANTS } from './constants';

interface GamePlayProps {
  timeLeft: number;
  batteryLevel: number;
  isKeySpamming: boolean;
  gameState: string;
  onTap: () => void;
  isTooFast?: boolean; // Anti-cheat state
}

export function GamePlay({ 
  timeLeft, 
  batteryLevel, 
  isKeySpamming, 
  gameState, 
  onTap,
  isTooFast = false
}: GamePlayProps) {
  const batteryColorClass = getBatteryColorClass(batteryLevel);
  const batteryGlowColor = getBatteryGlowColor(batteryLevel);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      {/* Timer - Responsive positioning */}
      <div className="flex-shrink-0 mb-4 md:mb-6 lg:mb-8">
        <div className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white drop-shadow-2xl">
          ⚡ {timeLeft}s
        </div>
      </div>
      
      {/* Battery Container - Improved proportional design for all devices */}
      <div className="flex-1 flex items-center justify-center min-h-0 py-4">
        <div className="relative flex flex-col items-center">
          
          {/* Battery Terminal/Cap - More realistic proportions */}
          <div className="relative z-10 mb-0">
            <div className="w-10 sm:w-12 md:w-14 lg:w-16 h-4 sm:h-5 md:h-6 lg:h-7 bg-white/80 rounded-t-md shadow-lg border-2 border-white/60" />
            {/* Terminal connection */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 sm:w-6 md:w-7 lg:w-8 h-1.5 sm:h-2 md:h-2.5 bg-white/90 rounded-sm" />
          </div>
          
          {/* Main Battery Body - More realistic battery shape and better mobile proportions */}
          <div 
            className="relative border-4 border-white/50 bg-white/20 backdrop-blur-sm overflow-hidden shadow-2xl"
            style={{ 
              width: 'clamp(5rem, 15vw, 10rem)', // Mobile-friendly: 80px to 160px (increased from 4rem)
              height: 'clamp(14rem, 55vh, 22rem)', // Better height: 224px to 352px
              borderRadius: '1rem 1rem 0.75rem 0.75rem', // Slightly rounded corners, more rounded at top
              borderTopLeftRadius: '0.5rem',
              borderTopRightRadius: '0.5rem'
            }}
          >
            
            {/* Battery level fill with dynamic color and glow effect */}
            <div 
              className={`absolute bottom-0 left-0 right-0 transition-all duration-500 ${batteryColorClass} shadow-lg`}
              style={{ 
                height: `${batteryLevel}%`,
                boxShadow: `0 0 20px ${batteryGlowColor}, inset 0 2px 4px rgba(255,255,255,0.2)`,
                borderRadius: '0 0 0.75rem 0.75rem'
              }}
            />
            
            {/* Battery segments/markings for realistic look */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Horizontal measurement lines */}
              <div className="absolute left-0 right-0" style={{ top: '20%' }}>
                <div className="h-px bg-white/20" />
              </div>
              <div className="absolute left-0 right-0" style={{ top: '40%' }}>
                <div className="h-px bg-white/20" />
              </div>
              <div className="absolute left-0 right-0" style={{ top: '60%' }}>
                <div className="h-px bg-white/20" />
              </div>
              <div className="absolute left-0 right-0" style={{ top: '80%' }}>
                <div className="h-px bg-white/20" />
              </div>
            </div>
            
            {/* Animated energy particles */}
            {gameState === 'playing' && batteryLevel > 0 && !isKeySpamming && (
              <div className="absolute inset-0">
                {Array.from({ length: GAME_CONSTANTS.ENERGY_PARTICLES_COUNT }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 bg-white rounded-full opacity-90 animate-pulse"
                    style={generateParticleStyle(i, batteryLevel)}
                  />
                ))}
              </div>
            )}
            
            {/* Anti-cheat warnings */}
            {(isKeySpamming || isTooFast) && (
              <div className="absolute inset-0 bg-red-500/30 flex items-center justify-center">
                <div className="text-white text-xs sm:text-sm font-bold animate-pulse text-center px-2">
                  {isKeySpamming ? 'JANGAN TAHAN!' : 'TERLALU CEPAT!'}
                </div>
              </div>
            )}
            
            {/* Battery level text */}
            <div className="absolute inset-0 flex items-center justify-center text-sm sm:text-base md:text-lg lg:text-xl font-bold text-white drop-shadow-lg">
              {Math.round(batteryLevel)}%
            </div>

            {/* Battery body reflections for 3D effect */}
            <div className="absolute top-4 left-1 sm:left-2 w-0.5 sm:w-1 bg-white/20 rounded-full" style={{ height: '70%' }}></div>
            <div className="absolute top-6 right-1 sm:right-2 w-0.5 bg-white/10 rounded-full" style={{ height: '60%' }}></div>
            
            {/* Inner highlight for depth */}
            <div className="absolute top-2 left-1 right-1 h-4 bg-white/10 rounded-t-lg" />
          </div>
          
          {/* Battery Label/Brand - Optional realistic detail */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="text-white/30 text-xs font-mono rotate-90 tracking-wider">
              POWER
            </div>
          </div>
        </div>
      </div>

      {/* Charge Button - Bottom positioned */}
      <div className="flex-shrink-0 w-full max-w-sm mt-4 md:mt-6">
        <Button 
          id="charge-button"
          onClick={onTap}
          size="lg" 
          className={`w-full h-16 sm:h-18 md:h-20 text-xl sm:text-2xl font-bold transition-all duration-150 shadow-2xl transform hover:scale-105 active:scale-95 border-2 border-white/50 ${
            (isKeySpamming || isTooFast)
              ? 'bg-red-500 text-white cursor-not-allowed' 
              : 'bg-white text-blue-600 hover:bg-gray-100'
          }`}
          variant="default"
          disabled={gameState === 'countdown' || isKeySpamming || isTooFast}
        >
          <Zap className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3" />
          {isKeySpamming ? 'JANGAN TAHAN!' : isTooFast ? 'TERLALU CEPAT!' : 'CHARGE!'}
        </Button>
        
        <p className="text-center text-white/90 mt-3 sm:mt-4 text-sm sm:text-base drop-shadow-lg">
          {isKeySpamming ? (
            <span className="text-red-200 animate-pulse">Lepaskan tombol dan tekan dengan normal!</span>
          ) : isTooFast ? (
            <span className="text-red-200 animate-pulse">Klik lebih pelan! Maksimal 15 klik/detik</span>
          ) : (
            <>
              Atau tekan <span className="bg-white/30 px-2 py-1 rounded font-mono text-white backdrop-blur-sm text-xs sm:text-sm">SPASI</span> / <span className="bg-white/30 px-2 py-1 rounded font-mono text-white backdrop-blur-sm text-xs sm:text-sm">ENTER</span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}