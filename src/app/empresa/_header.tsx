'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import s from './_header.module.css';
import { CircularNav } from './_circular-nav';

const NAV = [
  { href: '/empresa/servicios',   label: 'Soluciones'  },
  { href: '/empresa/metodologia', label: 'Método'      },
  { href: '/empresa/nosotros',    label: 'Nosotros'    },
  { href: '/empresa/contacto',    label: 'Contacto'    },
];

export function CorpHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <header className={`${s.header} ${scrolled ? s.scrolled : ''}`}>
      <div className={s.inner}>
        <Link href="/empresa" className={s.logoWrap}>
          <Image
            src="/LOGO_ARETE.png"
            alt="Areté Soluciones"
            width={140}
            height={40}
            style={{ height: 34, width: 'auto', objectFit: 'contain' }}
            priority
          />
        </Link>

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

        <Link href="/acceso" className={s.cta}>Acceso</Link>

        <button
          className={s.burger}
          onClick={() => setOpen(v => !v)}
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={open}
        >
          {open ? (
            <X size={20} />
          ) : (
            <Image
              src="/LOGO_ARETE.png"
              alt=""
              width={26}
              height={26}
              style={{ width: 22, height: 'auto', objectFit: 'contain' }}
            />
          )}
        </button>
      </div>

      <CircularNav isOpen={open} onClose={() => setOpen(false)} />
    </header>
  );
}
