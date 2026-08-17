'use client';

import Image from 'next/image';
import Link from 'next/link';

type Variant = 'mark' | 'lockup' | 'stamp';
type Size = 'sm' | 'md' | 'lg' | 'xl';

interface BrandmarkProps {
  variant?: Variant;
  size?: Size;
  href?: string;
  priority?: boolean;
  /** Monochrome: aplica mix-blend-mode screen para usar sobre video/imagen oscura */
  mono?: boolean;
  className?: string;
}

/* ── Escalas ── */
const MARK_PX: Record<Size, number> = { sm: 28, md: 36, lg: 48, xl: 72 };

const STAMP_PX: Record<Size, number> = { sm: 80, md: 120, lg: 160, xl: 200 };

/* ── Variante: mark ─────────────────────────────────────────── */
function Mark({
  size = 'md',
  mono,
  priority,
}: Pick<BrandmarkProps, 'size' | 'mono' | 'priority'>) {
  const px = MARK_PX[size!];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: px,
        height: px,
        borderRadius: '50%',
        border: '1px solid rgba(26,111,255,0.45)',
        background: mono ? 'transparent' : '#0a0a0a',
        boxShadow: '0 0 0 1px rgba(26,111,255,0.10), 0 0 18px -4px rgba(26,111,255,0.5)',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      <Image
        src="/Aretea_fuera _de_serie_logo.png"
        alt="Areté Soluciones"
        width={px}
        height={px}
        priority={priority}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          mixBlendMode: mono ? 'screen' : 'normal',
        }}
      />
    </span>
  );
}

/* ── Variante: lockup ───────────────────────────────────────── */
function Lockup({
  size = 'md',
  mono,
  priority,
}: Pick<BrandmarkProps, 'size' | 'mono' | 'priority'>) {
  const textScale: Record<Size, { name: number; sub: number; gap: number }> = {
    sm: { name: 12, sub: 9,  gap: 10 },
    md: { name: 14, sub: 10, gap: 12 },
    lg: { name: 17, sub: 11, gap: 14 },
    xl: { name: 20, sub: 12, gap: 16 },
  };
  const t = textScale[size!];

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: t.gap }}>
      <Mark size={size} mono={mono} priority={priority} />
      <span style={{ display: 'flex', flexDirection: 'column', gap: 3, lineHeight: 1 }}>
        <strong
          style={{
            fontSize: t.name,
            fontWeight: 700,
            letterSpacing: '-0.01em',
            color: '#fff',
          }}
        >
          Areté Soluciones
        </strong>
        <em
          style={{
            fontStyle: 'normal',
            fontSize: t.sub,
            fontWeight: 600,
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            color: '#1a6fff',
          }}
        >
          Fuera de Serie
        </em>
      </span>
    </span>
  );
}

/* ── Variante: stamp ────────────────────────────────────────── */
function Stamp({
  size = 'xl',
  mono,
  priority,
}: Pick<BrandmarkProps, 'size' | 'mono' | 'priority'>) {
  const px = STAMP_PX[size!];
  const cut = Math.round(px * 0.12);           // chaflán proporcional
  const outerCut = Math.round(px * 0.155);

  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: px,
        height: px,
        flexShrink: 0,
      }}
    >
      {/* marco exterior desfasado */}
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: -7,
          border: '1px solid rgba(26,111,255,0.4)',
          clipPath: `polygon(${outerCut}px 0, 100% 0, 100% calc(100% - ${outerCut}px), calc(100% - ${outerCut}px) 100%, 0 100%, 0 ${outerCut}px)`,
          pointerEvents: 'none',
        }}
      />
      {/* sello interior con chaflán */}
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          background: mono ? 'rgba(5,5,5,0.35)' : 'rgba(10,10,10,0.85)',
          backdropFilter: 'blur(6px)',
          border: '1px solid rgba(26,111,255,0.25)',
          clipPath: `polygon(${cut}px 0, 100% 0, 100% calc(100% - ${cut}px), calc(100% - ${cut}px) 100%, 0 100%, 0 ${cut}px)`,
          overflow: 'hidden',
        }}
      >
        <Image
          src="/Aretea_fuera _de_serie_logo.png"
          alt="Areté Soluciones"
          width={px}
          height={px}
          priority={priority}
          style={{
            width: '88%',
            height: '88%',
            objectFit: 'contain',
            mixBlendMode: mono ? 'screen' : 'normal',
            filter: mono ? 'drop-shadow(0 0 32px rgba(26,111,255,0.5))' : 'none',
          }}
        />
      </span>
    </span>
  );
}

/* ── Componente principal ───────────────────────────────────── */
export function Brandmark({
  variant = 'mark',
  size = 'md',
  href,
  priority,
  mono,
  className,
}: BrandmarkProps) {
  const inner =
    variant === 'stamp'   ? <Stamp   size={size} mono={mono} priority={priority} /> :
    variant === 'lockup'  ? <Lockup  size={size} mono={mono} priority={priority} /> :
                            <Mark    size={size} mono={mono} priority={priority} />;

  if (href) {
    return (
      <Link
        href={href}
        aria-label="Areté Soluciones"
        className={className}
        style={{ display: 'inline-flex', textDecoration: 'none', color: 'inherit' }}
      >
        {inner}
      </Link>
    );
  }

  return (
    <span className={className} style={{ display: 'inline-flex' }}>
      {inner}
    </span>
  );
}
