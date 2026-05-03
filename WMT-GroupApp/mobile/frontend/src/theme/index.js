import { useColorScheme } from 'react-native';

export const palette = {
  charcoal: '#0E0E10',
  charcoalSoft: '#16161A',
  charcoalMuted: '#1F1F24',
  charcoalLine: '#2A2A30',
  ivory: '#F6F1E7',
  ivoryDim: '#E8E2D3',
  cream: '#FBF8F2',
  gold: '#C8A45C',
  goldSoft: '#D7B97A',
  goldDeep: '#A6843E',
  burgundy: '#5B1A26',
  burgundyDeep: '#3B0E18',
  emerald: '#1F4D3A',
  rose: '#E76F51',
  white: '#FFFFFF',
  black: '#000000',
  textOnDark: '#F6F1E7',
  textOnDarkMuted: 'rgba(246,241,231,0.62)',
  textOnDarkSoft: 'rgba(246,241,231,0.78)',
  textOnLight: '#0E0E10',
  textOnLightMuted: 'rgba(14,14,16,0.55)',
  textOnLightSoft: 'rgba(14,14,16,0.78)',
  successFg: '#2F9E6E',
  warnFg: '#D4A437',
  errorFg: '#D45A5A'
};

export const lightTheme = {
  mode: 'light',
  bg: palette.cream,
  bgElevated: palette.white,
  surface: palette.white,
  surfaceMuted: '#F0EBE0',
  surfaceLine: '#E0DACA',
  text: palette.textOnLight,
  textMuted: palette.textOnLightMuted,
  textSoft: palette.textOnLightSoft,
  textInverse: palette.textOnDark,
  primary: palette.charcoal,
  primaryMuted: palette.charcoalSoft,
  accent: palette.goldDeep,
  accentSoft: palette.gold,
  danger: palette.errorFg,
  success: palette.successFg,
  warning: palette.warnFg,
  burgundy: palette.burgundy,
  scrim: 'rgba(14,14,16,0.55)',
  cardShadow: 'rgba(14,14,16,0.10)',
  isDark: false
};

export const darkTheme = {
  mode: 'dark',
  bg: palette.charcoal,
  bgElevated: palette.charcoalSoft,
  surface: palette.charcoalSoft,
  surfaceMuted: palette.charcoalMuted,
  surfaceLine: palette.charcoalLine,
  text: palette.textOnDark,
  textMuted: palette.textOnDarkMuted,
  textSoft: palette.textOnDarkSoft,
  textInverse: palette.textOnLight,
  primary: palette.gold,
  primaryMuted: palette.goldDeep,
  accent: palette.gold,
  accentSoft: palette.goldSoft,
  danger: palette.errorFg,
  success: palette.successFg,
  warning: palette.warnFg,
  burgundy: palette.burgundy,
  scrim: 'rgba(0,0,0,0.65)',
  cardShadow: 'rgba(0,0,0,0.45)',
  isDark: true
};

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 };
export const radius = { sm: 8, md: 12, lg: 18, xl: 24, full: 999 };
export const fontSize = {
  xs: 11, sm: 13, md: 15, lg: 17, xl: 20, xxl: 26, xxxl: 34, display: 44
};

export const shadow = (theme, level = 1) => {
  const opacityMap = { 1: 0.10, 2: 0.18, 3: 0.28 };
  return {
    shadowColor: theme.cardShadow,
    shadowOpacity: opacityMap[level] || 0.10,
    shadowRadius: 12 * level,
    shadowOffset: { width: 0, height: 4 * level },
    elevation: 4 * level
  };
};

export const useTheme = () => {
  const scheme = useColorScheme();
  return scheme === 'light' ? lightTheme : darkTheme;
};

export const formatCurrency = (amount, currency = 'USD') => {
  if (amount === undefined || amount === null) return '';
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2
    }).format(amount);
  } catch {
    return `$${Number(amount).toFixed(2)}`;
  }
};
