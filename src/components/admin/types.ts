export interface GameLog {
  id: string;
  playerName: string;
  deviceId: string;
  result: 'win' | 'loss';
  prizeNumber?: number;
  timestamp: string;
  batteryLevel: number;
  gameDuration: number;
}

export interface GameRules {
  maxPlaysPerDevice: number; // Total plays (wins + losses) per device
  maxWinsPerDevice: number; // Maximum wins per device
  whitelistedDevices: string[]; // Device IDs that are exempt from limits
}

// New interface for prize number with timestamp
export interface UsedPrizeNumber {
  number: number;
  timestamp: string;
  playerName?: string;
  gameLogId?: string;
}

export interface GameSettings {
  duration: number;
  operatingHours: { start: string; end: string };
  operatingHoursEnabled: boolean;
  totalPrizes: number;
  currentPrizes: number;
  difficultyMultiplier: number; // 0-100 percentage
  autoDifficultyEnabled: boolean; // Auto adjust difficulty based on operating hours and remaining prizes
  autoDifficultyMaxLimit: number; // Maximum difficulty limit for auto difficulty (0-100 percentage)
  prizeNumbersEnabled: boolean; // Toggle to enable/disable prize number feature
  usedPrizeNumbers: number[]; // Keep for backward compatibility
  usedPrizeHistory: UsedPrizeNumber[]; // New: prize numbers with timestamps
  uniqueNames: string[]; // Array of unique names
  gameLogs: GameLog[]; // Player game history
  gameRules: GameRules; // Admin rules for device limits
}

export interface DeviceStats {
  totalPlays: number;
  totalWins: number;
  totalLosses: number;
  isWhitelisted: boolean;
  recentGames: GameLog[];
}

export interface AnalyticsData {
  totalPlayers: number;
  totalGames: number;
  totalWins: number;
  totalLosses: number;
  winRate: number;
  uniqueDevices: number;
  todayGames: number;
  todayWins: number;
  prizeDistribution: number[];
  hourlyActivity: { hour: number; games: number; wins: number }[];
  topDevices: { deviceId: string; plays: number; wins: number }[];
}

export type LogFilter = 'all' | 'wins' | 'losses';
export type TimeFilter = 'all' | 'today' | 'week' | 'month';