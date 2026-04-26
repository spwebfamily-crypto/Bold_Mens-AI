export const Colors = {
  background: '#0A0A0A',
  backgroundCard: '#171717',
  backgroundInput: '#1F1F1F',
  backgroundMuted: '#262626',
  border: '#262626',

  accent: '#ff7a00',
  accentLight: '#ffd9b3',
  accentDark: '#ea580c',
  accentAlpha: 'rgba(255, 122, 0, 0.14)',

  textPrimary: '#ffffff',
  textSecondary: '#d4d4d4',
  textMuted: '#6b7280',
  textOnAccent: '#ffffff',

  success: '#22C55E',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',

  siteBase: '#ffffff',
  siteSurface: '#f7f7f7',
  siteSurfaceLight: '#fff8f1',
  siteInk: '#1f1f1f',
  siteOutline: '#ffd4aa',
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
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
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
