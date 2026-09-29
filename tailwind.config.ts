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
        // Tokens shadcn genéricos, para componentes copiados de librerías
        // tipo shadcn/21st.dev que esperan bg-card, text-primary, etc.
        // Ver las variables en globals.css :root — son aditivos, no tocan
        // la paleta "brand" que ya usa el resto del sitio.
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        // Tokens del componente Sidebar (shadcn) — ver globals.css :root,
        // guardados como triplete HSL sin la función hsl() envolvente.
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar))',
          foreground: 'hsl(var(--sidebar-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
        },
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
