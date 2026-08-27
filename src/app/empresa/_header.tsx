'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Brandmark } from '@/components/brand/brandmark';
import s from './_header.module.css';

const NAV = [
  { href: '/empresa',              label: 'Inicio'      },
  { href: '/empresa/servicios',    label: 'Servicios'   },
  { href: '/empresa/metodologia',  label: 'Metodología' },
  { href: '/empresa/nosotros',     label: 'Nosotros'    },
  { href: '/empresa/contacto',     label: 'Contacto'    },
];

const WA = 'https://wa.me/5491143215678?text=Hola%2C%20me%20interesa%20saber%20m%C3%A1s%20sobre%20Aret%C3%A9%20Soluciones';

export function CorpHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Cierra el menú si cambia la ruta
  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <header className={`${s.header} ${scrolled ? s.scrolled : ''}`}>
      <div className={s.inner}>
        <Brandmark variant="lockup" size="sm" href="/empresa" priority />

        <nav className={s.nav} aria-label="Navegación principal">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`${s.link} ${pathname === href ? s.active : ''}`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <a href={WA} target="_blank" rel="noopener noreferrer" className={s.cta}>
          Hablemos
        </a>

        <button
          className={s.burger}
          onClick={() => setOpen(v => !v)}
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={open}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <div className={s.hairline} aria-hidden="true" />

      {open && (
        <div className={s.mobile}>
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`${s.mobileLink} ${pathname === href ? s.active : ''}`}
            >
              {label}
            </Link>
          ))}
          <a href={WA} target="_blank" rel="noopener noreferrer" className={s.mobileCta}>
            Escribinos por WhatsApp →
          </a>
        </div>
      )}
    </header>
  );
}
