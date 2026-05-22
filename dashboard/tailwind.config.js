/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'naass-dark': '#0a0a0f',
        'naass-purple': '#8b5cf6',
        'naass-cyan': '#06b6d4',
        'naass-pink': '#ec4899'
      },
      fontFamily: {
        mono: ['Geist Mono', 'monospace'],
        sans: ['Geist', 'sans-serif']
      }
    }
  },
  plugins: []
};