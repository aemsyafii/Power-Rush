import React, { useState, useMemo, useCallback } from 'react';
import { PowerRushGame } from './components/PowerRushGame';
import { AdminDashboard } from './components/AdminDashboard';
import { AudioProvider } from './components/AudioProvider';
import { Button } from './components/ui/button';
import { Settings, Gamepad2 } from 'lucide-react';
import { GameLog, GameRules, GameSettings, UsedPrizeNumber } from './components/admin/types';

// Simple device fingerprinting utility
const generateDeviceId = (): string => {
  // Combine various browser properties to create a unique device identifier
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx?.fillText('Device fingerprint', 10, 10);
  const canvasFingerprint = canvas.toDataURL();
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    canvasFingerprint.slice(-50), // Last 50 chars of canvas fingerprint
    navigator.hardwareConcurrency || 'unknown',
    navigator.deviceMemory || 'unknown'
  ].join('|');
  
  // Create a simple hash
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Convert to positive hex string
  return Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
};

export default function App() {
  const [currentView, setCurrentView] = useState<'game' | 'admin'>('game');
  const [currentDeviceId] = useState<string>(() => generateDeviceId());
  
  // Separate applied settings (used by game) from draft settings (used by admin)
  const [gameSettings, setGameSettings] = useState<GameSettings>({
    duration: 25, // 25 seconds default (optimal for new system)
    operatingHours: { start: '09:00', end: '21:00' }, // 9 AM to 9 PM
    operatingHoursEnabled: true,
    totalPrizes: 100,
    currentPrizes: 75,
    difficultyMultiplier: 50, // 50% difficulty (medium)
    autoDifficultyEnabled: true, // Enable auto difficulty by default
    autoDifficultyMaxLimit: 80, // Max 80% auto difficulty by default
    prizeNumbersEnabled: true, // Enable prize numbers by default
    usedPrizeNumbers: [], // Keep for backward compatibility
    usedPrizeHistory: [], // New system with timestamps
    uniqueNames: ['kelinci', 'buaya', 'harimau', 'singa', 'elang'], // Default unique names
    gameLogs: [], // Initialize empty game logs
    gameRules: { // Default game rules
      maxPlaysPerDevice: 10, // Max 10 total plays per device
      maxWinsPerDevice: 3,   // Max 3 wins per device
      whitelistedDevices: [] // No whitelisted devices by default
    }
  });

  const toggleView = useCallback(() => {
    setCurrentView(currentView === 'game' ? 'admin' : 'game');
  }, [currentView]);

  const handleSettingsChange = useCallback((newSettings: GameSettings) => {
    // Only apply settings when explicitly saved
    setGameSettings(newSettings);
    // In a real app, this would save to backend/database
    localStorage.setItem('powerRushGameSettings', JSON.stringify(newSettings));
  }, []);

  // Helper function to get current used prize numbers (for backward compatibility)
  const getCurrentUsedPrizeNumbers = useCallback((settings: GameSettings): number[] => {
    // Use new system if available, otherwise fallback to old system
    if (settings.usedPrizeHistory && settings.usedPrizeHistory.length > 0) {
      return settings.usedPrizeHistory.map(item => item.number);
    }
    return settings.usedPrizeNumbers || [];
  }, []);

  // Check if device can play based on rules - memoized to prevent re-creation
  const canDevicePlay = useCallback((deviceId: string): { canPlay: boolean; reason?: string } => {
    const { gameRules, gameLogs } = gameSettings;
    
    // Check if device is whitelisted (exempt from all limits)
    if (gameRules.whitelistedDevices.includes(deviceId)) {
      return { canPlay: true };
    }
    
    // Get device's play history
    const deviceLogs = gameLogs.filter(log => log.deviceId === deviceId);
    const totalPlays = deviceLogs.length;
    const totalWins = deviceLogs.filter(log => log.result === 'win').length;
    
    // Check max plays limit
    if (totalPlays >= gameRules.maxPlaysPerDevice) {
      return { 
        canPlay: false, 
        reason: `Device sudah mencapai batas maksimal ${gameRules.maxPlaysPerDevice} kali bermain` 
      };
    }
    
    // Check max wins limit
    if (totalWins >= gameRules.maxWinsPerDevice) {
      return { 
        canPlay: false, 
        reason: `Device sudah mencapai batas maksimal ${gameRules.maxWinsPerDevice} kali menang` 
      };
    }
    
    return { canPlay: true };
  }, [gameSettings]);

  // Record game result - memoized to prevent re-creation
  const recordGameResult = useCallback((
    playerName: string, 
    result: 'win' | 'loss', 
    batteryLevel: number, 
    gameDuration: number,
    prizeNumber?: number
  ) => {
    const newLog: GameLog = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      playerName,
      deviceId: currentDeviceId,
      result,
      prizeNumber,
      timestamp: new Date().toISOString(),
      batteryLevel,
      gameDuration
    };

    // Use callback to ensure we're working with the latest state
    setGameSettings(currentSettings => {
      const updatedSettings = {
        ...currentSettings,
        gameLogs: [newLog, ...currentSettings.gameLogs] // Add to beginning for newest first
      };
      
      localStorage.setItem('powerRushGameSettings', JSON.stringify(updatedSettings));
      return updatedSettings;
    });
  }, [currentDeviceId]);

  const handlePrizeWon = useCallback((playerName: string, batteryLevel: number, gameDuration: number): number | null => {
    // If prize numbers are disabled, just record win without prize
    if (gameSettings.prizeNumbersEnabled === false) {
      recordGameResult(playerName, 'win', batteryLevel, gameDuration);
      return null;
    }
    
    // Check if there are prizes available
    if (gameSettings.currentPrizes <= 0) {
      // No prizes left, record win without prize
      recordGameResult(playerName, 'win', batteryLevel, gameDuration);
      return null;
    }
    
    // Get available prize numbers using new system
    const usedNumbers = getCurrentUsedPrizeNumbers(gameSettings);
    const availableNumbers = Array.from({ length: gameSettings.totalPrizes }, (_, i) => i + 1)
      .filter(num => !usedNumbers.includes(num));
    
    if (availableNumbers.length === 0) {
      // No available numbers but currentPrizes > 0 (data inconsistency)
      // Fix by setting currentPrizes to 0
      const updatedSettings = {
        ...gameSettings,
        currentPrizes: 0
      };
      setGameSettings(updatedSettings);
      localStorage.setItem('powerRushGameSettings', JSON.stringify(updatedSettings));
      
      // Record win without prize number
      recordGameResult(playerName, 'win', batteryLevel, gameDuration);
      return null;
    }
    
    // Select random available number
    const randomIndex = Math.floor(Math.random() * availableNumbers.length);
    const selectedNumber = availableNumbers[randomIndex];
    
    // Create new prize history entry
    const newPrizeEntry: UsedPrizeNumber = {
      number: selectedNumber,
      timestamp: new Date().toISOString(),
      playerName: playerName,
      gameLogId: Date.now().toString() + Math.random().toString(36).substr(2, 9)
    };
    
    // Update settings: reduce prize count AND add to history
    const updatedSettings = {
      ...gameSettings,
      currentPrizes: Math.max(0, gameSettings.currentPrizes - 1), // Ensure it doesn't go negative
      usedPrizeNumbers: [...usedNumbers, selectedNumber].sort((a, b) => a - b), // Keep old system for compatibility
      usedPrizeHistory: [newPrizeEntry, ...gameSettings.usedPrizeHistory] // New first for chronological order
    };
    
    // Update state and localStorage immediately
    setGameSettings(updatedSettings);
    localStorage.setItem('powerRushGameSettings', JSON.stringify(updatedSettings));
    
    // Record win with prize number - this will be recorded in the updated settings
    recordGameResult(playerName, 'win', batteryLevel, gameDuration, selectedNumber);
    return selectedNumber;
  }, [gameSettings, getCurrentUsedPrizeNumbers, recordGameResult]);

  const handleGameLoss = useCallback((playerName: string, batteryLevel: number, gameDuration: number) => {
    // Record loss
    recordGameResult(playerName, 'loss', batteryLevel, gameDuration);
  }, [recordGameResult]);

  // Generate unique name for this game session - memoized
  const generateUniqueName = useCallback(() => {
    if (gameSettings.uniqueNames.length === 0) {
      return 'Player-' + Math.floor(Math.random() * 999 + 1).toString().padStart(3, '0');
    }
    
    const randomName = gameSettings.uniqueNames[Math.floor(Math.random() * gameSettings.uniqueNames.length)];
    const randomNumber = Math.floor(Math.random() * 999 + 1);
    
    // Capitalize first letter
    const capitalizedName = randomName.charAt(0).toUpperCase() + randomName.slice(1);
    
    return `${capitalizedName}-${randomNumber}`;
  }, [gameSettings.uniqueNames]);

  // Get device play statistics - memoized to prevent recalculation on every render
  const deviceStats = useMemo(() => {
    const deviceLogs = gameSettings.gameLogs.filter(log => log.deviceId === currentDeviceId);
    const totalPlays = deviceLogs.length;
    const totalWins = deviceLogs.filter(log => log.result === 'win').length;
    const totalLosses = deviceLogs.filter(log => log.result === 'loss').length;
    
    return {
      totalPlays,
      totalWins,
      totalLosses,
      isWhitelisted: gameSettings.gameRules.whitelistedDevices.includes(currentDeviceId),
      recentGames: deviceLogs.slice(0, 5) // Last 5 games
    };
  }, [gameSettings.gameLogs, gameSettings.gameRules.whitelistedDevices, currentDeviceId]);

  // Load settings from localStorage on mount
  React.useEffect(() => {
    const savedSettings = localStorage.getItem('powerRushGameSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        
        // Migration for old format
        if (parsed.operatingHours && typeof parsed.operatingHours.start === 'number') {
          parsed.operatingHours = {
            start: `${parsed.operatingHours.start.toString().padStart(2, '0')}:00`,
            end: `${parsed.operatingHours.end.toString().padStart(2, '0')}:00`
          };
        }
        
        // Migration from old difficulty system (1-10) to new system (0-100%)
        if (parsed.difficultyMultiplier && parsed.difficultyMultiplier <= 10) {
          // Convert old 1-10 scale to 0-100% scale
          // Old: 1 = easy, 10 = hard
          // New: 0% = easy, 100% = hard
          parsed.difficultyMultiplier = ((parsed.difficultyMultiplier - 1) / 9) * 100;
        }
        
        // Migration: Convert old usedPrizeNumbers to new usedPrizeHistory format
        if (parsed.usedPrizeNumbers && parsed.usedPrizeNumbers.length > 0 && (!parsed.usedPrizeHistory || parsed.usedPrizeHistory.length === 0)) {
          parsed.usedPrizeHistory = parsed.usedPrizeNumbers.map((number: number, index: number) => ({
            number,
            timestamp: new Date(Date.now() - (parsed.usedPrizeNumbers.length - index) * 60000).toISOString(), // Spread over minutes
            playerName: 'Legacy',
            gameLogId: `legacy-${number}`
          }));
        }
        
        // Add missing properties with defaults
        const defaults = {
          duration: 25,
          operatingHours: { start: '09:00', end: '21:00' },
          operatingHoursEnabled: true,
          totalPrizes: 100,
          currentPrizes: 75,
          difficultyMultiplier: 50,
          autoDifficultyEnabled: true,
          autoDifficultyMaxLimit: 80,
          prizeNumbersEnabled: true,
          usedPrizeNumbers: [],
          usedPrizeHistory: [],
          uniqueNames: ['kelinci', 'buaya', 'harimau', 'singa', 'elang'],
          gameLogs: [],
          gameRules: {
            maxPlaysPerDevice: 10,
            maxWinsPerDevice: 3,
            whitelistedDevices: []
          }
        };

        const migratedSettings = { ...defaults, ...parsed };
        
        setGameSettings(migratedSettings);
      } catch (error) {
        console.error('Failed to load saved settings:', error);
      }
    }
  }, []); // Remove gameSettings dependency to prevent infinite loop

  return (
    <AudioProvider>
      <div className="min-h-screen relative">
        {currentView === 'game' ? (
          <PowerRushGame 
            settings={gameSettings} 
            currentDeviceId={currentDeviceId}
            deviceStats={deviceStats}
            onPrizeWon={handlePrizeWon}
            onGameLoss={handleGameLoss}
            canDevicePlay={canDevicePlay}
            generateUniqueName={generateUniqueName}
          />
        ) : (
          <AdminDashboard 
            settings={gameSettings} 
            currentDeviceId={currentDeviceId}
            onSettingsChange={handleSettingsChange}
            onToggleView={toggleView}
          />
        )}
        
        {/* Floating Dev Navigation - Flat Blue Design */}
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={toggleView}
            size="lg"
            className="w-16 h-16 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 border-2 border-white transform hover:scale-105 transition-all duration-200"
            title={currentView === 'game' ? 'Admin Dashboard' : 'Back to Game'}
          >
            {currentView === 'game' ? (
              <Settings className="w-8 h-8 text-white" />
            ) : (
              <Gamepad2 className="w-8 h-8 text-white" />
            )}
          </Button>
        </div>

        {/* Beta Version Badge - Flat Design */}
        <div className="fixed top-4 right-4 z-40">
          <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-mono border border-blue-500">
            BETA VERSION | v1.1
          </div>
        </div>
      </div>
    </AudioProvider>
  );
}