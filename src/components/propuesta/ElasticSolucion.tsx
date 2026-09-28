'use client';

import { useState, useRef, useLayoutEffect, useEffect } from 'react';
import Image from 'next/image';

export type ElasticTab = { id: string; label: string; content: React.ReactNode; img?: string };

const IMG_HEIGHT = 160;

// Panel mobile que mide su propio contenido real (scrollHeight) en vez de
// adivinar un maxHeight fijo. Igual al de Providus.
function MobilePanelContent({ isActive, children }: { isActive: boolean; children: React.ReactNode }) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(2000);
  useEffect(() => { if (innerRef.current) setHeight(innerRef.current.scrollHeight); }, [isActive, children]);
  return (
    <div style={{ overflow: 'hidden', maxHeight: isActive ? height : 0, transition: 'max-height 0.5s cubic-bezier(0.25,1,0.5,1)' }}>
      <div ref={innerRef} style={{ padding: '14px 18px 20px', borderTop: '1px solid var(--linea)' }}>{children}</div>
    </div>
  );
}

function VerticalLabel({ label }: { label: string }) {
  return (
    <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontFamily: 'var(--f-mono), monospace', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(242,239,233,0.75)', whiteSpace: 'nowrap' }}>
      {label}
    </span>
  );
}

// Paneles con pestañas: desktop en acordeón horizontal elástico (flex),
// mobile en acordeón vertical. Versión genérica de "ElasticSolucion" de
// Providus: cada item puede traer o no una imagen — sin imagen, el panel
// funciona igual, con un encabezado de color liso en vez de foto. El alto
// de la fila se mide del contenido real de la pestaña activa (una fila
// gemela oculta, sin transiciones, evita el problema de medir a mitad de
// una animación — mismo mecanismo que en Providus).
export function ElasticSolucion({ items }: { items: ElasticTab[] }) {
  const [activeId, setActiveId] = useState(items[0].id);
  const [isMobile, setIsMobile] = useState(false);
  const [rowHeight, setRowHeight] = useState(500);
  const [fontsReady, setFontsReady] = useState(false);
  const measureRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const measureRefSetters = useRef<Record<string, (el: HTMLDivElement | null) => void>>({});
  const getMeasureRef = (id: string) => {
    if (!measureRefSetters.current[id]) measureRefSetters.current[id] = (el) => { measureRefs.current[id] = el; };
    return measureRefSetters.current[id];
  };

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined' || !('fonts' in document)) { setFontsReady(true); return; }
    document.fonts.ready.then(() => setFontsReady(true)).catch(() => setFontsReady(true));
  }, []);

  const activeItem = items.find((i) => i.id === activeId) ?? items[0];
  const hasImg = !!activeItem.img;

  useLayoutEffect(() => {
    if (isMobile) return;
    const measure = () => {
      const el = measureRefs.current[activeId];
      if (!el) return;
      const textHeight = el.getBoundingClientRect().height;
      setRowHeight(Math.round(textHeight + (hasImg ? IMG_HEIGHT : 0) + 1));
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [activeId, isMobile, fontsReady, hasImg]);

  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--linea)' }}>
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <div key={item.id} style={{ background: '#050505' }}>
              <div onClick={() => setActiveId(item.id)} style={{ cursor: 'pointer' }}>
                {item.img ? (
                  <div style={{ position: 'relative', height: isActive ? 200 : 48, transition: 'height 0.6s cubic-bezier(0.25,1,0.5,1)', overflow: 'hidden' }}>
                    <Image src={item.img} alt={item.label} fill sizes="100vw" style={{ objectFit: 'cover', filter: isActive ? 'brightness(0.65)' : 'brightness(0.32)' }} />
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', paddingLeft: 18, background: isActive ? 'none' : 'rgba(5,5,5,0.2)' }}>
                      <span style={{ fontFamily: 'var(--f-mono), monospace', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(242,239,233,0.9)' }}>{item.label}</span>
                    </div>
                  </div>
                ) : (
                  <div style={{ height: 48, display: 'flex', alignItems: 'center', paddingLeft: 18, background: isActive ? 'rgba(47,123,246,0.08)' : 'transparent', borderBottom: isActive ? '2px solid var(--azul)' : '2px solid transparent', transition: 'background 0.3s, border-color 0.3s' }}>
                    <span style={{ fontFamily: 'var(--f-mono), monospace', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: isActive ? 'var(--azul-luz)' : 'rgba(242,239,233,0.6)' }}>{item.label}</span>
                  </div>
                )}
              </div>
              <MobilePanelContent isActive={isActive}>{item.content}</MobilePanelContent>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Fila gemela oculta, sin transiciones — solo para medir. */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, visibility: 'hidden', pointerEvents: 'none', zIndex: -1, display: 'flex', gap: 1 }}>
        {items.map((item) => (
          <div key={item.id} style={{ flex: activeId === item.id ? 5 : 1, minWidth: 0 }}>
            <div ref={getMeasureRef(item.id)} style={{ padding: '18px 20px' }}>{item.content}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 1, background: 'var(--linea)', height: rowHeight, alignItems: 'stretch', transition: 'height 0.4s cubic-bezier(0.25,1,0.5,1)' }}>
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <div key={item.id} onMouseEnter={() => setActiveId(item.id)} onClick={() => setActiveId(item.id)} style={{ flex: isActive ? 5 : 1, transition: 'flex 0.7s cubic-bezier(0.25,1,0.5,1)', cursor: 'pointer', overflow: 'hidden', minWidth: 0, display: 'flex', flexDirection: 'column', background: '#050505' }}>
              {item.img ? (
                <div style={{ position: 'relative', height: isActive ? IMG_HEIGHT : '100%', flexShrink: 0, overflow: 'hidden', transition: 'height 0.5s cubic-bezier(0.25,1,0.5,1)' }}>
                  <Image src={item.img} alt={item.label} fill sizes="20vw" style={{ objectFit: 'cover', filter: isActive ? 'brightness(0.75)' : 'brightness(0.38)' }} />
                  {!isActive && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><VerticalLabel label={item.label} /></div>}
                </div>
              ) : (
                !isActive && (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(47,123,246,0.04)' }}>
                    <VerticalLabel label={item.label} />
                  </div>
                )
              )}
              <div style={{ flex: isActive ? 1 : 0, minHeight: 0, padding: isActive ? '18px 20px' : '0px 20px', background: '#050505', borderTop: isActive && item.img ? '1px solid var(--linea)' : 'none', opacity: isActive ? 1 : 0, transform: isActive ? 'translateY(0)' : 'translateY(6px)', transition: 'opacity 0.35s 0.12s, transform 0.35s 0.12s, flex 0.5s cubic-bezier(0.25,1,0.5,1), padding 0.5s', overflow: 'hidden' }}>
                <span style={{ display: 'inline-block', marginBottom: 10, padding: '2px 8px', border: '1px solid rgba(92,154,255,0.4)', background: 'rgba(47,123,246,0.12)', fontFamily: 'var(--f-mono), monospace', fontSize: 8, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--azul-luz)' }}>{item.label}</span>
                {item.content}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
