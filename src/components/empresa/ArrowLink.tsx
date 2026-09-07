'use client';

import type { AnchorHTMLAttributes, ReactNode } from 'react';
import s from './ArrowLink.module.css';

/**
 * Flecha como <svg>, no como texto "→" pegado al label — la flecha se
 * desplaza 4px en hover (solo con mouse real), el texto queda quieto.
 * Reemplaza el patrón "Texto →" repetido en todo /empresa.
 */
export function ArrowIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`${s.icon} ${className}`}
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

type ArrowLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  className?: string;
};

/** <a> con gap fijo + ArrowIcon que se corre en hover. */
export function ArrowLink({ children, className = '', ...rest }: ArrowLinkProps) {
  return (
    <a className={`${s.link} ${className}`} {...rest}>
      <span>{children}</span>
      <ArrowIcon />
    </a>
  );
}
