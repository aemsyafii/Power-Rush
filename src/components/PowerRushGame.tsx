import React, { useState, useEffect, useCallback } from 'react';
import { GameInstructions } from './game/GameInstructions';
import { GamePlay } from './game/GamePlay';
import { CountdownOverlay, ResultOverlay } from './game/GameOverlays';
import { Button } from './ui/button';
import { Maximize, Minimize } from 'lucide-react';
import { useAudioContext } from './AudioProvider';
import { 
  checkOperatingHours, 
  calculateRequiredTaps, 
  animatePrizeNumberSpinning,
  isValidClickTiming,
  calculateTPS,
  checkWinCondition,
  calculateProgressLevel,
  calculateAutoDifficulty
} from './game/utils';
import { GameSettings } from './admin/types';
import { GAME_CONSTANTS, KEYBOARD_KEYS, GAME_STATES } from './game/constants';
import { DeviceStats } from './admin/types';

interface PowerRushGameProps {
  settings: GameSettings;
  currentDeviceId: string;
  deviceStats: DeviceStats;
  onPrizeWon?: (playerName: string, batteryLevel: number, gameDuration: number) => number | null;
  onGameLoss?: (playerName: string, batteryLevel: number, gameDuration: number) => void;
  canDevicePlay: (deviceId: string) => { canPlay: boolean; reason?: string };
  generateUniqueName: () => string;
}

type GameState = 'instructions' | 'countdown' | 'playing' | 'result' | 'blocked';

export function PowerRushGame({ 
  settings, 
  currentDeviceId,
  deviceStats,
  onPrizeWon, 
  onGameLoss,
  canDevicePlay,
  generateUniqueName 
}: PowerRushGameProps) {
  const { playSound, initializeAudio } = useAudioContext();
  const [gameState, setGameState] = useState<GameState>('instructions');
  const [batteryLevel, setBatteryLevel] = useState(0);
  const [timeLeft, setTimeLeft] = useState(settings.duration);
  const [countdown, setCountdown] = useState(GAME_CONSTANTS.COUNTDOWN_SECONDS);
  const [isWinner, setIsWinner] = useState(false);
  const [tapsCount, setTapsCount] = useState(0);
  const [requiredTaps, setRequiredTaps] = useState(100); // Default fallback
  const [continueCountdown, setContinueCountdown] = useState(GAME_CONSTANTS.CONTINUE_COUNTDOWN_SECONDS);
  const [canContinue, setCanContinue] = useState(false);
  const [lastWinTime, setLastWinTime] = useState<number>(0);
  const [wonPrizeNumber, setWonPrizeNumber] = useState<number | null>(null);
  const [heldKeys, setHeldKeys] = useState<Set<string>>(new Set());
  const [isKeySpamming, setIsKeySpamming] = useState(false);
  const [playerName, setPlayerName] = useState<string>('');
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [deviceLimitMessage, setDeviceLimitMessage] = useState<string>('');
  
  // Prize number animation states
  const [isSpinning, setIsSpinning] = useState(false);
  const [displayNumber, setDisplayNumber] = useState<number>(0);
  
  // Anti-cheat states - Enhanced fast clicking detection
  const [clickTimes, setClickTimes] = useState<number[]>([]);
  const [lastClickTime, setLastClickTime] = useState<number>(0);
  const [isTooFast, setIsTooFast] = useState(false);
  const [consecutiveFastClicks, setConsecutiveFastClicks] = useState(0);
  const [clickPenaltyEndTime, setClickPenaltyEndTime] = useState<number>(0);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFullscreenSupported, setIsFullscreenSupported] = useState(false);

  // Generate unique name for this session when game starts
  const generateNewPlayerName = useCallback(() => {
    const name = generateUniqueName();
    setPlayerName(name);
    return name;
  }, [generateUniqueName]);

  // Check if currently in operating hours
  const isInOperatingHours = useCallback(() => {
    return checkOperatingHours(settings);
  }, [settings]);

  // Check device play eligibility - now separated from state update
  const getDeviceEligibility = useCallback(() => {
    return canDevicePlay(currentDeviceId);
  }, [canDevicePlay, currentDeviceId]);

  // Set device blocked state - separate from check
  const setDeviceBlocked = useCallback((reason: string) => {
    setDeviceLimitMessage(reason);
    setGameState('blocked');
  }, []);

  const checkDeviceEligibility = useCallback(() => {
    const eligibility = getDeviceEligibility();
    if (!eligibility.canPlay) {
      // Don't update state during render - use setTimeout to defer
      setTimeout(() => {
        setDeviceBlocked(eligibility.reason || 'Device tidak dapat bermain');
      }, 0);
      return false;
    }
    return true;
  }, [getDeviceEligibility, setDeviceBlocked]);

  // Animate prize number spinning
  const animatePrizeNumber = useCallback((finalNumber: number) => {
    animatePrizeNumberSpinning(
      finalNumber,
      settings.totalPrizes,
      settings.usedPrizeNumbers,
      setDisplayNumber,
      setIsSpinning
    );
  }, [settings.totalPrizes, settings.usedPrizeNumbers]);

  // Handle tap with visual feedback and enhanced anti-cheat
  const handleTap = useCallback(() => {
    if (gameState !== 'playing' || isKeySpamming || isTooFast) return;
    
    const currentTime = Date.now();
    
    // Enhanced anti-cheat: Check if currently in penalty period
    if (currentTime < clickPenaltyEndTime) {
      return; // Still in penalty period, ignore click
    }
    
    // Enhanced anti-cheat: Check click timing with stricter rules
    const timeSinceLastClick = currentTime - lastClickTime;
    const MIN_CLICK_INTERVAL = 50; // Minimum 50ms between clicks (20 CPS max)
    
    if (timeSinceLastClick < MIN_CLICK_INTERVAL) {
      setConsecutiveFastClicks(prev => {
        const newCount = prev + 1;
        
        // Progressive penalty system
        if (newCount >= 3) {
          // After 3 consecutive fast clicks, impose penalty
          const penaltyDuration = Math.min(5000, 1000 * newCount); // Max 5 seconds
          setClickPenaltyEndTime(currentTime + penaltyDuration);
          setIsTooFast(true);
          
          // Reset penalty indication after duration
          setTimeout(() => {
            setIsTooFast(false);
            setConsecutiveFastClicks(0);
          }, penaltyDuration);
          
          return 0; // Reset counter after penalty
        }
        
        return newCount;
      });
      return;
    }
    
    // Reset consecutive fast clicks counter for normal clicks
    setConsecutiveFastClicks(0);
    
    // Standard anti-cheat: Check click timing with existing system
    if (!isValidClickTiming(lastClickTime, currentTime)) {
      setIsTooFast(true);
      setClickPenaltyEndTime(currentTime + 1500); // 1.5 second penalty
      setTimeout(() => setIsTooFast(false), 1500);
      return;
    }
    
    // Play tap sound
    playSound('tap', 0.8);
    
    // Update click history for TPS calculation with enhanced monitoring
    setClickTimes(prev => {
      const newTimes = [...prev, currentTime].slice(-15); // Keep last 15 clicks for better analysis
      const tps = calculateTPS(newTimes);
      
      // Enhanced anti-cheat: More aggressive TPS monitoring
      if (tps > GAME_CONSTANTS.CAP_TPS * 0.8) { // Trigger at 80% of cap
        const penaltyTime = tps > GAME_CONSTANTS.CAP_TPS ? 3000 : 1500; // Longer penalty for higher TPS
        setIsTooFast(true);
        setClickPenaltyEndTime(currentTime + penaltyTime);
        setTimeout(() => setIsTooFast(false), penaltyTime);
        return newTimes;
      }
      
      return newTimes;
    });
    
    setLastClickTime(currentTime);
    
    setTapsCount(prev => {
      const newTapsCount = prev + 1;
      
      // Check win condition using new system FIRST
      if (checkWinCondition(newTapsCount, requiredTaps, timeLeft)) {
        // Force battery level to 100% when winning
        setBatteryLevel(100);
        const gameDuration = Math.round((currentTime - gameStartTime) / 1000);
        
        // Play win sound
        playSound('win', 1.0);
        
        setIsWinner(true);
        setLastWinTime(currentTime);
        setContinueCountdown(GAME_CONSTANTS.CONTINUE_COUNTDOWN_SECONDS);
        setCanContinue(false);
        setGameState('result');
        
        // Record win and get prize number (only if prize numbers are enabled)
        if (onPrizeWon && settings.prizeNumbersEnabled !== false) {
          const prizeNumber = onPrizeWon(playerName, 100, gameDuration);
          if (prizeNumber) {
            // Start spinning animation with sound
            playSound('prizeSpinning', 0.9);
            animatePrizeNumber(prizeNumber);
            setWonPrizeNumber(prizeNumber);
          }
        } else if (onPrizeWon && settings.prizeNumbersEnabled === false) {
          // Just record the win without a prize number
          onPrizeWon(playerName, 100, gameDuration);
        }
      } else {
        // Update progress bar with non-linear calculation (visual only)
        // Cap at 99% to prevent showing 100% before actual win
        // This ensures the player doesn't see 100% until they actually win
        // The ease-out curve makes progress feel faster at start, slower near end
        const currentDifficulty = settings.autoDifficultyEnabled 
          ? calculateAutoDifficulty(settings) 
          : settings.difficultyMultiplier;
        const newLevel = Math.min(99, calculateProgressLevel(newTapsCount, requiredTaps, currentDifficulty));
        setBatteryLevel(newLevel);
      }
      
      return newTapsCount;
    });
    
    // Visual feedback is now handled by GamePlay component
  }, [gameState, requiredTaps, onPrizeWon, isKeySpamming, isTooFast, animatePrizeNumber, playerName, gameStartTime, lastClickTime, timeLeft, setClickTimes, playSound, settings]);

  const resetGame = useCallback(() => {
    setContinueCountdown(GAME_CONSTANTS.CONTINUE_COUNTDOWN_SECONDS);
    setCanContinue(false);
    setWonPrizeNumber(null);
    setHeldKeys(new Set());
    setIsKeySpamming(false);
    setIsSpinning(false);
    setDisplayNumber(0);
    setGameStartTime(0);
    
    // Reset enhanced anti-cheat states
    setClickTimes([]);
    setLastClickTime(0);
    setIsTooFast(false);
    setConsecutiveFastClicks(0);
    setClickPenaltyEndTime(0);
    
    // Check if device can still play after this game
    const eligibility = getDeviceEligibility();
    if (eligibility.canPlay) {
      setGameState('instructions');
      // Generate new player name for next game
      generateNewPlayerName();
    } else {
      setDeviceBlocked(eligibility.reason || 'Device tidak dapat bermain');
    }
  }, [getDeviceEligibility, generateNewPlayerName, setDeviceBlocked]);

  const startGame = useCallback(() => {
    // Initialize audio on first interaction
    initializeAudio();
    
    // Check device eligibility first
    const eligibility = getDeviceEligibility();
    if (!eligibility.canPlay) {
      setDeviceBlocked(eligibility.reason || 'Device tidak dapat bermain');
      return;
    }

    // Check if prizes are available
    if (settings.currentPrizes <= 0) {
      alert('Maaf, hadiah sudah habis! Silakan coba lagi nanti.');
      return;
    }
    
    // Check operating hours if enabled
    if (settings.operatingHoursEnabled && !isInOperatingHours()) {
      const [startHour, startMin] = settings.operatingHours.start.split(':');
      const [endHour, endMin] = settings.operatingHours.end.split(':');
      alert(`Maaf, game hanya tersedia pada jam ${startHour}:${startMin} - ${endHour}:${endMin}. Silakan coba lagi nanti!`);
      return;
    }
    
    // Reset game state
    setBatteryLevel(0);
    setTapsCount(0);
    setTimeLeft(settings.duration);
    setCountdown(GAME_CONSTANTS.COUNTDOWN_SECONDS);
    setIsWinner(false);
    setWonPrizeNumber(null);
    setHeldKeys(new Set());
    setIsKeySpamming(false);
    setIsSpinning(false);
    setDisplayNumber(0);
    setGameStartTime(Date.now()); // Record game start time
    
    // Reset enhanced anti-cheat states
    setClickTimes([]);
    setLastClickTime(0);
    setIsTooFast(false);
    setConsecutiveFastClicks(0);
    setClickPenaltyEndTime(0);
    
    // Required taps will be set by the useEffect when gameState changes to countdown
    setGameState('countdown');
  }, [settings, isInOperatingHours, getDeviceEligibility, setDeviceBlocked, initializeAudio]);

  // Check fullscreen status and listen for changes
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

  // Toggle fullscreen function
  const toggleFullscreen = useCallback(async () => {
    if (!isFullscreenSupported) {
      return; // Don't show alert for floating button, just don't do anything
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
      // Silently fail for floating button to avoid interrupting gameplay
    }
  }, [isFullscreen, isFullscreenSupported]);

  // Handle keyboard input with improved anti-spam (only for held keys)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Handle F11 for fullscreen toggle (only if supported)
      if (event.key === 'F11' && isFullscreenSupported) {
        event.preventDefault();
        toggleFullscreen();
        return;
      }

      // Check if this is a repeat event (key being held down)
      if (event.repeat && (event.code === KEYBOARD_KEYS.SPACE || event.code === KEYBOARD_KEYS.ENTER)) {
        // Key is being held down - set spam flag
        setIsKeySpamming(true);
        return;
      }

      if ((gameState === GAME_STATES.INSTRUCTIONS || gameState === 'blocked') && (event.code === KEYBOARD_KEYS.SPACE || event.code === KEYBOARD_KEYS.ENTER)) {
        event.preventDefault();
        if (gameState === 'blocked') {
          // Try to reset to instructions if device limit allows
          const eligibility = getDeviceEligibility();
          if (eligibility.canPlay) {
            setGameState('instructions');
          }
          return;
        }
        // Check same conditions as button
        if (settings.currentPrizes > 0 && (!settings.operatingHoursEnabled || isInOperatingHours())) {
          startGame();
        }
      }
      if (gameState === GAME_STATES.PLAYING && (event.code === KEYBOARD_KEYS.SPACE || event.code === KEYBOARD_KEYS.ENTER)) {
        event.preventDefault();
        // Only handle if not key spamming or too fast
        if (!isKeySpamming && !isTooFast) {
          handleTap();
        }
      }
      if (gameState === GAME_STATES.RESULT && canContinue && (event.code === KEYBOARD_KEYS.SPACE || event.code === KEYBOARD_KEYS.ENTER)) {
        event.preventDefault();
        resetGame();
      }

      // Track held keys
      if (event.code === KEYBOARD_KEYS.SPACE || event.code === KEYBOARD_KEYS.ENTER) {
        setHeldKeys(prev => new Set(prev).add(event.code));
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === KEYBOARD_KEYS.SPACE || event.code === KEYBOARD_KEYS.ENTER) {
        event.preventDefault();
        // Remove from held keys
        setHeldKeys(prev => {
          const newSet = new Set(prev);
          newSet.delete(event.code);
          return newSet;
        });
        
        // Reset spam flag when key is released
        setIsKeySpamming(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, canContinue, handleTap, resetGame, startGame, settings, isInOperatingHours, isKeySpamming, isTooFast, getDeviceEligibility, toggleFullscreen, isFullscreenSupported]);

  // Game timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (gameState === GAME_STATES.PLAYING && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Game ended - record as loss and check battery level
            const currentTime = Date.now();
            const gameDuration = Math.round((currentTime - gameStartTime) / 1000);
            
            setTimeout(() => {
              setBatteryLevel(current => {
                const won = current >= 100;
                setIsWinner(won);
                setContinueCountdown(GAME_CONSTANTS.CONTINUE_COUNTDOWN_SECONDS);
                setCanContinue(false);
                setGameState('result');
                
                // Record loss if didn't win
                if (!won) {
                  // Play loss sound first
                  playSound('loss', 1.0);
                  // Then record the loss
                  if (onGameLoss) {
                    onGameLoss(playerName, current, gameDuration);
                  }
                }
                
                return current;
              });
            }, 0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [gameState, timeLeft, onGameLoss, playerName, gameStartTime, playSound]);

  // Countdown timer with sound effects
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (gameState === GAME_STATES.COUNTDOWN) {
      // Play sound immediately when countdown starts (for the first number)
      playSound('countdown', 0.8);
      
      interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            // Play epic game start sound when countdown finishes (after "1")
            playSound('gameStart', 1.0);
            setGameState('playing');
            return 0;
          }
          // Play countdown sound for each remaining number (before decrementing)
          playSound('countdown', 0.8);
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [gameState, playSound]);

  // Continue countdown timer for result screen
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (gameState === GAME_STATES.RESULT && continueCountdown > 0) {
      interval = setInterval(() => {
        setContinueCountdown(prev => {
          if (prev <= 1) {
            setCanContinue(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [gameState, continueCountdown]);

  // Update game settings when settings change (real-time integration)
  useEffect(() => {
    // Only update if game is not currently being played
    if (gameState === GAME_STATES.INSTRUCTIONS) {
      setTimeLeft(settings.duration);
    }
  }, [settings.duration, gameState]);

  // Generate initial player name on component mount
  useEffect(() => {
    if (!playerName) {
      generateNewPlayerName();
    }
  }, [playerName, generateNewPlayerName]);

  // Calculate required taps based on difficulty system
  useEffect(() => {
    const newRequiredTaps = calculateRequiredTaps(settings, lastWinTime, gameState);
    setRequiredTaps(newRequiredTaps);
  }, [settings, gameState, lastWinTime]);

  // Check device eligibility on mount and settings change
  useEffect(() => {
    if (gameState === GAME_STATES.INSTRUCTIONS) {
      const eligibility = getDeviceEligibility();
      if (!eligibility.canPlay) {
        setDeviceBlocked(eligibility.reason || 'Device tidak dapat bermain');
      }
    }
  }, [gameState, getDeviceEligibility, setDeviceBlocked, settings.gameRules]);

  return (
    <div className="min-h-screen bg-blue-500 relative overflow-hidden">
      {/* Simple background pattern - no gradients */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-400 rounded-full opacity-20"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-400 rounded-full opacity-15"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-300 rounded-full opacity-10"></div>
      </div>
      
      {/* Game Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
        
        {/* Instructions Screen */}
        {gameState === GAME_STATES.INSTRUCTIONS && (
          <GameInstructions
            settings={settings}
            playerName={playerName}
            deviceStats={deviceStats}
            onStartGame={startGame}
            isInOperatingHours={isInOperatingHours()}
          />
        )}

        {/* Device Blocked Screen */}
        {gameState === 'blocked' && (
          <div className="text-center bg-white border-2 border-red-200 shadow-xl rounded-lg p-8">
            <div className="mb-6">
              <div className="text-8xl mb-4">🚫</div>
              <h1 className="text-3xl font-bold mb-3 text-red-600">
                Batas Tercapai
              </h1>
              <p className="text-gray-700 text-lg mb-6">
                {deviceLimitMessage}
              </p>
              
              <div className="p-4 bg-red-50 rounded-lg border-2 border-red-200 mb-6">
                <h3 className="text-lg font-semibold mb-2 text-red-800">Statistik Device Anda:</h3>
                <div className="text-sm space-y-1 text-red-700">
                  <p>Total Permainan: {deviceStats.totalPlays} / {settings.gameRules.maxPlaysPerDevice}</p>
                  <p>Total Kemenangan: {deviceStats.totalWins} / {settings.gameRules.maxWinsPerDevice}</p>
                  <p>Device ID: {currentDeviceId}</p>
                  {deviceStats.isWhitelisted && (
                    <p className="text-green-600 font-semibold">✓ Device Whitelisted</p>
                  )}
                </div>
              </div>
              
              <p className="text-gray-600 text-sm">
                Hubungi admin untuk informasi lebih lanjut
              </p>
            </div>
          </div>
        )}

        {/* Game Screen - Responsive and proportional design */}
        {(gameState === GAME_STATES.COUNTDOWN || gameState === GAME_STATES.PLAYING) && (
          <GamePlay
            timeLeft={timeLeft}
            batteryLevel={batteryLevel}
            isKeySpamming={isKeySpamming}
            gameState={gameState}
            onTap={handleTap}
            isTooFast={isTooFast}
          />
        )}
        
        </div>
      </div>

      {/* Floating Fullscreen Button - Only show when not in instructions and if supported */}
      {gameState !== GAME_STATES.INSTRUCTIONS && isFullscreenSupported && (
        <Button
          onClick={toggleFullscreen}
          size="sm"
          className="fixed top-4 left-4 z-50 h-10 w-10 p-0 bg-white/80 hover:bg-white border-2 border-blue-200 text-blue-600 hover:text-blue-700 shadow-lg backdrop-blur-sm"
          title={isFullscreen ? 'Keluar Fullscreen (F11)' : 'Masuk Fullscreen (F11)'}
        >
          {isFullscreen ? (
            <Minimize className="w-4 h-4" />
          ) : (
            <Maximize className="w-4 h-4" />
          )}
        </Button>
      )}

      {/* Countdown Overlay */}
      {gameState === GAME_STATES.COUNTDOWN && (
        <CountdownOverlay countdown={countdown} />
      )}

      {/* Result Overlay */}
      {gameState === GAME_STATES.RESULT && (
        <ResultOverlay
          isWinner={isWinner}
          playerName={playerName}
          batteryLevel={batteryLevel}
          wonPrizeNumber={wonPrizeNumber}
          isSpinning={isSpinning}
          displayNumber={displayNumber}
          canContinue={canContinue}
          continueCountdown={continueCountdown}
          onContinue={resetGame}
        />
      )}
    </div>
  );
}
