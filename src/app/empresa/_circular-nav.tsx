'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { X, Home, Boxes, Compass, Users, MessageCircle, LogIn } from 'lucide-react';

interface NavItem {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Inicio', icon: Home, href: '/empresa' },
  { name: 'Soluciones', icon: Boxes, href: '/empresa/servicios' },
  { name: 'Método', icon: Compass, href: '/empresa/metodologia' },
  { name: 'Nosotros', icon: Users, href: '/empresa/nosotros' },
  { name: 'Contacto', icon: MessageCircle, href: '/empresa/contacto' },
  { name: 'Acceso', icon: LogIn, href: '/acceso' },
];

/**
 * Adaptado del snippet pegado: el original usaba `exit` de framer-motion
 * sin <AnimatePresence>, asi que la animacion de cierre nunca se veia
 * (React desmontaba el div de golpe). Se agrega AnimatePresence para que
 * el exit realmente corra. `bg-background` (clase de shadcn, no
 * configurada en este proyecto) se reemplaza por --negro real.
 *
 * Controlado desde afuera (isOpen/onClose): no tiene boton propio, va
 * en el lugar del hamburger del header mobile.
 */
export function CircularNav({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [radius, setRadius] = useState(150);

  // El circulo se achica en pantallas chicas (max-w-[92vw]); si el radio
  // de los items quedara fijo en 150px, en celular se saldrian del borde.
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setRadius(w < 380 ? 92 : w < 480 ? 108 : w < 640 ? 128 : 150);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div
            className="fixed inset-0 flex items-center justify-center"
            style={{ zIndex: 3100, background: 'rgba(5,5,5,0.85)' }}
            onClick={onClose}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="relative aspect-square w-[420px] max-w-[92vw] rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(47,123,246,0.06)',
                border: '1px solid rgba(47,123,246,0.25)',
                boxShadow:
                  'inset 2px 2px 2px rgba(92,154,255,0.15), inset -1px -1px 1px rgba(92,154,255,0.08)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={onClose}
                aria-label="Cerrar menú"
                className="absolute flex items-center justify-center w-12 h-12 rounded-full z-10"
                style={{ background: 'var(--azul)', color: '#fff', border: 'none', cursor: 'pointer' }}
              >
                <X className="w-6 h-6" />
              </button>

              {NAV_ITEMS.map((item, index) => {
                const Icon = item.icon;
                const angle = (360 / NAV_ITEMS.length) * index;
                const isHover = hovered === item.name;
                const itemSize = radius < 110 ? 60 : radius < 130 ? 68 : 80;

                return (
                  <div
                    key={item.name}
                    className="absolute"
                    style={{
                      transform: `rotate(${angle}deg) translate(${radius}px) rotate(-${angle}deg)`,
                    }}
                  >
                    <Link
                      href={item.href}
                      className="flex flex-col items-center justify-center rounded-full transition-colors duration-200"
                      style={{
                        width: itemSize,
                        height: itemSize,
                        background: isHover ? 'var(--azul)' : 'var(--negro-2)',
                        color: isHover ? '#fff' : 'var(--hueso)',
                        border: `1px solid ${isHover ? 'var(--azul)' : 'var(--linea-2)'}`,
                        textDecoration: 'none',
                      }}
                      onMouseEnter={() => setHovered(item.name)}
                      onMouseLeave={() => setHovered(null)}
                      onClick={onClose}
                    >
                      <Icon className="w-6 h-6 mb-1" />
                      <span style={{ fontSize: 11, fontWeight: 500 }}>{item.name}</span>
                    </Link>
                  </div>
                );
              })}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
