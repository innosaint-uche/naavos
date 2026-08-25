/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'naavos-dark': '#0a0a0f',
        'naavos-purple': '#8b5cf6',
        'naavos-cyan': '#06b6d4',
        'naavos-pink': '#ec4899',
      },
      fontFamily: {
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
        sans: ['var(--font-inter)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
