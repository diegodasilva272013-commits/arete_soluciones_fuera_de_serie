'use client';

import { useEffect, useState } from 'react';
import s from './StickyNav.module.css';

const ITEMS = [
  { id: 'ventas', label: 'Ventas' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'administracion', label: 'Administración' },
  { id: 'delivery', label: 'Delivery' },
];

/** Nav lateral sticky, solo ≥1280px. La activa se ilumina en azul, ligada a scroll. */
export function StickyNav() {
  const [active, setActive] = useState('ventas');

  useEffect(() => {
    const sections = ITEMS.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    );
    sections.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <nav className={s.nav} aria-label="Áreas de servicio">
      {ITEMS.map((item) => (
        <a key={item.id} href={`#${item.id}`} className={s.link} data-active={active === item.id}>
          {item.label}
        </a>
      ))}
    </nav>
  );
}
