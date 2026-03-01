/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        night: '#020617',
        panel: '#0f172a',
        mint: '#6ee7b7',
        moss: '#22c55e',
        cyanmist: '#67e8f9',
      },
      keyframes: {
        drift: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        fadeScale: {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        drift: 'drift 5s ease-in-out infinite',
        fadeScale: 'fadeScale 600ms ease-out forwards',
      },
      boxShadow: {
        glow: '0 0 40px rgba(34, 197, 94, 0.25)',
      },
    },
  },
  plugins: [],
};
