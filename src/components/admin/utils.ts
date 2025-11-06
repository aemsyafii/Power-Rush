import { GameSettings, GameLog, AnalyticsData, DeviceStats } from './types';
import { ADMIN_CONSTANTS, ADMIN_COLORS, DIFFICULTY_LEVELS, FILTER_OPTIONS } from './constants';

export const getAdminPassword = (): string => {
  return localStorage.getItem('batteryGameAdminPassword') || ADMIN_CONSTANTS.DEFAULT_ADMIN_PASSWORD;
};

export const saveAdminPassword = (password: string): void => {
  localStorage.setItem('batteryGameAdminPassword', password);
};

export const getCurrentTime = (): string => {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const isOperatingHours = (settings: GameSettings): boolean => {
  if (!settings.operatingHoursEnabled) return true;
  
  const now = new Date();
  const [startHour, startMin] = settings.operatingHours.start.split(':').map(Number);
  const [endHour, endMin] = settings.operatingHours.end.split(':').map(Number);
  
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
};

export const getDifficultyDescription = (difficulty: number): string => {
  const level = DIFFICULTY_LEVELS.find(level => difficulty <= level.threshold);
  return level?.label || 'Sangat Sulit';
};

export const getDifficultyColor = (difficulty: number): string => {
  const level = DIFFICULTY_LEVELS.find(level => difficulty <= level.threshold);
  return level?.color || ADMIN_COLORS.DIFFICULTY_VERY_HARD;
};

export const getProgressColor = (current: number, max: number): string => {
  const percentage = (current / max) * 100;
  if (percentage < 50) return ADMIN_COLORS.PROGRESS_GOOD;
  if (percentage < 80) return ADMIN_COLORS.PROGRESS_WARNING;
  return ADMIN_COLORS.PROGRESS_DANGER;
};

export const calculateWinProbability = (settings: GameSettings): number => {
  const { currentPrizes, totalPrizes, difficultyMultiplier, operatingHoursEnabled } = settings;
  
  let finalDifficulty = difficultyMultiplier;
  
  if (operatingHoursEnabled) {
    if (!isOperatingHours(settings)) {
      finalDifficulty = 95;
    } else {
      const now = new Date();
      const [startHour, startMin] = settings.operatingHours.start.split(':').map(Number);
      const [endHour, endMin] = settings.operatingHours.end.split(':').map(Number);
      
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      const totalMinutes = endMinutes - startMinutes;
      const progressMinutes = currentMinutes - startMinutes;
      
      const timeProgress = Math.max(0, Math.min(1, progressMinutes / totalMinutes));
      const prizeRatio = currentPrizes / totalPrizes;
      const targetDistribution = 1 - timeProgress;
      
      let distributionFactor = 1;
      if (prizeRatio > targetDistribution + 0.2) {
        distributionFactor = 0.5 + (timeProgress * 0.5);
      } else if (prizeRatio < targetDistribution - 0.2) {
        distributionFactor = 1.5 - (timeProgress * 0.3);
      }
      
      const baseDifficulty = 60 - (timeProgress * 40);
      finalDifficulty = Math.max(5, Math.min(95, baseDifficulty * distributionFactor));
    }
  }
  
  const prizeRatio = currentPrizes / totalPrizes;
  if (prizeRatio < ADMIN_CONSTANTS.PRIZE_LOW_THRESHOLD) {
    finalDifficulty += 20;
  } else if (prizeRatio < ADMIN_CONSTANTS.PRIZE_MEDIUM_THRESHOLD) {
    finalDifficulty += 10;
  }
  
  finalDifficulty = Math.max(0, Math.min(100, finalDifficulty));
  const winProbability = 100 - finalDifficulty;
  
  return Math.max(0, Math.min(100, Math.round(winProbability)));
};

export const getPreviewWinProbability = (settings: GameSettings): number => {
  if (!settings.operatingHoursEnabled) {
    return 100 - settings.difficultyMultiplier;
  }
  return calculateWinProbability(settings);
};

// Analytics-specific utility functions
export const getAnalyticsData = (gameLogs: GameLog[]): AnalyticsData => {
  const totalGames = gameLogs.length;
  const totalWins = gameLogs.filter(log => log.result === 'win').length;
  const totalLosses = gameLogs.filter(log => log.result === 'loss').length;
  const uniqueDevices = new Set(gameLogs.map(log => log.deviceId)).size;
  
  // Today's data
  const today = new Date().toDateString();
  const todayLogs = gameLogs.filter(log => new Date(log.timestamp).toDateString() === today);
  const todayGames = todayLogs.length;
  const todayWins = todayLogs.filter(log => log.result === 'win').length;
  
  // Win rate
  const winRate = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;
  
  // Prize distribution
  const prizeNumbers = gameLogs
    .filter(log => log.prizeNumber)
    .map(log => log.prizeNumber!)
    .sort((a, b) => a - b);
  
  // Hourly activity (last 24 hours)
  const hourlyActivity = Array.from({ length: ADMIN_CONSTANTS.ANALYTICS_HOURLY_DATA_POINTS }, (_, hour) => {
    const hourLogs = gameLogs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate.getHours() === hour;
    });
    return {
      hour,
      games: hourLogs.length,
      wins: hourLogs.filter(log => log.result === 'win').length
    };
  });
  
  // Top devices by activity
  const deviceActivity = Array.from(new Set(gameLogs.map(log => log.deviceId))).map(deviceId => {
    const deviceLogs = gameLogs.filter(log => log.deviceId === deviceId);
    return {
      deviceId,
      plays: deviceLogs.length,
      wins: deviceLogs.filter(log => log.result === 'win').length
    };
  }).sort((a, b) => b.plays - a.plays).slice(0, ADMIN_CONSTANTS.ANALYTICS_TOP_DEVICES_LIMIT);

  return {
    totalPlayers: uniqueDevices,
    totalGames,
    totalWins,
    totalLosses,
    winRate,
    uniqueDevices,
    todayGames,
    todayWins,
    prizeDistribution: prizeNumbers,
    hourlyActivity,
    topDevices: deviceActivity
  };
};

export const filterLogs = (logs: GameLog[], filter: string, searchTerm: string, timeFilter?: string, deviceId?: string): GameLog[] => {
  let filtered = logs;
  
  // Result filter
  if (filter !== 'all') {
    filtered = filtered.filter(log => log.result === filter.slice(0, -1)); // Remove 's' from 'wins'/'losses'
  }

  // Time filter
  if (timeFilter && timeFilter !== 'all') {
    const now = new Date();
    const filterDate = new Date();
    
    switch (timeFilter) {
      case 'today':
        filtered = filtered.filter(log => 
          new Date(log.timestamp).toDateString() === now.toDateString()
        );
        break;
      case 'week':
        filterDate.setDate(now.getDate() - 7);
        filtered = filtered.filter(log => 
          new Date(log.timestamp) >= filterDate
        );
        break;
      case 'month':
        filterDate.setMonth(now.getMonth() - 1);
        filtered = filtered.filter(log => 
          new Date(log.timestamp) >= filterDate
        );
        break;
    }
  }
  
  // Search filter
  if (searchTerm) {
    const searchLower = searchTerm.toLowerCase();
    filtered = filtered.filter(log => 
      log.playerName.toLowerCase().includes(searchLower) ||
      log.deviceId.toLowerCase().includes(searchLower) ||
      log.result.includes(searchLower)
    );
  }

  // Device filter
  if (deviceId) {
    filtered = filtered.filter(log => log.deviceId === deviceId);
  }
  
  return filtered;
};

export const exportLogsToCSV = (logs: GameLog[], filename?: string): void => {
  const csvData = [
    ADMIN_CONSTANTS.CSV_HEADERS.join(','),
    ...logs.map(log => [
      log.id,
      `"${log.playerName}"`,
      log.deviceId,
      log.result,
      log.prizeNumber || '',
      log.batteryLevel,
      log.gameDuration,
      `"${new Date(log.timestamp).toLocaleString()}"`
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename || `game-analytics-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const getDeviceStats = (deviceId: string, gameLogs: GameLog[], whitelistedDevices: string[]): DeviceStats => {
  const deviceLogs = gameLogs.filter(log => log.deviceId === deviceId);
  return {
    totalPlays: deviceLogs.length,
    totalWins: deviceLogs.filter(log => log.result === 'win').length,
    totalLosses: deviceLogs.filter(log => log.result === 'loss').length,
    isWhitelisted: whitelistedDevices.includes(deviceId),
    recentGames: deviceLogs.slice(0, ADMIN_CONSTANTS.ANALYTICS_RECENT_GAMES_LIMIT)
  };
};

export const getAvailablePrizeNumbers = (settings: GameSettings): number[] => {
  return Array.from({ length: settings.totalPrizes }, (_, i) => i + 1)
    .filter(num => !settings.usedPrizeNumbers.includes(num));
};

export const animateSpinning = (
  finalNumber: number,
  availableNumbers: number[],
  setDisplayNumber: (num: number) => void,
  setIsSpinning: (spinning: boolean) => void
): void => {
  setIsSpinning(true);
  
  let spinCount = 0;
  
  const spinInterval = setInterval(() => {
    if (spinCount < ADMIN_CONSTANTS.MAX_ANIMATION_SPINS) {
      const randomNumber = availableNumbers[Math.floor(Math.random() * availableNumbers.length)];
      setDisplayNumber(randomNumber);
      spinCount++;
    } else {
      clearInterval(spinInterval);
      
      let finalSequence = 0;
      const finalInterval = setInterval(() => {
        if (finalSequence < ADMIN_CONSTANTS.FINAL_SEQUENCE_SPINS) {
          const nearNumbers = [finalNumber - 1, finalNumber + 1, finalNumber - 2].filter(n => 
            n >= 1 && availableNumbers.includes(n)
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
      }, ADMIN_CONSTANTS.FINAL_SEQUENCE_DELAY);
    }
  }, ADMIN_CONSTANTS.PRIZE_ANIMATION_DURATION / ADMIN_CONSTANTS.MAX_ANIMATION_SPINS);
};