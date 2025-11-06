import { GAME_CONSTANTS, GAME_COLORS } from './constants';
import { GameSettings } from '../admin/types';

export const checkOperatingHours = (settings: GameSettings): boolean => {
  if (!settings.operatingHoursEnabled) return true;
  
  const now = new Date();
  const [startHour, startMin] = settings.operatingHours.start.split(':').map(Number);
  const [endHour, endMin] = settings.operatingHours.end.split(':').map(Number);
  
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
};

// Helper function to get current used prize numbers (backward compatibility)
export const getCurrentUsedPrizeNumbers = (settings: GameSettings): number[] => {
  // Use new system if available, otherwise fallback to old system
  if (settings.usedPrizeHistory && settings.usedPrizeHistory.length > 0) {
    return settings.usedPrizeHistory.map(item => item.number);
  }
  return settings.usedPrizeNumbers || [];
};

// Calculate auto difficulty based on remaining prizes and time
export const calculateAutoDifficulty = (settings: GameSettings): number => {
  if (!settings.autoDifficultyEnabled) {
    return settings.difficultyMultiplier;
  }
  
  // Calculate prize progress (0 = all prizes left, 1 = no prizes left)
  const prizesUsed = settings.totalPrizes - settings.currentPrizes;
  const prizeProgress = Math.max(0, Math.min(1, prizesUsed / settings.totalPrizes));
  
  // Get max limit from settings (default 80% if not set)
  const maxLimit = settings.autoDifficultyMaxLimit || 80;
  const minLimit = 30; // Minimum 30% difficulty to keep it challenging
  
  // Base difficulty from settings
  let autoDifficulty = settings.difficultyMultiplier;
  
  // Auto difficulty logic based on operating hours
  if (settings.operatingHoursEnabled) {
    // WITH operating hours: time-based distribution
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMin] = settings.operatingHours.start.split(':').map(Number);
    const [endHour, endMin] = settings.operatingHours.end.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    // If currently in operating hours
    if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
      // Calculate time progress (0 = start, 1 = end)
      const totalOperatingMinutes = endMinutes - startMinutes;
      const elapsedMinutes = currentMinutes - startMinutes;
      const timeProgress = Math.max(0, Math.min(1, elapsedMinutes / totalOperatingMinutes));
      
      // Compare prize distribution vs time progress
      const targetPrizeProgress = timeProgress;
      const scheduleDeviation = prizeProgress - targetPrizeProgress;
      
      // Adjust difficulty based on schedule (more conservative)
      const maxAdjustment = 25; // Maximum ±25% adjustment (reduced from 35%)
      const adjustment = scheduleDeviation * maxAdjustment;
      
      autoDifficulty = Math.max(minLimit, Math.min(maxLimit, autoDifficulty + adjustment));
      
      // Emergency adjustment: Near end of operating hours with many prizes left
      if (timeProgress > 0.8 && prizeProgress < 0.6) {
        const urgencyFactor = (timeProgress - 0.8) / 0.2; // 0 to 1
        const excessPrizes = Math.max(0, 0.6 - prizeProgress); // How much we're behind
        const urgencyAdjustment = urgencyFactor * excessPrizes * 40; // Up to -40% difficulty (reduced from 60%)
        autoDifficulty = Math.max(minLimit, autoDifficulty - urgencyAdjustment);
      }
    }
    // If outside operating hours, use static adjustment based on overall progress
    else {
      // Make it slightly harder if too many prizes have been given out
      if (prizeProgress > 0.7) {
        autoDifficulty = Math.min(maxLimit, autoDifficulty + 15);
      }
      // Make it slightly easier if too few prizes given out
      else if (prizeProgress < 0.3) {
        autoDifficulty = Math.max(minLimit, autoDifficulty - 10);
      }
    }
  } 
  // WITHOUT operating hours: purely prize-based distribution
  else {
    // Smart distribution based on prize depletion rate
    // More prizes left = make it easier to maintain engagement
    // Fewer prizes left = make it harder to preserve prizes
    
    const remainingPrizeRatio = settings.currentPrizes / settings.totalPrizes;
    
    if (remainingPrizeRatio > 0.7) {
      // Lots of prizes left (>70%), make it moderately easier
      autoDifficulty = Math.max(minLimit, autoDifficulty - 15);
    } else if (remainingPrizeRatio > 0.4) {
      // Medium prizes left (40-70%), keep close to base
      const adjustment = (0.7 - remainingPrizeRatio) * 20; // 0 to 6% harder
      autoDifficulty = Math.min(maxLimit, autoDifficulty + adjustment);
    } else if (remainingPrizeRatio > 0.15) {
      // Low prizes left (15-40%), make it harder
      const adjustment = (0.4 - remainingPrizeRatio) * 40; // 0 to 10% harder
      autoDifficulty = Math.min(maxLimit, autoDifficulty + adjustment);
    } else {
      // Very few prizes left (<15%), make it quite hard but not impossible
      autoDifficulty = Math.min(maxLimit, autoDifficulty + 25);
    }
    
    // Additional smart adjustments
    // If prize distribution seems too fast, increase difficulty
    if (prizeProgress > 0.8) {
      autoDifficulty = Math.min(maxLimit, autoDifficulty + 10);
    }
  }
  
  // Ensure we respect both min and max limits
  autoDifficulty = Math.max(minLimit, Math.min(maxLimit, autoDifficulty));
  
  return Math.round(autoDifficulty);
};

// Get current effective difficulty (for display purposes)
export const getCurrentEffectiveDifficulty = (settings: GameSettings): { difficulty: number; isAuto: boolean; info: string } => {
  if (!settings.autoDifficultyEnabled) {
    return { 
      difficulty: settings.difficultyMultiplier, 
      isAuto: false, 
      info: 'Manual' 
    };
  }
  
  const autoDifficulty = calculateAutoDifficulty(settings);
  const diff = autoDifficulty - settings.difficultyMultiplier;
  
  let info = 'Auto';
  if (Math.abs(diff) > 5) {
    if (diff > 0) {
      info = `Auto (+${diff.toFixed(0)}%)`;
    } else {
      info = `Auto (${diff.toFixed(0)}%)`;
    }
  }
  
  return { 
    difficulty: autoDifficulty, 
    isAuto: true, 
    info 
  };
};

// Triangular distribution sampling for more natural randomness
const triangularSample = (min: number, mode: number, max: number): number => {
  const u = Math.random();
  const c = (mode - min) / (max - min);
  
  if (u < c) {
    return min + Math.sqrt(u * (max - min) * (mode - min));
  } else {
    return max - Math.sqrt((1 - u) * (max - min) * (max - mode));
  }
};

// Linear interpolation
const lerp = (a: number, b: number, t: number): number => {
  return a + (b - a) * t;
};

// Calculate required clicks for current round using new manual random system
export const calculateRequiredClicks = (settings: GameSettings): number => {
  // Use auto difficulty if enabled, otherwise use manual setting
  const difficulty = settings.autoDifficultyEnabled ? calculateAutoDifficulty(settings) : settings.difficultyMultiplier;
  
  const D = settings.duration || GAME_CONSTANTS.DEFAULT_DURATION;
  const capTps = GAME_CONSTANTS.CAP_TPS;
  const rLo = GAME_CONSTANTS.R_LO;
  const rHi = Math.min(GAME_CONSTANTS.R_HI, capTps);
  const gamma = GAME_CONSTANTS.GAMMA;
  
  // 1. Calculate target rate (non-linear)
  const x = difficulty / 100;
  const rTarget = rLo + (rHi - rLo) * Math.pow(x, gamma);
  
  // 2. Calculate center click count
  const nStar = rTarget * D;
  
  // 3. Calculate variance (tighter range at higher difficulty)
  const eta = lerp(GAME_CONSTANTS.VARIANCE_MAX, GAME_CONSTANTS.VARIANCE_MIN, x);
  
  // 4. Calculate range bounds
  const nMin = Math.ceil(rLo * D);
  const nMax = Math.floor(rHi * D);
  
  let nLow = Math.max(nMin, Math.ceil(nStar * (1 - eta)));
  let nHigh = Math.min(nMax, Math.ceil(nStar * (1 + eta)));
  
  // 5. Optional lucky/hard spikes
  const random = Math.random();
  let spikeMultiplier = 1;
  
  if (random < GAME_CONSTANTS.LUCKY_SPIKE_CHANCE) {
    // Lucky spike - easier
    spikeMultiplier = 1 - GAME_CONSTANTS.SPIKE_MULTIPLIER;
  } else if (random < GAME_CONSTANTS.LUCKY_SPIKE_CHANCE + GAME_CONSTANTS.HARD_SPIKE_CHANCE) {
    // Hard spike - harder  
    spikeMultiplier = 1 + GAME_CONSTANTS.SPIKE_MULTIPLIER;
  }
  
  nLow = Math.max(nMin, Math.ceil(nLow * spikeMultiplier));
  nHigh = Math.min(nMax, Math.ceil(nHigh * spikeMultiplier));
  
  // 6. Sample from triangular distribution
  const requiredClicks = Math.round(triangularSample(nLow, nStar, nHigh));
  
  return Math.max(nMin, Math.min(nMax, requiredClicks));
};

// Anti-cheat: Validate click timing
export const isValidClickTiming = (lastClickTime: number, currentTime: number): boolean => {
  const timeDiff = currentTime - lastClickTime;
  return timeDiff >= GAME_CONSTANTS.MIN_CLICK_GAP;
};

// Anti-cheat: Calculate current TPS and check if it exceeds human limits
export const calculateTPS = (clickTimes: number[], windowMs: number = 1000): number => {
  const now = Date.now();
  const recentClicks = clickTimes.filter(time => now - time <= windowMs);
  return recentClicks.length;
};

// Check if player has reached the required clicks to win
export const checkWinCondition = (
  totalClicks: number, 
  requiredClicks: number, 
  timeLeft: number
): boolean => {
  return totalClicks >= requiredClicks && timeLeft > 0;
};

// Main function to get required taps for current game (replaces old calculateRequiredTaps)
export const calculateRequiredTaps = (
  settings: GameSettings, 
  lastWinTime: number, 
  gameState: string
): number => {
  // Only calculate new requirement when starting a new game
  if (gameState !== 'instructions' && gameState !== 'countdown') {
    // Return a reasonable default if called during gameplay
    return calculateRequiredClicks(settings);
  }

  // Anti-win-spam: prevent consecutive wins too quickly
  const now = Date.now();
  const timeSinceLastWin = now - lastWinTime;
  const preventWin = timeSinceLastWin < GAME_CONSTANTS.WIN_PREVENTION_DELAY;
  
  if (preventWin) {
    // Make it significantly harder if too soon after last win
    const tempSettings = {
      ...settings,
      difficultyMultiplier: Math.min(95, settings.difficultyMultiplier + 30)
    };
    return calculateRequiredClicks(tempSettings);
  }
  
  return calculateRequiredClicks(settings);
};

export const getAvailablePrizeNumbers = (settings: GameSettings): number[] => {
  const usedNumbers = getCurrentUsedPrizeNumbers(settings);
  return Array.from({ length: settings.totalPrizes }, (_, i) => i + 1)
    .filter(num => !usedNumbers.includes(num));
};

export const getBatteryColorClass = (batteryLevel: number): string => {
  if (batteryLevel < GAME_CONSTANTS.BATTERY_LOW_THRESHOLD) {
    return GAME_COLORS.BATTERY_LOW;
  } else if (batteryLevel < GAME_CONSTANTS.BATTERY_MEDIUM_THRESHOLD) {
    return GAME_COLORS.BATTERY_HIGH;
  } else {
    return GAME_COLORS.BATTERY_HIGH;
  }
};

export const getBatteryGlowColor = (batteryLevel: number): string => {
  if (batteryLevel < GAME_CONSTANTS.BATTERY_LOW_THRESHOLD) {
    return GAME_COLORS.BATTERY_LOW_GLOW;
  } else if (batteryLevel < GAME_CONSTANTS.BATTERY_MEDIUM_THRESHOLD) {
    return GAME_COLORS.BATTERY_MEDIUM_GLOW;
  } else {
    return GAME_COLORS.BATTERY_HIGH_GLOW;
  }
};

/**
 * Calculate non-linear progress for battery level
 * Creates a "fast start, slow finish" effect that makes the game more engaging
 * Uses an easing curve based on difficulty setting
 * @param tapsCount - Current number of taps
 * @param requiredTaps - Required taps to win
 * @param difficulty - Current difficulty (0-100)
 * @returns Progress percentage (0-100)
 */
export const calculateProgressLevel = (
  tapsCount: number, 
  requiredTaps: number,
  difficulty: number = 50
): number => {
  // Linear progress (0 to 1)
  const linearProgress = Math.min(1, tapsCount / requiredTaps);
  
  // Apply non-linear easing curve based on difficulty
  // Higher difficulty = more dramatic slow-down at the end
  // Lower difficulty = more linear progression
  
  // Calculate easing exponent (1.5 to 2.5 based on difficulty)
  // At 0% difficulty: exponent = 1.3 (slight curve)
  // At 50% difficulty: exponent = 1.8 (moderate curve)
  // At 100% difficulty: exponent = 2.3 (strong curve)
  const easingExponent = 1.3 + (difficulty / 100) * 1.0;
  
  // Apply ease-out curve: starts fast, ends slow
  // Formula: 1 - (1 - x)^n where n is the easing exponent
  const easedProgress = 1 - Math.pow(1 - linearProgress, easingExponent);
  
  // Convert to percentage and cap at 100
  return Math.min(100, easedProgress * 100);
};

export const generateParticleStyle = (index: number, batteryLevel: number, isCharging = false) => ({
  left: `${20 + index * 12}%`,
  bottom: `${5 + Math.random() * Math.max(batteryLevel - 10, 5)}%`,
  animationDelay: `${index * 0.2}s`,
  animationDuration: `${GAME_CONSTANTS.PARTICLE_ANIMATION_BASE_DURATION + Math.random() * GAME_CONSTANTS.PARTICLE_ANIMATION_RANDOM_RANGE}ms`,
  transform: isCharging ? 'scale(1.5)' : 'scale(1)',
  transition: 'transform 0.2s ease-out'
});

export const animatePrizeNumberSpinning = (
  finalNumber: number,
  totalPrizes: number,
  usedNumbers: number[],
  setDisplayNumber: (num: number) => void,
  setIsSpinning: (spinning: boolean) => void
): void => {
  setIsSpinning(true);
  
  const availableNumbers = Array.from({ length: totalPrizes }, (_, i) => i + 1)
    .filter(num => !usedNumbers.includes(num));
  
  let spinCount = 0;
  
  const spinInterval = setInterval(() => {
    if (spinCount < GAME_CONSTANTS.MAX_ANIMATION_SPINS) {
      const randomNumber = availableNumbers[Math.floor(Math.random() * availableNumbers.length)];
      setDisplayNumber(randomNumber);
      spinCount++;
    } else {
      clearInterval(spinInterval);
      
      let finalSequence = 0;
      const finalInterval = setInterval(() => {
        if (finalSequence < GAME_CONSTANTS.FINAL_SEQUENCE_SPINS) {
          const nearNumbers = [finalNumber - 1, finalNumber + 1, finalNumber - 2].filter(n => 
            n >= 1 && n <= totalPrizes && !usedNumbers.includes(n)
          );
          if (nearNumbers.length > 0) {
            setDisplayNumber(nearNumbers[finalSequence % nearNumbers.length]);
          }
          finalSequence++;
        } else {
          setDisplayNumber(finalNumber);
          setIsSpinning(false);
          clearInterval(finalInterval);
        }
      }, GAME_CONSTANTS.FINAL_SEQUENCE_DELAY);
    }
  }, GAME_CONSTANTS.PRIZE_ANIMATION_DURATION / GAME_CONSTANTS.MAX_ANIMATION_SPINS);
};