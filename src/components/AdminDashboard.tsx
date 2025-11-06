import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { Separator } from './ui/separator';
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
  ToggleLeft,
  ToggleRight,
  Sliders,
  Volume2
} from 'lucide-react';
import { GameSettings, UsedPrizeNumber } from './admin/types';
import { AnalyticsTab } from './admin/AnalyticsTab';
import { AudioTab } from './admin/AudioTab';
import { SimulationStartOverlay, SimulationResultOverlay } from './game/SimulationOverlays';
import { animatePrizeNumberSpinning, getCurrentUsedPrizeNumbers, getCurrentEffectiveDifficulty } from './game/utils';

interface AdminDashboardProps {
  settings: GameSettings;
  currentDeviceId: string;
  onSettingsChange: (settings: GameSettings) => void;
  onToggleView: () => void;
}

export function AdminDashboard({ settings, currentDeviceId, onSettingsChange, onToggleView }: AdminDashboardProps) {
  // Separate draft settings from applied settings
  const [localSettings, setLocalSettings] = useState<GameSettings>(settings);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [newPrizeNumber, setNewPrizeNumber] = useState('');
  
  // Password management states
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Win simulation states
  const [showSimulationStart, setShowSimulationStart] = useState(false);
  const [showSimulationResult, setShowSimulationResult] = useState(false);
  const [simulationPrizeNumber, setSimulationPrizeNumber] = useState<number | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [displayNumber, setDisplayNumber] = useState<number>(0);
  const [simulationButtonsCountdown, setSimulationButtonsCountdown] = useState(7);
  const [canUseSimulationButtons, setCanUseSimulationButtons] = useState(false);
  
  // Unique names management
  const [newUniqueName, setNewUniqueName] = useState('');
  
  // Prize editing states
  const [editingPrizeNumber, setEditingPrizeNumber] = useState<number | null>(null);
  const [editPrizeValue, setEditPrizeValue] = useState('');
  
  // Device management states
  const [newWhitelistDevice, setNewWhitelistDevice] = useState('');
  const [deviceIdCopied, setDeviceIdCopied] = useState(false);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFullscreenSupported, setIsFullscreenSupported] = useState(false);

  // Get current effective difficulty info
  const effectiveDifficulty = getCurrentEffectiveDifficulty(localSettings);
  
  // Mock statistics
  const [stats] = useState({
    totalPlayers: settings.gameLogs.length > 0 ? new Set(settings.gameLogs.map(log => log.deviceId)).size : 0,
    winnersToday: settings.gameLogs.filter(log => log.result === 'win').length,
    currentHourPlayers: 12,
    winRateToday: settings.gameLogs.length > 0 
      ? Math.round((settings.gameLogs.filter(log => log.result === 'win').length / settings.gameLogs.length) * 100) 
      : 0,
    peakHour: 14,
    averagePlaytime: settings.gameLogs.length > 0 
      ? `${Math.round(settings.gameLogs.reduce((sum, log) => sum + log.gameDuration, 0) / settings.gameLogs.length)}s`
      : '0s'
  });

  // Function to check if settings have changed
  const checkForChanges = React.useCallback((newSettings: GameSettings) => {
    const hasChanges = JSON.stringify(newSettings) !== JSON.stringify(settings);
    setHasUnsavedChanges(hasChanges);
  }, [settings]);
  
  // Update local settings and check for changes
  const updateLocalSettings = (newSettings: GameSettings) => {
    setLocalSettings(newSettings);
    checkForChanges(newSettings);
  };
  
  // Sync applied settings to local settings when props change (but don't mark as changed)
  React.useEffect(() => {
    setLocalSettings(settings);
    setHasUnsavedChanges(false);
  }, [settings]);

  // Simulation buttons countdown timer
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (showSimulationResult && simulationButtonsCountdown > 0) {
      interval = setInterval(() => {
        setSimulationButtonsCountdown(prev => {
          if (prev <= 1) {
            setCanUseSimulationButtons(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [showSimulationResult, simulationButtonsCountdown]);

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
  const toggleFullscreen = async () => {
    if (!isFullscreenSupported) {
      // Silently fail if not supported
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
      // Silently handle fullscreen errors to prevent permission policy errors from showing
      // This prevents "Disallowed by permissions policy" from appearing to users
      // F11 will still work as a manual alternative
    }
  };

  // Listen for F11 key to toggle fullscreen
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'F11' && isFullscreenSupported) {
        event.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [toggleFullscreen, isFullscreenSupported]);

  // Get admin password from localStorage or use default
  const getAdminPassword = () => {
    return localStorage.getItem('batteryGameAdminPassword') || 'admin123';
  };

  const handlePasswordSubmit = () => {
    if (password === getAdminPassword()) {
      setIsAuthenticated(true);
    } else {
      alert('Password salah!');
    }
  };

  const handleChangePassword = () => {
    if (currentPassword !== getAdminPassword()) {
      alert('Password lama salah!');
      return;
    }
    
    if (newPassword.length < 4) {
      alert('Password baru harus minimal 4 karakter!');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      alert('Konfirmasi password tidak cocok!');
      return;
    }
    
    // Save new password to localStorage
    localStorage.setItem('batteryGameAdminPassword', newPassword);
    alert('Password berhasil diubah!');
    
    // Reset form
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowChangePassword(false);
  };

  const handleSaveSettings = () => {
    onSettingsChange(localSettings);
    setHasUnsavedChanges(false);
    alert('Pengaturan berhasil disimpan dan diterapkan ke game!');
  };

  const handleDiscardChanges = () => {
    if (confirm('Apakah Anda yakin ingin membuang semua perubahan yang belum disimpan?')) {
      setLocalSettings(settings);
      setHasUnsavedChanges(false);
    }
  };

  // Handle admin win simulation - show start overlay first
  const handleAdminWin = () => {
    // Check if prize numbers are enabled
    if (localSettings.prizeNumbersEnabled === false) {
      alert('Fitur nomor hadiah sedang dinonaktifkan. Aktifkan terlebih dahulu untuk simulasi.');
      return;
    }

    // Check if there are prizes available
    if (localSettings.currentPrizes <= 0) {
      alert('Tidak ada hadiah tersisa untuk disimulasikan!');
      return;
    }

    // Check if there are available numbers
    const usedNumbers = getCurrentUsedPrizeNumbers(localSettings);
    const availableNumbers = Array.from({ length: localSettings.totalPrizes }, (_, i) => i + 1)
      .filter(num => !usedNumbers.includes(num));
    
    if (availableNumbers.length === 0) {
      alert('Tidak ada nomor hadiah tersedia untuk disimulasikan!');
      return;
    }

    // Show start overlay first
    setShowSimulationStart(true);
  };

  // Start the actual simulation
  const startSimulation = () => {
    const usedNumbers = getCurrentUsedPrizeNumbers(localSettings);
    const availableNumbers = Array.from({ length: localSettings.totalPrizes }, (_, i) => i + 1)
      .filter(num => !usedNumbers.includes(num));
    
    // Select random available number
    const randomIndex = Math.floor(Math.random() * availableNumbers.length);
    const selectedNumber = availableNumbers[randomIndex];
    
    // Create new prize history entry
    const newPrizeEntry: UsedPrizeNumber = {
      number: selectedNumber,
      timestamp: new Date().toISOString(),
      playerName: 'Admin (Simulasi)',
      gameLogId: `admin-sim-${Date.now()}`
    };
    
    // Update settings (reduce prize count and add used number)
    const updatedSettings = {
      ...localSettings,
      currentPrizes: localSettings.currentPrizes - 1,
      usedPrizeNumbers: [...usedNumbers, selectedNumber].sort((a, b) => a - b),
      usedPrizeHistory: [newPrizeEntry, ...localSettings.usedPrizeHistory]
    };
    
    // Update local settings and mark as changed
    updateLocalSettings(updatedSettings);
    
    // Set simulation data
    setSimulationPrizeNumber(selectedNumber);
    setIsSpinning(false);
    setDisplayNumber(0);
    setSimulationButtonsCountdown(7);
    setCanUseSimulationButtons(false);
    
    // Hide start overlay and show result
    setShowSimulationStart(false);
    setShowSimulationResult(true);
    
    // Start prize number animation
    animatePrizeNumberSpinning(
      selectedNumber,
      localSettings.totalPrizes,
      usedNumbers,
      setDisplayNumber,
      setIsSpinning
    );
  };

  // Handle simulation random again
  const handleSimulationRandomAgain = () => {
    // Check if there are still prizes available
    const usedNumbers = getCurrentUsedPrizeNumbers(localSettings);
    const availableNumbers = Array.from({ length: localSettings.totalPrizes }, (_, i) => i + 1)
      .filter(num => !usedNumbers.includes(num));
    
    if (availableNumbers.length === 0) {
      alert('Tidak ada nomor hadiah tersedia lagi!');
      return;
    }

    // Select new random number
    const randomIndex = Math.floor(Math.random() * availableNumbers.length);
    const selectedNumber = availableNumbers[randomIndex];
    
    // Create new prize history entry
    const newPrizeEntry: UsedPrizeNumber = {
      number: selectedNumber,
      timestamp: new Date().toISOString(),
      playerName: 'Admin (Simulasi)',
      gameLogId: `admin-sim-${Date.now()}`
    };
    
    // Update settings again
    const updatedSettings = {
      ...localSettings,
      currentPrizes: Math.max(0, localSettings.currentPrizes - 1),
      usedPrizeNumbers: [...usedNumbers, selectedNumber].sort((a, b) => a - b),
      usedPrizeHistory: [newPrizeEntry, ...localSettings.usedPrizeHistory]
    };
    
    updateLocalSettings(updatedSettings);
    
    // Reset states and start new simulation
    setSimulationPrizeNumber(selectedNumber);
    setIsSpinning(false);
    setDisplayNumber(0);
    setSimulationButtonsCountdown(7);
    setCanUseSimulationButtons(false);
    
    // Start new animation
    animatePrizeNumberSpinning(
      selectedNumber,
      localSettings.totalPrizes,
      getCurrentUsedPrizeNumbers(updatedSettings),
      setDisplayNumber,
      setIsSpinning
    );
  };

  // Handle simulation exit
  const handleSimulationExit = () => {
    setShowSimulationResult(false);
    setSimulationPrizeNumber(null);
    setIsSpinning(false);
    setDisplayNumber(0);
  };

  // Add unique name
  const handleAddUniqueName = () => {
    const trimmedName = newUniqueName.trim().toLowerCase();
    if (trimmedName && !localSettings.uniqueNames.includes(trimmedName)) {
      updateLocalSettings({
        ...localSettings,
        uniqueNames: [...localSettings.uniqueNames, trimmedName]
      });
      setNewUniqueName('');
    } else {
      alert('Nama sudah ada atau kosong!');
    }
  };

  // Remove unique name
  const handleRemoveUniqueName = (nameToRemove: string) => {
    updateLocalSettings({
      ...localSettings,
      uniqueNames: localSettings.uniqueNames.filter(name => name !== nameToRemove)
    });
  };

  // Prize number editing functions - now works with new system
  const handleEditPrizeNumber = (prizeEntry: UsedPrizeNumber) => {
    setEditingPrizeNumber(prizeEntry.number);
    setEditPrizeValue(prizeEntry.number.toString());
  };

  const handleSavePrizeNumber = () => {
    const newNumber = parseInt(editPrizeValue);
    
    // Validation
    if (isNaN(newNumber) || newNumber < 1 || newNumber > localSettings.totalPrizes) {
      alert(`Nomor harus antara 1 sampai ${localSettings.totalPrizes}!`);
      return;
    }
    
    const usedNumbers = getCurrentUsedPrizeNumbers(localSettings);
    if (newNumber !== editingPrizeNumber && usedNumbers.includes(newNumber)) {
      alert('Nomor sudah digunakan!');
      return;
    }

    // Update prize history
    const updatedHistory = localSettings.usedPrizeHistory.map(entry =>
      entry.number === editingPrizeNumber 
        ? { ...entry, number: newNumber }
        : entry
    );

    // Update backward compatibility array
    const updatedUsedNumbers = usedNumbers.map(num => 
      num === editingPrizeNumber ? newNumber : num
    ).sort((a, b) => a - b);

    updateLocalSettings({
      ...localSettings,
      usedPrizeNumbers: updatedUsedNumbers,
      usedPrizeHistory: updatedHistory
    });

    setEditingPrizeNumber(null);
    setEditPrizeValue('');
  };

  const handleCancelEdit = () => {
    setEditingPrizeNumber(null);
    setEditPrizeValue('');
  };

  // Add new prize number manually
  const handleAddPrizeNumber = () => {
    const number = parseInt(newPrizeNumber);
    
    if (isNaN(number) || number < 1 || number > localSettings.totalPrizes) {
      alert(`Nomor harus antara 1 sampai ${localSettings.totalPrizes}!`);
      return;
    }
    
    const usedNumbers = getCurrentUsedPrizeNumbers(localSettings);
    if (usedNumbers.includes(number)) {
      alert('Nomor sudah digunakan!');
      return;
    }

    // Create new prize history entry
    const newPrizeEntry: UsedPrizeNumber = {
      number,
      timestamp: new Date().toISOString(),
      playerName: 'Admin (Manual)',
      gameLogId: `admin-manual-${Date.now()}`
    };

    updateLocalSettings({
      ...localSettings,
      usedPrizeNumbers: [...usedNumbers, number].sort((a, b) => a - b),
      usedPrizeHistory: [newPrizeEntry, ...localSettings.usedPrizeHistory]
    });
    
    setNewPrizeNumber('');
  };

  // Remove prize number
  const handleRemovePrizeNumber = (prizeEntry: UsedPrizeNumber) => {
    if (confirm(`Hapus nomor ${prizeEntry.number} dari daftar terpakai?`)) {
      const updatedHistory = localSettings.usedPrizeHistory.filter(entry => 
        !(entry.number === prizeEntry.number && entry.timestamp === prizeEntry.timestamp)
      );
      
      const updatedUsedNumbers = updatedHistory.map(entry => entry.number).sort((a, b) => a - b);

      updateLocalSettings({
        ...localSettings,
        usedPrizeNumbers: updatedUsedNumbers,
        usedPrizeHistory: updatedHistory,
        currentPrizes: Math.min(localSettings.totalPrizes, localSettings.currentPrizes + 1) // Add back one prize
      });
    }
  };

  // Device management functions
  const handleAddWhitelistDevice = () => {
    const trimmedDeviceId = newWhitelistDevice.trim().toUpperCase();
    if (trimmedDeviceId && !localSettings.gameRules.whitelistedDevices.includes(trimmedDeviceId)) {
      updateLocalSettings({
        ...localSettings,
        gameRules: {
          ...localSettings.gameRules,
          whitelistedDevices: [...localSettings.gameRules.whitelistedDevices, trimmedDeviceId]
        }
      });
      setNewWhitelistDevice('');
    } else {
      alert('Device ID sudah ada dalam whitelist atau kosong!');
    }
  };

  const handleRemoveWhitelistDevice = (deviceId: string) => {
    updateLocalSettings({
      ...localSettings,
      gameRules: {
        ...localSettings.gameRules,
        whitelistedDevices: localSettings.gameRules.whitelistedDevices.filter(id => id !== deviceId)
      }
    });
  };

  const handleAddCurrentDeviceToWhitelist = () => {
    if (!localSettings.gameRules.whitelistedDevices.includes(currentDeviceId)) {
      updateLocalSettings({
        ...localSettings,
        gameRules: {
          ...localSettings.gameRules,
          whitelistedDevices: [...localSettings.gameRules.whitelistedDevices, currentDeviceId]
        }
      });
    }
  };

  const handleCopyDeviceId = async () => {
    try {
      await navigator.clipboard.writeText(currentDeviceId);
      setDeviceIdCopied(true);
      setTimeout(() => setDeviceIdCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = currentDeviceId;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setDeviceIdCopied(true);
      setTimeout(() => setDeviceIdCopied(false), 2000);
    }
  };

  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const isOperatingHours = () => {
    if (!localSettings.operatingHoursEnabled) return true;
    
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const [startHour, startMin] = localSettings.operatingHours.start.split(':').map(Number);
    const [endHour, endMin] = localSettings.operatingHours.end.split(':').map(Number);
    
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Login screen - Flat Design
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
        {/* Simple background patterns */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-100 rounded-full opacity-50"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-100 rounded-full opacity-40"></div>
        </div>
        
        <Card className="w-full max-w-md bg-white border-2 border-blue-200 shadow-xl relative z-10">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-600 rounded-full flex items-center justify-center">
              <Settings className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-gray-900 mb-2">Admin Dashboard</CardTitle>
            <p className="text-gray-600">
              Masukkan password untuk mengakses dashboard
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="password" className="text-gray-800">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                  placeholder="Masukkan password admin"
                  className="bg-white border-2 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1 text-gray-500 hover:text-blue-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <Button 
              onClick={handlePasswordSubmit} 
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              Masuk
            </Button>
            <div className="text-center">
              <Button variant="link" onClick={onToggleView} className="text-blue-600 hover:text-blue-800">
                Kembali ke Game
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Background elements - flat design */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-100 rounded-full opacity-30"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-100 rounded-full opacity-20"></div>
      </div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header - Flat Design with unsaved changes indicator */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-blue-600">
              Admin Dashboard
            </h1>
            <p className="text-gray-700 text-lg">Kelola pengaturan game Power Rush</p>
            {hasUnsavedChanges && (
              <div className="flex items-center gap-2 mt-2 text-orange-600">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">Ada perubahan yang belum disimpan</span>
              </div>
            )}
            {/* Show current effective difficulty */}
            {effectiveDifficulty.isAuto && (
              <div className="flex items-center gap-2 mt-1 text-blue-600">
                <Activity className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Kesulitan Aktif: {effectiveDifficulty.difficulty}% ({effectiveDifficulty.info})
                </span>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            {hasUnsavedChanges && (
              <Badge variant="destructive" className="px-4 py-2 text-sm font-medium">
                <AlertCircle className="w-4 h-4 mr-2" />
                Belum Disimpan
              </Badge>
            )}
            <Badge 
              variant={isOperatingHours() ? "default" : "destructive"}
              className={`px-4 py-2 text-sm font-medium ${
                isOperatingHours() 
                  ? 'bg-green-600 text-white' 
                  : 'bg-red-500 text-white'
              }`}
            >
              <Clock className="w-4 h-4 mr-2" />
              {getCurrentTime()}
            </Badge>
          </div>
        </div>

        {/* Unsaved changes warning */}
        {hasUnsavedChanges && (
          <Card className="mb-6 bg-orange-50 border-2 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="text-orange-800 font-semibold">Perubahan Belum Disimpan</p>
                    <p className="text-orange-700 text-sm">Simpan perubahan untuk menerapkannya ke game</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleDiscardChanges}
                    className="border-orange-300 text-orange-600 hover:bg-orange-100"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Buang
                  </Button>
                  <Button 
                    size="sm"
                    onClick={handleSaveSettings}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Simpan
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Floating Fullscreen Button - Only show if supported */}
        {isFullscreenSupported && (
          <Button
            onClick={toggleFullscreen}
            size="sm"
            className="fixed top-4 right-4 z-50 h-10 w-10 p-0 bg-white/80 hover:bg-white border-2 border-blue-200 text-blue-600 hover:text-blue-700 shadow-lg backdrop-blur-sm"
            title={isFullscreen ? 'Keluar Fullscreen (F11)' : 'Masuk Fullscreen (F11)'}
          >
            {isFullscreen ? (
              <Minimize className="w-4 h-4" />
            ) : (
              <Maximize className="w-4 h-4" />
            )}
          </Button>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white border-2 border-blue-200 hover:border-blue-300 transition-colors">
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-gray-900">{stats.totalPlayers}</div>
              <div className="text-sm text-gray-600">Total Pemain</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-2 border-green-200 hover:border-green-300 transition-colors">
            <CardContent className="p-4 text-center">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold text-gray-900">{stats.winnersToday}</div>
              <div className="text-sm text-gray-600">Pemenang</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-2 border-orange-200 hover:border-orange-300 transition-colors">
            <CardContent className="p-4 text-center">
              <Gift className="w-8 h-8 mx-auto mb-2 text-orange-600" />
              <div className="text-2xl font-bold text-gray-900">{localSettings.currentPrizes}</div>
              <div className="text-sm text-gray-600">Hadiah Tersisa</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-2 border-purple-200 hover:border-purple-300 transition-colors">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold text-gray-900">{stats.winRateToday}%</div>
              <div className="text-sm text-gray-600">Win Rate</div>
            </CardContent>
          </Card>
        </div>

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
                  <ToggleLeft className="w-5 h-5" />
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

            {/* Prize Management Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Admin Win Simulation */}
              <Card className="bg-white border-2 border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <Play className="w-5 h-5" />
                    Simulasi Kemenangan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Simulasikan kemenangan untuk testing atau demo. Akan mengurangi hadiah tersisa.
                  </p>
                  <Button 
                    onClick={handleAdminWin}
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={localSettings.currentPrizes <= 0 || localSettings.prizeNumbersEnabled === false}
                  >
                    <Trophy className="w-4 h-4 mr-2" />
                    Simulasi Menang
                  </Button>
                  {localSettings.prizeNumbersEnabled === false && (
                    <p className="text-xs text-red-600 mt-2">
                      Fitur nomor hadiah harus diaktifkan untuk simulasi
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Reset/Manage Prizes */}
              <Card className="bg-white border-2 border-orange-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-600">
                    <RotateCcw className="w-5 h-5" />
                    Reset Hadiah
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Reset semua hadiah yang sudah terpakai. Gunakan dengan hati-hati.
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      if (confirm('Apakah Anda yakin ingin reset semua nomor hadiah? Tindakan ini tidak dapat dibatalkan!')) {
                        updateLocalSettings({
                          ...localSettings,
                          currentPrizes: localSettings.totalPrizes,
                          usedPrizeNumbers: [],
                          usedPrizeHistory: []
                        });
                      }
                    }}
                    className="w-full border-orange-300 text-orange-600 hover:bg-orange-50"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset Semua Hadiah
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Used Prize Numbers List */}
            <Card className="bg-white border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <Hash className="w-5 h-5" />
                  Nomor Hadiah Terpakai ({localSettings.usedPrizeHistory.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {localSettings.usedPrizeHistory.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Hash className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Belum ada nomor hadiah yang terpakai</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {localSettings.usedPrizeHistory.map((prizeEntry, index) => (
                      <div key={`${prizeEntry.number}-${prizeEntry.timestamp}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="font-bold text-blue-600">{prizeEntry.number}</span>
                          </div>
                          <div>
                            <p className="font-medium">{prizeEntry.playerName || 'Unknown'}</p>
                            <p className="text-xs text-gray-500">{formatDate(prizeEntry.timestamp)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {editingPrizeNumber === prizeEntry.number ? (
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                value={editPrizeValue}
                                onChange={(e) => setEditPrizeValue(e.target.value)}
                                className="w-20 h-8"
                                min="1"
                                max={localSettings.totalPrizes}
                              />
                              <Button size="sm" onClick={handleSavePrizeNumber} className="h-8">
                                <Check className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={handleCancelEdit} className="h-8">
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditPrizeNumber(prizeEntry)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit3 className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRemovePrizeNumber(prizeEntry)}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Manual Add Prize Number */}
                <Separator className="my-4" />
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Tambah nomor hadiah manual"
                    value={newPrizeNumber}
                    onChange={(e) => setNewPrizeNumber(e.target.value)}
                    min="1"
                    max={localSettings.totalPrizes}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleAddPrizeNumber}
                    disabled={!newPrizeNumber}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Players Tab */}
          <TabsContent value="players" className="space-y-6">
            {/* Device Management */}
            <Card className="bg-white border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <Shield className="w-5 h-5" />
                  Manajemen Device
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Current Device Info */}
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-medium mb-2">Device Saat Ini</h3>
                    <div className="flex items-center justify-between">
                      <code className="text-sm bg-white px-2 py-1 rounded">{currentDeviceId}</code>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCopyDeviceId}
                          className="text-xs"
                        >
                          {deviceIdCopied ? <CheckCheck className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </Button>
                        {!localSettings.gameRules.whitelistedDevices.includes(currentDeviceId) && (
                          <Button
                            size="sm"
                            onClick={handleAddCurrentDeviceToWhitelist}
                            className="text-xs bg-green-600 hover:bg-green-700"
                          >
                            <UserCheck className="w-3 h-3 mr-1" />
                            Whitelist
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Game Rules Settings */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Max Plays per Device</Label>
                      <Input
                        type="number"
                        value={localSettings.gameRules.maxPlaysPerDevice}
                        onChange={(e) => updateLocalSettings({
                          ...localSettings,
                          gameRules: {
                            ...localSettings.gameRules,
                            maxPlaysPerDevice: parseInt(e.target.value) || 10
                          }
                        })}
                        min="1"
                        max="100"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Max Wins per Device</Label>
                      <Input
                        type="number"
                        value={localSettings.gameRules.maxWinsPerDevice}
                        onChange={(e) => updateLocalSettings({
                          ...localSettings,
                          gameRules: {
                            ...localSettings.gameRules,
                            maxWinsPerDevice: parseInt(e.target.value) || 3
                          }
                        })}
                        min="1"
                        max="50"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {/* Whitelisted Devices */}
                  <div>
                    <Label>Whitelisted Devices ({localSettings.gameRules.whitelistedDevices.length})</Label>
                    <div className="mt-2 space-y-2">
                      {localSettings.gameRules.whitelistedDevices.map((deviceId) => (
                        <div key={deviceId} className="flex items-center justify-between p-2 bg-green-50 rounded">
                          <code className="text-sm">{deviceId}</code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveWhitelistDevice(deviceId)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <UserX className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex gap-2 mt-2">
                      <Input
                        placeholder="Device ID untuk whitelist"
                        value={newWhitelistDevice}
                        onChange={(e) => setNewWhitelistDevice(e.target.value)}
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleAddWhitelistDevice}
                        disabled={!newWhitelistDevice.trim()}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Unique Names Management */}
            <Card className="bg-white border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <Tag className="w-5 h-5" />
                  Nama Unik Pemain
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600 text-sm">
                    Kelola daftar nama unik yang akan digunakan untuk generate nama pemain otomatis
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {localSettings.uniqueNames.map((name) => (
                      <div key={name} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                        <span className="capitalize">{name}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveUniqueName(name)}
                          className="h-auto p-0 w-4 h-4 text-blue-600 hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <Input
                      placeholder="Tambah nama unik baru"
                      value={newUniqueName}
                      onChange={(e) => setNewUniqueName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddUniqueName()}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleAddUniqueName}
                      disabled={!newUniqueName.trim()}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Tambah
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Admin Tools */}
            <Card className="bg-white border-2 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-600">
                  <Settings className="w-5 h-5" />
                  Admin Tools
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Change Password */}
                  <div>
                    <Button
                      variant="outline"
                      onClick={() => setShowChangePassword(!showChangePassword)}
                      className="w-full border-purple-300 text-purple-600 hover:bg-purple-50"
                    >
                      <Key className="w-4 h-4 mr-2" />
                      Ubah Password Admin
                    </Button>
                    
                    {showChangePassword && (
                      <div className="mt-4 space-y-3 p-4 bg-purple-50 rounded-lg">
                        <div>
                          <Label>Password Lama</Label>
                          <div className="relative">
                            <Input
                              type="password"
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              className="mt-1"
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Password Baru</Label>
                          <div className="relative">
                            <Input
                              type={showNewPassword ? 'text' : 'password'}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="mt-1"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                            >
                              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>
                        <div>
                          <Label>Konfirmasi Password Baru</Label>
                          <div className="relative">
                            <Input
                              type={showConfirmPassword ? 'text' : 'password'}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="mt-1"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={handleChangePassword}
                            className="flex-1 bg-purple-600 hover:bg-purple-700"
                          >
                            Ubah Password
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowChangePassword(false);
                              setCurrentPassword('');
                              setNewPassword('');
                              setConfirmPassword('');
                            }}
                            className="flex-1"
                          >
                            Batal
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <AnalyticsTab settings={localSettings} />
          </TabsContent>
        </Tabs>

        {/* Simulation Overlays */}
        {showSimulationStart && (
          <SimulationStartOverlay
            onStart={startSimulation}
            onCancel={() => setShowSimulationStart(false)}
          />
        )}

        {showSimulationResult && (
          <SimulationResultOverlay
            prizeNumber={simulationPrizeNumber!}
            isSpinning={isSpinning}
            displayNumber={displayNumber}
            canUseButtons={canUseSimulationButtons}
            countdown={simulationButtonsCountdown}
            onRandomAgain={handleSimulationRandomAgain}
            onExit={handleSimulationExit}
          />
        )}
      </div>
    </div>
  );
}