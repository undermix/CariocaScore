import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeMode, ThemeColors, getThemeColors, fontSize as baseFontSize } from './theme';

interface ThemeContextType {
  mode: ThemeMode;
  colors: ThemeColors;
  fontScale: number;
  setMode: (mode: ThemeMode) => void;
  setFontScale: (scale: number) => void;
  fs: (size: number) => number;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'casino',
  colors: getThemeColors('casino'),
  fontScale: 1,
  setMode: () => {},
  setFontScale: () => {},
  fs: (s) => s,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('casino');
  const [fontScale, setFontScaleState] = useState(1);

  useEffect(() => {
    AsyncStorage.getItem('carioca_theme').then((v) => {
      if (v === 'light' || v === 'dark' || v === 'casino') setModeState(v);
    });
    AsyncStorage.getItem('carioca_fontscale').then((v) => {
      if (v) setFontScaleState(parseFloat(v));
    });
  }, []);

  const setMode = (m: ThemeMode) => {
    setModeState(m);
    AsyncStorage.setItem('carioca_theme', m);
  };

  const setFontScale = (s: number) => {
    setFontScaleState(s);
    AsyncStorage.setItem('carioca_fontscale', s.toString());
  };

  const fs = (size: number) => Math.round(size * fontScale);

  return (
    <ThemeContext.Provider value={{ 
      mode, 
      colors: getThemeColors(mode), 
      fontScale, 
      setMode, 
      setFontScale,
      fs,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);