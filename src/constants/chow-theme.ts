import { Platform } from 'react-native';

export const ChowTheme = {
  colors: {
    // Primary prompt palette:
    cream: '#FEFAE0', // Dominant background & light surfaces
    creamDark: '#F7F2D0',
    creamCard: '#FAF5DC',
    nude: '#D8B49C', // Accent & secondary tone
    nudeLight: '#F3E5D8',
    nudeDark: '#B88F75',
    brown: '#4D2C1E', // Chocolate brown for high contrast, buttons, headings
    brownDark: '#361E14',
    brownLight: '#6E4331',
    brownBorder: '#4D2C1E26', // subtle brown stroke

    // Semantic helpers
    textPrimary: '#4D2C1E',
    textSecondary: '#7C5B4C',
    textMuted: '#9B7F72',
    surface: '#FEFAE0',
    surfaceAlt: '#FAF5DC',
    card: '#FFFFFF',
    cardBrown: '#4D2C1E',
    border: '#E8DCCF',
    success: '#2E7D32',
    successLight: '#E8F5E9',
    warning: '#D97706',
    warningLight: '#FEF3C7',
    badge: '#D8B49C33',
    white: '#FFFFFF',
    danger: '#DC2626',
    dangerLight: '#FEE2E2',
    activeDot: '#4D2C1E',
    inactiveDot: '#D8B49C',
  },
  typography: {
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
      web: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif',
      default: 'sans-serif',
    }),
    serifFont: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      web: '"Playfair Display", Georgia, serif',
      default: 'serif',
    }),
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
    hero: 48,
  },
  radii: {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 20,
    xl: 28,
    pill: 9999,
  },
  shadows: {
    soft: {
      shadowColor: '#4D2C1E',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 2,
    },
    prominent: {
      shadowColor: '#4D2C1E',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.14,
      shadowRadius: 20,
      elevation: 5,
    },
  },
};
