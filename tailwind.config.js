/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('nativewind/preset')],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bmBlack: '#0A0A0A',
        bmDark: '#171717',
        bmMuted: '#262626',
        bmGold: '#ff7a00',
        bmGoldLight: '#ffd9b3',
        bmOutline: '#ffd4aa',
        bmWhite: '#ffffff',
        bmDim: '#6b7280',
        bmSuccess: '#22C55E',
        bmError: '#EF4444',
        bmWarning: '#F59E0B',
      },
      fontFamily: {
        sans: ['Poppins_400Regular', 'System'],
        display: ['Poppins_600SemiBold', 'System'],
      },
    },
  },
  plugins: [],
};
