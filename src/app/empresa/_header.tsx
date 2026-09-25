'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { X, ChevronDown } from 'lucide-react';
import s from './_header.module.css';
import { CircularNav } from './_circular-nav';

const SOLUCIONES = [
  { href: '/empresa/servicios/diagnostico-operativo',      label: 'Diagnóstico Operativo' },
  { href: '/empresa/servicios/software-a-medida',           label: 'Software a Medida' },
  { href: '/empresa/servicios/crm-erp-a-medida',             label: 'CRM y ERP a Medida' },
  { href: '/empresa/servicios/automatizacion-de-procesos',   label: 'Automatización de Procesos' },
  { href: '/empresa/agentes-ia',                             label: 'Agentes de Voz con IA' },
];

const NAV = [
  { href: '/empresa/metodologia', label: 'Método'         },
  { href: '/empresa/nosotros',    label: 'Nosotros'       },
  { href: '/empresa/equipo',      label: 'Equipo'         },
  { href: '/fuera-de-serie',      label: 'Fuera de Serie' },
  { href: '/empresa/contacto',    label: 'Contacto'       },
];

export function CorpHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const solutionsRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); setSolutionsOpen(false); }, [pathname]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (solutionsRef.current && !solutionsRef.current.contains(e.target as Node)) {
        setSolutionsOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const openSolutions = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setSolutionsOpen(true);
  };
  const scheduleCloseSolutions = () => {
    closeTimer.current = setTimeout(() => setSolutionsOpen(false), 150);
  };

  const isSolutionsActive = pathname.startsWith('/empresa/servicios') || pathname === '/empresa/agentes-ia';

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
          <div
            ref={solutionsRef}
            className={s.navItem}
            onMouseEnter={openSolutions}
            onMouseLeave={scheduleCloseSolutions}
          >
            <button
              type="button"
              className={`${s.link} ${s.navItemTrigger} ${isSolutionsActive ? s.active : ''}`}
              onClick={() => setSolutionsOpen(v => !v)}
              aria-haspopup="true"
              aria-expanded={solutionsOpen}
            >
              Soluciones
              <ChevronDown size={12} style={{ transform: solutionsOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
            {solutionsOpen && (
              <div className={s.dropdown} role="menu">
                {SOLUCIONES.map(({ href, label }) => (
                  <Link key={href} href={href} className={s.dropdownLink} role="menuitem">
                    {label}
                  </Link>
                ))}
                <Link href="/empresa/servicios" className={s.dropdownLinkAll} role="menuitem">
                  Ver todos los servicios →
                </Link>
              </div>
            )}
          </div>
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

        <div className={s.burgerWrap}>
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
          <span className={s.burgerLabel}>Menú</span>
        </div>
      </div>

      <CircularNav isOpen={open} onClose={() => setOpen(false)} />
    </header>
  );
}
