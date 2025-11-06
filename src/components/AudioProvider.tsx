import React, { createContext, useContext, ReactNode } from 'react';
import { useAudio, AudioSettings, SoundEffects } from '../hooks/useAudio';

interface AudioContextType {
  audioSettings: AudioSettings;
  updateAudioSettings: (newSettings: Partial<AudioSettings>) => void;
  playSound: (soundName: keyof SoundEffects, volume?: number) => void;
  playBackgroundMusic: () => void;
  stopBackgroundMusic: () => void;
  isInitialized: boolean;
  initializeAudio: () => Promise<void>;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

interface AudioProviderProps {
  children: ReactNode;
}

export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  const audioHook = useAudio();

  return (
    <AudioContext.Provider value={audioHook}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudioContext = (): AudioContextType => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudioContext must be used within an AudioProvider');
  }
  return context;
};