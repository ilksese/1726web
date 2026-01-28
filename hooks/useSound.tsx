'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

interface SoundContextType {
  isMuted: boolean;
  toggleMute: () => void;
  playSFX: (type: 'click' | 'win' | 'lose' | 'hit' | 'coin' | 'gift_open' | 'coin_receive') => void;
  startBGM: () => void;
  stopBGM: () => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMuted, setIsMuted] = useState(false);
  const bgmRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const savedMute = localStorage.getItem('soundMuted');
    if (savedMute === 'true') setIsMuted(true);

    // 初始化 BGM
    bgmRef.current = new Audio('https://assets.mixkit.co/music/preview/mixkit-dreaming-big-31.mp3'); // 示例 BGM
    bgmRef.current.loop = true;
    bgmRef.current.volume = 0.3;

    return () => {
      bgmRef.current?.pause();
      bgmRef.current = null;
    };
  }, []);

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    localStorage.setItem('soundMuted', nextMuted.toString());
    
    if (bgmRef.current) {
      bgmRef.current.muted = nextMuted;
    }
  };

  const playSFX = (type: string) => {
    if (isMuted) return;

    const sfxMap: Record<string, string> = {
      click: 'https://assets.mixkit.co/sfx/preview/mixkit-click-release-924.mp3',
      win: 'https://assets.mixkit.co/sfx/preview/mixkit-winning-chime-2029.mp3',
      lose: 'https://assets.mixkit.co/sfx/preview/mixkit-falling-game-over-1942.mp3',
      hit: 'https://assets.mixkit.co/sfx/preview/mixkit-boxer-getting-hit-2055.mp3',
      coin: 'https://assets.mixkit.co/sfx/preview/mixkit-clinking-coins-723.mp3',
      gift_open: 'https://assets.mixkit.co/sfx/preview/mixkit-magical-surprise-shimmer-2318.mp3',
      coin_receive: 'https://assets.mixkit.co/sfx/preview/mixkit-coins-handling-1939.mp3',
    };

    const audio = new Audio(sfxMap[type]);
    audio.volume = 0.5;
    audio.play().catch(e => console.warn('SFX play failed', e));
  };

  const startBGM = () => {
    if (bgmRef.current && !isMuted) {
      bgmRef.current.play().catch(e => console.warn('BGM play failed', e));
    }
  };

  const stopBGM = () => {
    bgmRef.current?.pause();
  };

  return (
    <SoundContext.Provider value={{ isMuted, toggleMute, playSFX, startBGM, stopBGM }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) throw new Error('useSound must be used within SoundProvider');
  return context;
};
