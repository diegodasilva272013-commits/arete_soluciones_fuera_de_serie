export const brand = {
  name: 'Areté Soluciones',
  tagline: 'Fuera de Serie',
  full: 'Areté Soluciones — Fuera de Serie',
  description:
    'Sala privada de entrenamiento para vendedores de alto rendimiento.',
  colors: {
    background: '#050505',
    surface: '#111111',
    surfaceSoft: '#181818',
    gold: '#1A6FFF',
    goldSoft: '#0F52CC',
    text: '#F5F5F5',
    muted: '#A3A3A3',
    border: 'rgba(26, 111, 255, 0.25)',
  },
} as const;

export type Brand = typeof brand;
