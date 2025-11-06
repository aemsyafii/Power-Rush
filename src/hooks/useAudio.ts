import { useState, useRef, useCallback, useEffect } from 'react';

export interface AudioSettings {
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  soundEnabled: boolean;
}

export interface SoundEffects {
  tap: string;
  win: string;
  loss: string;
  prizeSpinning: string;
  backgroundMusic: string;
  notification: string;
  buttonHover: string;
  countdown: string;
  gameStart: string;
}

// Generate synthetic sounds using Web Audio API
const generateSyntheticSounds = (audioContext: AudioContext): SoundEffects => {
  const createTone = (frequency: number, duration: number, type: OscillatorType = 'sine'): string => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
    
    return 'synthetic'; // Placeholder - we'll handle this differently
  };

  return {
    tap: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmoCBy+i0vzPfS4EK3vK7t6QQAoUXrTp66hVFApGn+DyvmoCBy+i0vzPfS4EK3vK7t6QQAoUXrTp66hVFApGn+DyvmoCBy+i0vzPfS4EK3vK7t6QQAoUXrTp66hVFApGn+DyvmoCBy+i0vzPfS4EK3vK7t6QQAoUXrTp66hVFApGn+DyvmoCBy+i0vzPfS4EK3vK7t6QQAoUXrTp66hVFApGn+DyvmoCBy+i0vzPfS4EK3vK7t6QQAoUXrTp66hVFApGn+DyvmoCBy+i0vzPfS4EK3vK7t6QQAoUXrTp66hVFApGn+DyvmoCBy+i0vzPfS4EK3vK7t6QQAoUXrTp66hVFApGn+DyvmoCBy+i0vzPfS4EK3vK7t6QQAoUXrTp66hVFApGn+DyvmoCBy+i0vzPfS4EK3vK7t6QQAoUXrTp66hVFApGn+DyvmoCBy+i0vzPfS4EK3vK7d6QQAoUXrTp66hVFApGn+DyvmoCBy+i0vzPfS4EK3vK7t6QQAoUXrTp66hVFApGn+DyvmoCBy+i0vzPfS4EK3vK7t6QQAoUXrTp66hVFApGn+DyvmoCBy+i0vzPfS4EK3vK7t6QQAoUXrTp66hVFApGn+DyvmoC',
    win: 'win_sound',
    loss: 'loss_sound', 
    prizeSpinning: 'spinning_sound',
    backgroundMusic: 'background_music',
    notification: 'notification_sound',
    buttonHover: 'hover_sound',
    countdown: 'countdown_sound',
    gameStart: 'game_start_sound'
  };
};

export const useAudio = () => {
  const [audioSettings, setAudioSettings] = useState<AudioSettings>({
    masterVolume: 0.7,
    sfxVolume: 0.8,
    musicVolume: 0.4,
    soundEnabled: true,
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const soundsRef = useRef<{ [key: string]: AudioBuffer }>({});
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize audio context and sounds
  const initializeAudio = useCallback(async () => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        await generateAudioBuffers();
        setIsInitialized(true);
      } catch (error) {
        console.warn('Failed to initialize audio context:', error);
      }
    }
  }, []);

  // Generate audio buffers for different sounds
  const generateAudioBuffers = useCallback(async () => {
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const sampleRate = ctx.sampleRate;

    // Helper function to create audio buffer with specific waveform
    const createAudioBuffer = (duration: number, waveformFn: (t: number) => number): AudioBuffer => {
      const buffer = ctx.createBuffer(1, duration * sampleRate, sampleRate);
      const data = buffer.getChannelData(0);
      
      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate;
        data[i] = waveformFn(t) * 0.3; // Keep volume reasonable
      }
      
      return buffer;
    };

    // Tap sound - short click
    soundsRef.current.tap = createAudioBuffer(0.1, (t) => 
      Math.sin(2 * Math.PI * 800 * t) * Math.exp(-t * 20)
    );

    // Win sound - ascending arpeggio
    soundsRef.current.win = createAudioBuffer(1.0, (t) => {
      const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      const noteIndex = Math.floor(t * 4) % frequencies.length;
      const freq = frequencies[noteIndex];
      const envelope = Math.exp(-t * 2) * (1 - t);
      return Math.sin(2 * Math.PI * freq * t) * envelope;
    });

    // Loss sound - sad descending arpeggio with low tone
    soundsRef.current.loss = createAudioBuffer(1.2, (t) => {
      // Three descending notes: E4 -> C4 -> G3 (sad progression)
      const frequencies = [329.63, 261.63, 196.00]; // E4, C4, G3
      const noteIndex = Math.min(2, Math.floor(t * 2.5));
      const freq = frequencies[noteIndex];
      
      // Add some "sadness" with detuned harmonics
      const fundamental = Math.sin(2 * Math.PI * freq * t);
      const detune = Math.sin(2 * Math.PI * (freq * 0.99) * t) * 0.3;
      const subharmonic = Math.sin(2 * Math.PI * (freq * 0.5) * t) * 0.2;
      
      // Slow decay envelope
      const envelope = Math.exp(-t * 1.5) * (1 - t * 0.5);
      
      return (fundamental + detune + subharmonic) * envelope * 0.8;
    });

    // Prize spinning sound - rapid clicks
    soundsRef.current.prizeSpinning = createAudioBuffer(0.05, (t) => 
      Math.sin(2 * Math.PI * 1200 * t) * Math.exp(-t * 50)
    );

    // Notification sound - gentle bell
    soundsRef.current.notification = createAudioBuffer(0.6, (t) => {
      const fundamental = Math.sin(2 * Math.PI * 880 * t);
      const harmonic = Math.sin(2 * Math.PI * 1760 * t) * 0.3;
      const envelope = Math.exp(-t * 4);
      return (fundamental + harmonic) * envelope;
    });

    // Button hover sound - subtle click
    soundsRef.current.buttonHover = createAudioBuffer(0.08, (t) => 
      Math.sin(2 * Math.PI * 600 * t) * Math.exp(-t * 30)
    );

    // Countdown sound - short, punchy beep with harmonics
    soundsRef.current.countdown = createAudioBuffer(0.15, (t) => {
      const fundamental = Math.sin(2 * Math.PI * 880 * t); // A5
      const harmonic = Math.sin(2 * Math.PI * 1760 * t) * 0.4; // A6
      const envelope = Math.exp(-t * 15); // Quick decay
      return (fundamental + harmonic) * envelope * 0.8;
    });

    // Game Start sound - long continuous beep (penanda game dimulai)
    soundsRef.current.gameStart = createAudioBuffer(0.8, (t) => {
      // Long, steady beep dengan frekuensi sedikit lebih rendah dari countdown
      const fundamental = Math.sin(2 * Math.PI * 660 * t); // E5
      const harmonic = Math.sin(2 * Math.PI * 1320 * t) * 0.3; // E6
      
      // Smooth envelope - quick attack, sustained, quick release
      let envelope;
      if (t < 0.05) {
        // Quick attack (50ms)
        envelope = t * 20;
      } else if (t < 0.7) {
        // Sustained at full volume
        envelope = 1.0;
      } else {
        // Quick release at the end
        envelope = (0.8 - t) * 10;
      }
      
      return (fundamental + harmonic) * envelope * 0.9;
    });

  }, []);

  // Play sound effect
  const playSound = useCallback((soundName: keyof SoundEffects, volume: number = 1) => {
    if (!audioSettings.soundEnabled || !audioContextRef.current || !soundsRef.current[soundName]) {
      return;
    }

    try {
      const ctx = audioContextRef.current;
      const source = ctx.createBufferSource();
      const gainNode = ctx.createGain();

      source.buffer = soundsRef.current[soundName];
      source.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Calculate final volume
      const finalVolume = audioSettings.masterVolume * audioSettings.sfxVolume * volume;
      gainNode.gain.setValueAtTime(finalVolume, ctx.currentTime);

      source.start();
    } catch (error) {
      console.warn('Failed to play sound:', error);
    }
  }, [audioSettings]);

  // Play background music
  const playBackgroundMusic = useCallback(() => {
    if (!audioSettings.soundEnabled) return;

    // Create simple background ambient using Web Audio API
    if (audioContextRef.current && !musicRef.current) {
      const ctx = audioContextRef.current;
      
      // Create a simple ambient background loop
      const createAmbientMusic = () => {
        const oscillator1 = ctx.createOscillator();
        const oscillator2 = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator1.frequency.setValueAtTime(220, ctx.currentTime); // A3
        oscillator2.frequency.setValueAtTime(330, ctx.currentTime); // E4
        
        oscillator1.type = 'sine';
        oscillator2.type = 'sine';

        oscillator1.connect(gainNode);
        oscillator2.connect(gainNode);
        gainNode.connect(ctx.destination);

        const volume = audioSettings.masterVolume * audioSettings.musicVolume * 0.1;
        gainNode.gain.setValueAtTime(volume, ctx.currentTime);

        // Add gentle LFO for ambient feel
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(0.5, ctx.currentTime);
        lfoGain.gain.setValueAtTime(20, ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(oscillator1.frequency);

        oscillator1.start();
        oscillator2.start();
        lfo.start();

        // Store reference for cleanup
        return { oscillator1, oscillator2, lfo, gainNode };
      };

      // Note: For production, you'd want to implement proper background music
      // This is just a simple ambient tone
    }
  }, [audioSettings]);

  // Stop background music
  const stopBackgroundMusic = useCallback(() => {
    if (musicRef.current) {
      musicRef.current.pause();
      musicRef.current.currentTime = 0;
    }
  }, []);

  // Update audio settings
  const updateAudioSettings = useCallback((newSettings: Partial<AudioSettings>) => {
    setAudioSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('audioSettings', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('audioSettings');
    if (savedSettings) {
      try {
        setAudioSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.warn('Failed to load audio settings:', error);
      }
    }
  }, []);

  // Initialize audio on first user interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!isInitialized) {
        initializeAudio();
      }
    };

    document.addEventListener('click', handleFirstInteraction, { once: true });
    document.addEventListener('touchstart', handleFirstInteraction, { once: true });

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, [initializeAudio, isInitialized]);

  return {
    audioSettings,
    updateAudioSettings,
    playSound,
    playBackgroundMusic,
    stopBackgroundMusic,
    isInitialized,
    initializeAudio
  };
};