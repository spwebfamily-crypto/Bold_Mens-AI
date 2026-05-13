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
        bmBlack: '#050505',
        bmDark: '#121212',
        bmMuted: '#2C2C2E',
        bmGold: '#D4AF37',
        bmGoldLight: '#E5C76B',
        bmOutline: '#3A3A3C',
        bmWhite: '#FFFFFF',
        bmDim: '#9CA3AF',
        bmSuccess: '#34C759',
        bmError: '#FF3B30',
        bmWarning: '#FF9500',
      },
      fontFamily: {
        sans: ['Poppins_400Regular', 'System'],
        display: ['Poppins_600SemiBold', 'System'],
      },
    },
  },
  plugins: [],
};
