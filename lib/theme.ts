import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export type ThemeMode = 'light' | 'dark' | 'casino';

export interface ThemeColors {
background: string;
surface: string;
surfaceHighlight: string;
card: string;
cardBorder: string;
text: string;
textSecondary: string;
textMuted: string;
primary: string;
primaryLight: string;
accent: string;
success: string;
danger: string;
warning: string;
border: string;
inputBg: string;
inputBorder: string;
tabBar: string;
tabBarBorder: string;
headerBg: string;
overlay: string;
gold: string;
silver: string;
bronze: string;
}

const lightTheme: ThemeColors = {
background: '#F5F6FA',
surface: '#FFFFFF',
surfaceHighlight: '#F0F1F5',
card: '#FFFFFF',
cardBorder: '#E8E9ED',
text: '#1A1D26',
textSecondary: '#5A5E6A',
textMuted: '#9A9DA8',
primary: '#2563EB',
primaryLight: '#DBEAFE',
accent: '#7C3AED',
success: '#10B981',
danger: '#EF4444',
warning: '#F59E0B',
border: '#E5E7EB',
inputBg: '#F3F4F6',
inputBorder: '#D1D5DB',
tabBar: '#FFFFFF',
tabBarBorder: '#E5E7EB',
headerBg: '#FFFFFF',
overlay: 'rgba(0,0,0,0.5)',
gold: '#F59E0B',
silver: '#9CA3AF',
bronze: '#D97706',
};

const darkTheme: ThemeColors = {
background: '#0F1117',
surface: '#1A1D26',
surfaceHighlight: '#252830',
card: '#1E2028',
cardBorder: '#2D303A',
text: '#F0F1F5',
textSecondary: '#A0A3AD',
textMuted: '#6B6E78',
primary: '#3B82F6',
primaryLight: '#1E3A5F',
accent: '#8B5CF6',
success: '#34D399',
danger: '#F87171',
warning: '#FBBF24',
border: '#2D303A',
inputBg: '#252830',
inputBorder: '#3D404A',
tabBar: '#1A1D26',
tabBarBorder: '#2D303A',
headerBg: '#1A1D26',
overlay: 'rgba(0,0,0,0.7)',
gold: '#FBBF24',
silver: '#9CA3AF',
bronze: '#F59E0B',
};

const casinoTheme: ThemeColors = {
background: '#0A3D2A',
surface: '#0D4D34',
surfaceHighlight: '#126B3A',
card: '#0D4D34',
cardBorder: '#1A6B45',
text: '#FFFFFF',
textSecondary: '#E0E0E0',
textMuted: '#A0A0A0',
primary: '#D4A843',
primaryLight: '#2A5F3D',
accent: '#C4372D',
success: '#4ADE80',
danger: '#C4372D',
warning: '#D4A843',
border: '#1A6B45',
inputBg: '#126B3A',
inputBorder: '#1A8B50',
tabBar: '#0A3D2A',
tabBarBorder: '#1A6B45',
headerBg: '#0A3D2A',
overlay: 'rgba(0,0,0,0.6)',
gold: '#D4A843',
silver: '#C4B89A',
bronze: '#B87333',
};

export function getThemeColors(mode: ThemeMode): ThemeColors {
switch (mode) {
case 'dark': return darkTheme;
case 'casino': return casinoTheme;
default: return lightTheme;
}
}

export const spacing = {
xs: 4,
sm: 8,
md: 12,
lg: 16,
xl: 20,
xxl: 24,
xxxl: 32,
};

export const borderRadius = {
sm: 8,
md: 12,
lg: 16,
xl: 20,
full: 9999,
};

export const fontSize = {
xs: 11,
sm: 13,
md: 15,
lg: 17,
xl: 20,
xxl: 24,
xxxl: 30,
display: 36,
};

export const DEFAULT_ROUNDS = [
  { id: '1', name: '2 Tríos', cards: 6 },
  { id: '2', name: '1 Trío y 1 Escala', cards: 7 },
  { id: '3', name: '2 Escalas', cards: 8 },
  { id: '4', name: '3 Tríos', cards: 9 },
  { id: '5', name: '2 Tríos y 1 Escala', cards: 10 },
  { id: '6', name: '1 Trío y 2 Escalas', cards: 11 },
  { id: '7', name: '3 Escalas', cards: 12 },
  { id: '8', name: '4 Tríos', cards: 12 },
  { id: '9', name: 'Escala Sucia', cards: 13 },
  { id: '10', name: 'Escala Real o Pintada', cards: 13 },
];

export const SCREEN_PADDING = Math.min(16, SCREEN_WIDTH * 0.04);