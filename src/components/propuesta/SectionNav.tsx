'use client';

import { useEffect, useRef, useState } from 'react';

export type NavItem = { id: string; label: string };

// Hook de tracking de sección activa + refs para el scroll-to. Misma
// lógica que la barra de secciones de Providus, extraída para poder
// reusarla (ahí vivía toda mezclada dentro de ProposalContent).
export function useSectionNav() {
  const [activeId, setActiveId] = useState('');
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const fn = () => {
      const sections = Object.entries(sectionRefs.current);
      for (let i = sections.length - 1; i >= 0; i--) {
        const [id, el] = sections[i];
        if (el && window.scrollY + 140 >= el.offsetTop) { setActiveId(id); break; }
      }
    };
    window.addEventListener('scroll', fn, { passive: true });
    fn();
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const scrollTo = (id: string) => sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const setRef = (id: string) => (el: HTMLElement | null) => { sectionRefs.current[id] = el; };

  return { activeId, setRef, scrollTo };
}

// Barra de secciones sticky con highlight de la activa + etiqueta lateral
// ("Confidencial" por default). top se pasa por prop en vez de estar fijo
// en 68 como en Providus, para no acoplar este componente a la altura de
// un header en particular.
export function SectionNav({
  items,
  activeId,
  onNavigate,
  top = 68,
  label = 'Confidencial',
}: {
  items: NavItem[];
  activeId: string;
  onNavigate: (id: string) => void;
  top?: number;
  label?: string;
}) {
  return (
    <div style={{ position: 'sticky', top, zIndex: 100 }}>
      <nav
        className="propNav"
        style={{ display: 'flex', gap: 2, padding: '0 32px', height: 44, background: 'rgba(5,5,5,0.96)', borderBottom: '1px solid var(--linea)', backdropFilter: 'blur(16px)', overflowX: 'auto', scrollbarWidth: 'none' }}
      >
        {items.map(({ id, label: itemLabel }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
              fontFamily: 'var(--f-mono), monospace', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase',
              padding: '0 14px', height: '100%',
              color: activeId === id ? 'var(--azul-luz)' : 'rgba(242,239,233,0.4)',
              borderBottom: activeId === id ? '2px solid var(--azul)' : '2px solid transparent',
              transition: 'color 0.2s, border-color 0.2s',
            }}
          >
            {itemLabel}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', fontFamily: 'var(--f-mono), monospace', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--ceniza)', whiteSpace: 'nowrap', paddingLeft: 14 }}>
          {label}
        </span>
      </nav>
      <div className="propNavFade" style={{ display: 'none', position: 'absolute', top: 0, right: 0, bottom: 0, width: 64, background: 'linear-gradient(to right, transparent, rgba(5,5,5,0.96))', pointerEvents: 'none' }} />
    </div>
  );
}
