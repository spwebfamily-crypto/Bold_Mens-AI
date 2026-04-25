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
        bmDark: '#1A1A1A',
        bmGold: '#C9A84C',
        bmGoldLight: '#E8C97A',
        bmWhite: '#F5F5F5',
        bmDim: '#A0A0A0',
        bmSuccess: '#1D9E75',
        bmError: '#E85D5D',
        bmWarning: '#F0A500',
      },
      fontFamily: {
        sans: ['Inter', 'System'],
        display: ['Playfair Display', 'System'],
      },
    },
  },
  plugins: [],
};
