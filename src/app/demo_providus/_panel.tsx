'use client';

/**
 * DEMO PROVIDUS — piezas del panel izquierdo de los ingresos:
 *  - CargasEnVivo: las cargas de las promotoras entrando a la central (nombres de ejemplo).
 *  - ICONOS_ORBITA: los íconos que giran alrededor del nombre (promotora, datos, tiempo real,
 *    en vivo, Instagram, WhatsApp, llamada y CRM), llenos y de color, como los del original.
 */

import { useEffect, useState } from 'react';

type Canal = 'WhatsApp' | 'Instagram' | 'Llamada' | 'CRM';

const EJEMPLOS: { quien: string; donde: string; canal: Canal }[] = [
  { quien: 'Laura Pérez', donde: 'Rosario', canal: 'WhatsApp' },
  { quien: 'Camila Ríos', donde: 'Córdoba', canal: 'Llamada' },
  { quien: 'Julieta Maidana', donde: 'Paraná', canal: 'Instagram' },
  { quien: 'Agustina Sosa', donde: 'Mendoza', canal: 'WhatsApp' },
  { quien: 'Florencia Gómez', donde: 'Santa Fe', canal: 'CRM' },
  { quien: 'Micaela Torres', donde: 'Tucumán', canal: 'Llamada' },
];

const g = { viewBox: '0 0 24 24', fill: 'currentColor', 'aria-hidden': true } as const;
export const MARCA: Record<Canal, React.ReactNode> = {
  WhatsApp: (
    <svg {...g}><path d="M12 2.4a9.6 9.6 0 0 0-8.2 14.6L2.5 21.5l4.6-1.2A9.6 9.6 0 1 0 12 2.4Zm4.9 13.6c-.2.6-1.2 1.1-1.7 1.2-.4.1-1 .1-1.6-.1-2.800-1-4.600-3.400-4.800-3.600-.1-.2-1.100-1.500-1.100-2.800 0-1.300.7-1.900.9-2.200.2-.2.5-.3.700-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .6l-.4.6c-.2.2-.3.4-.1.700.2.300.8 1.300 1.700 2.100 1.200 1 2.200 1.300 2.500 1.500.3.1.5.1.7-.1l.9-1.100c.2-.3.4-.2.700-.1l1.900.9c.3.1.5.2.5.4 0 .1 0 .7-.2 1.300Z" /></svg>
  ),
  Instagram: (
    <svg {...g}><path d="M8 2.5h8A5.5 5.5 0 0 1 21.500 8v8a5.500 5.500 0 0 1-5.500 5.500H8A5.500 5.500 0 0 1 2.500 16V8A5.500 5.500 0 0 1 8 2.500Zm0 2A3.500 3.500 0 0 0 4.500 8v8A3.500 3.500 0 0 0 8 19.500h8a3.500 3.500 0 0 0 3.500-3.500V8A3.500 3.500 0 0 0 16 4.500H8Zm4 2.800a4.700 4.700 0 1 1 0 9.400 4.700 4.700 0 0 1 0-9.400Zm0 2a2.700 2.700 0 1 0 0 5.400 2.700 2.700 0 0 0 0-5.400Zm5-3.200a1.100 1.100 0 1 1 0 2.200 1.100 1.100 0 0 1 0-2.200Z" /></svg>
  ),
  Llamada: (
    <svg {...g}><path d="M6.600 2.800c.5-.1 1 .1 1.200.6l1.400 3.300c.2.400.1.900-.2 1.200L7.700 9.200a12 12 0 0 0 7.100 7.100l1.300-1.300c.3-.3.800-.4 1.200-.2l3.300 1.400c.5.200.7.700.6 1.200l-.4 2.700c-.1.700-.7 1.200-1.400 1.200C10.800 21.300 2.700 13.200 2.700 4.600c0-.7.500-1.300 1.200-1.400l2.700-.4Z" /></svg>
  ),
  CRM: (
    <svg {...g}><rect x="3" y="4" width="5.200" height="16" rx="1.400" /><rect x="9.400" y="4" width="5.200" height="10.500" rx="1.400" /><rect x="15.800" y="4" width="5.200" height="13" rx="1.400" /></svg>
  ),
};

const iniciales = (n: string) => n.split(' ').map((p) => p[0]).join('');

export function CargasEnVivo() {
  const [n, setN] = useState(3);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setN((x) => x + 1), 3000);
    return () => clearInterval(t);
  }, []);
  // Las tres más recientes; la última entra arriba.
  const visibles = [0, 1, 2].map((k) => ({ i: n - k, ...EJEMPLOS[(n - k) % EJEMPLOS.length] }));

  return (
    <div className="w-full max-w-[470px]" aria-hidden="true">
      <p className="mb-3.5 flex items-center gap-2.5 text-[13px] font-semibold text-[var(--pv-aluminio)]">
        <span className="relative flex h-2 w-2">
          <span className="pv-pulso absolute inset-0 rounded-full bg-[var(--pv-naranja-luz)]" />
          <span className="relative h-2 w-2 rounded-full bg-[var(--pv-naranja-luz)]" />
        </span>
        En vivo
        <span className="font-medium text-[var(--pv-sec)]">Así llegan las cargas a la central (nombres de ejemplo)</span>
      </p>
      <ul className="flex flex-col gap-2">
        {visibles.map((v, k) => (
          <li
            key={v.i}
            className="pv-carga flex items-center gap-3.5 rounded-[14px] bg-[rgba(26,20,13,0.64)] py-2.5 pl-2.5 pr-4 shadow-[inset_0_0_0_1px_rgba(227,197,142,0.16),0_18px_40px_-18px_rgba(0,0,0,0.85)]"
            style={{ opacity: k === 0 ? 1 : k === 1 ? 0.7 : 0.4 }}
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[var(--pv-bronce-700)] to-[var(--pv-bronce-800)] text-[14px] font-semibold text-[var(--pv-arena)] shadow-[inset_0_0_0_1px_rgba(227,197,142,0.35)]">{iniciales(v.quien)}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[14.5px] font-semibold text-[var(--pv-aluminio)]">{v.quien}</span>
              <span className="block truncate text-[12px] text-[var(--pv-sec)]">Cargó un cliente desde {v.donde}</span>
            </span>
            <span className="flex shrink-0 flex-col items-end gap-1">
              <span className="flex items-center gap-1.5 text-[12px] font-medium text-[var(--pv-arena)]">
                <span className="h-3.5 w-3.5">{MARCA[v.canal]}</span>
                {v.canal}
              </span>
              <span className="pv-num text-[11px] text-[var(--pv-sec)]">{k === 0 ? 'ahora' : `hace ${k * 3} s`}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── íconos que giran: círculos de color con el glifo en blanco ──
const Disco = ({ fondo, children }: { fondo: string; children: React.ReactNode }) => (
  <span className="relative block h-full w-full rounded-full text-white shadow-[0_6px_16px_-6px_rgba(0,0,0,0.7)]" style={{ background: fondo }} aria-hidden="true">
    <span className="absolute inset-[24%] block [&>svg]:h-full [&>svg]:w-full">{children}</span>
  </span>
);

const GLIFO = {
  promotora: (<svg {...g}><circle cx="12" cy="8.2" r="4.2" /><path d="M3.8 21c.6-4.3 3.8-6.7 8.2-6.7s7.6 2.4 8.2 6.7H3.8Z" /></svg>),
  datos: (<svg {...g}><path d="M12 2.8c4.7 0 8 1.4 8 3.4s-3.3 3.4-8 3.4-8-1.4-8-3.4 3.3-3.4 8-3.4Zm8 6.3v3.2c0 2-3.3 3.4-8 3.4s-8-1.4-8-3.4V9.1c1.7 1.3 4.8 2 8 2s6.3-.7 8-2Zm0 6.1v3c0 2-3.3 3.4-8 3.4s-8-1.4-8-3.4v-3c1.7 1.3 4.8 2 8 2s6.3-.7 8-2Z" /></svg>),
  tiempoReal: (<svg {...g} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 12.5h4l2.6-6.500 4 11 2.400-6 1.500 1.500h4.500" /></svg>),
  envivo: (<svg {...g}><circle cx="12" cy="12" r="2.6" /><path d="M7 7a7 7 0 0 0 0 10M17 7a7 7 0 0 1 0 10M4 4a11 11 0 0 0 0 16M20 4a11 11 0 0 1 0 16" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" /></svg>),
} as const;

const disco = (fondo: string, glifo: React.ReactNode) => () => <Disco fondo={fondo}>{glifo}</Disco>;
const IG = 'linear-gradient(45deg, #feda75, #fa7e1e 30%, #d62976 62%, #4f5bd5)';

export const ICONOS_ORBITA = [
  { component: disco('#25d366', MARCA.WhatsApp), className: 'size-[30px] border-none bg-transparent', duration: 20, delay: 20, radius: 100, path: false, reverse: false },
  { component: disco('#b89a6a', MARCA.Llamada), className: 'size-[30px] border-none bg-transparent', duration: 20, delay: 10, radius: 100, path: false, reverse: false },
  { component: disco('#c94b27', GLIFO.promotora), className: 'size-[50px] border-none bg-transparent', radius: 210, duration: 20, path: false, reverse: false },
  { component: disco('#8a7a64', GLIFO.datos), className: 'size-[50px] border-none bg-transparent', radius: 210, duration: 20, delay: 20, path: false, reverse: false },
  { component: disco(IG, MARCA.Instagram), className: 'size-[30px] border-none bg-transparent', duration: 20, delay: 20, radius: 150, path: false, reverse: true },
  { component: disco('#e0603a', GLIFO.tiempoReal), className: 'size-[30px] border-none bg-transparent', duration: 20, delay: 10, radius: 150, path: false, reverse: true },
  { component: disco('#d93a2b', GLIFO.envivo), className: 'size-[50px] border-none bg-transparent', radius: 270, duration: 20, path: false, reverse: true },
  { component: disco('#43362a', MARCA.CRM), className: 'size-[50px] border-none bg-transparent', radius: 270, duration: 20, delay: 60, path: false, reverse: true },
];
