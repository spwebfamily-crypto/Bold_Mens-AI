export const Colors = {
  background: '#050505',
  backgroundCard: '#121212',
  backgroundInput: '#1C1C1E',
  backgroundMuted: '#2C2C2E',
  border: '#3A3A3C',

  accent: '#D4AF37',
  accentLight: '#E5C76B',
  accentDark: '#B8860B',
  accentAlpha: 'rgba(212, 175, 55, 0.15)',

  textPrimary: '#FFFFFF',
  textSecondary: '#EBEBF5',
  textMuted: '#9CA3AF',
  textOnAccent: '#000000',

  success: '#34C759',
  error: '#FF3B30',
  warning: '#FF9500',
  info: '#0A84FF',

  siteBase: '#FFFFFF',
  siteSurface: '#F2F2F7',
  siteSurfaceLight: '#FFFFFF',
  siteInk: '#000000',
  siteOutline: '#D1D1D6',
} as const;

export const Fonts = {
  heading: 'Poppins_600SemiBold',
  headingBold: 'Poppins_700Bold',
  headingItalic: 'Poppins_600SemiBold',
  body: 'Poppins_400Regular',
  bodySemiBold: 'Poppins_600SemiBold',
  bodyBold: 'Poppins_700Bold',
  caption: 'Poppins_400Regular',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const Layout = {
  screenPadding: 20,
  cardPadding: 16,
  inputHeight: 52,
  buttonHeight: 56,
  tabBarHeight: 83,
  headerHeight: 96,
} as const;

export const Typography = {
  hero: { fontSize: 40, lineHeight: 48, letterSpacing: 0 },
  h1: { fontSize: 32, lineHeight: 40, letterSpacing: 0 },
  h2: { fontSize: 24, lineHeight: 32, letterSpacing: 0 },
  h3: { fontSize: 20, lineHeight: 28, letterSpacing: 0 },
  body: { fontSize: 16, lineHeight: 24, letterSpacing: 0 },
  small: { fontSize: 14, lineHeight: 20, letterSpacing: 0 },
  caption: { fontSize: 12, lineHeight: 16, letterSpacing: 0.5 },
  label: { fontSize: 10, lineHeight: 14, letterSpacing: 2 },
} as const;
