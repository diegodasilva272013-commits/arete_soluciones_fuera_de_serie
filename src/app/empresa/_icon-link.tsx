'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import s from './corp.module.css';

/** Link con flecha que gira al pasar el mouse (CSS :hover, ya andaba)
 *  y AL TOCAR en celular (controlado por JS, porque :active en un
 *  <a> real en iOS no se aplica de forma confiable, y aunque se
 *  aplicara el toque navega casi al instante y no da tiempo a verlo). */
export function IconLink({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: ReactNode;
}) {
  const [pressed, setPressed] = useState(false);

  return (
    <Link
      href={href}
      className={className}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setTimeout(() => setPressed(false), 260)}
      onTouchCancel={() => setPressed(false)}
    >
      {children}
      <ArrowUpRight size={14} className={`${s.btnIcon} ${pressed ? s.btnIconActive : ''}`} />
    </Link>
  );
}
