import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        brand: {
          black: '#050505',
          surface: '#111111',
          surfaceSoft: '#181818',
          gold: '#1A6FFF',      /* Azul eléctrico Areté */
          goldSoft: '#0F52CC',
          text: '#F5F5F5',
          muted: '#A3A3A3',
          border: 'rgba(26, 111, 255, 0.25)',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        gold: '0 0 0 1px rgba(26, 111, 255, 0.25), 0 8px 24px -12px rgba(26, 111, 255, 0.35)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #1A6FFF 0%, #0F52CC 100%)',
        'surface-gradient': 'linear-gradient(180deg, #111111 0%, #0a0a0a 100%)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
