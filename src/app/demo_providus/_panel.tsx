'use client';

/**
 * DEMO PROVIDUS — panel de marca de los ingresos.
 * Decisión de diseño: el video real del logo ocupa todo el panel (es lo más fuerte que
 * tiene la marca) y lo único que se suma es UNA cosa viva: las cargas de las promotoras
 * entrando a la central, con quién las hizo y por qué canal. Sin íconos decorativos ni
 * etiquetas en mayúsculas: la información es el adorno. Los nombres son de ejemplo y el
 * panel lo dice. Las marcas de canal son sólidas y chicas para que se reconozcan al instante.
 */

import { useEffect, useState } from 'react';
import { HeroLogo } from './_hero';

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
const MARCA: Record<Canal, React.ReactNode> = {
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

export function PanelMarca() {
  const [n, setN] = useState(3);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setN((x) => x + 1), 3000);
    return () => clearInterval(t);
  }, []);
  // Las tres más recientes; la última entra arriba.
  const visibles = [0, 1, 2].map((k) => ({ i: n - k, ...EJEMPLOS[(n - k) % EJEMPLOS.length] }));

  return (
    <div className="absolute inset-0">
      <HeroLogo />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(26,20,13,0.95)_0,rgba(26,20,13,0.5)_34%,transparent_64%)]" aria-hidden="true" />

      <div className="absolute inset-x-5 bottom-12 sm:inset-x-8 sm:bottom-6 lg:inset-x-12 lg:bottom-12" aria-hidden="true">
        <p className="mb-3.5 flex items-center gap-2.5 text-[13px] font-semibold text-[var(--pv-aluminio)]">
          <span className="relative flex h-2 w-2">
            <span className="pv-pulso absolute inset-0 rounded-full bg-[var(--pv-naranja-luz)]" />
            <span className="relative h-2 w-2 rounded-full bg-[var(--pv-naranja-luz)]" />
          </span>
          En vivo
          <span className="hidden font-medium text-[var(--pv-sec)] sm:inline">Así llegan las cargas a la central (nombres de ejemplo)</span>
        </p>

        <ul className="flex max-w-[470px] flex-col gap-2">
          {visibles.map((v, k) => (
            <li
              key={v.i}
              className={`pv-carga items-center gap-3.5 rounded-[14px] bg-[rgba(26,20,13,0.64)] py-2.5 pl-2.5 pr-4 shadow-[inset_0_0_0_1px_rgba(227,197,142,0.16),0_18px_40px_-18px_rgba(0,0,0,0.85)] ${k === 0 ? 'flex' : 'hidden sm:flex'}`}
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
    </div>
  );
}
