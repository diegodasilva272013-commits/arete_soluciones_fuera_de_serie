import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { brand } from '@/constants/branding';
import { BrandLogo } from '@/components/brand/brand-logo';

const FEATURES = [
  {
    icon: '⚡',
    title: 'Entrenamiento real',
    desc: 'Apertura, cualificación, objeciones y cierre. Estructura clara para escalar.',
  },
  {
    icon: '🏆',
    title: 'Comunidad privada',
    desc: 'Comparte llamadas, recibe feedback y crece con otros closers.',
  },
  {
    icon: '🎯',
    title: 'Mentorías en vivo',
    desc: 'Calendario semanal de prácticas, roleplays y revisiones.',
  },
];

const STATS = [
  { value: '+200', label: 'Closers activos' },
  { value: '94%', label: 'Tasa de retención' },
  { value: '3x', label: 'Promedio de mejora' },
];

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505]">

      {/* Fondo de luz ambiental */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[600px] w-[700px] -translate-x-1/2 rounded-full bg-[#1a6fff] opacity-[0.06] blur-[120px]" />
        <div className="absolute right-0 top-1/3 h-[300px] w-[400px] rounded-full bg-[#1a6fff] opacity-[0.04] blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative z-20 mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-6">
        <div className="flex min-w-0 items-center gap-3">
          <BrandLogo size="md" priority />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold sm:text-base">{brand.name}</p>
            <p className="hidden text-[10px] uppercase tracking-widest text-[#1a6fff] sm:block">
              {brand.tagline}
            </p>
          </div>
        </div>
        <nav className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="rounded-full border border-[rgba(26,111,255,0.35)] px-3 py-2 text-xs font-medium text-[#f5f5f5] hover:bg-[rgba(26,111,255,0.1)] transition-colors sm:px-4 sm:text-sm"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-[#1a6fff] px-3 py-2 text-xs font-semibold text-white hover:bg-[#0f52cc] transition-colors sm:px-4 sm:text-sm"
          >
            Crear cuenta
          </Link>
        </nav>
      </header>

      {/* HERO */}
      <section className="relative z-10 mx-auto max-w-6xl px-4 pb-12 pt-8 sm:px-6 sm:pb-20 sm:pt-14 lg:pt-20">

        {/* Badge */}
        <div className="mb-8 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(26,111,255,0.3)] bg-[rgba(26,111,255,0.08)] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#1a6fff]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#1a6fff]" />
            Plataforma privada · Solo por invitación
          </span>
        </div>

        {/* Logo central grande */}
        <div className="mb-8 flex flex-col items-center">
          {/* Anillos decorativos */}
          <div className="relative mb-8 flex items-center justify-center">
            <div className="absolute h-[220px] w-[220px] rounded-full border border-[rgba(26,111,255,0.12)] animate-pulse" />
            <div className="absolute h-[280px] w-[280px] rounded-full border border-[rgba(26,111,255,0.07)]" />
            <div
              className="relative z-10 overflow-hidden rounded-[28px] border border-[rgba(26,111,255,0.25)] shadow-[0_0_60px_rgba(26,111,255,0.2)]"
              style={{ padding: '2px', background: 'linear-gradient(135deg, rgba(26,111,255,0.3), rgba(26,111,255,0.05))' }}
            >
              <div className="rounded-[26px] overflow-hidden bg-[#080808]">
                <Image
                  src="/icon-512.png"
                  alt="Areté Soluciones"
                  width={130}
                  height={130}
                  priority
                  className="block"
                />
              </div>
            </div>
          </div>

          {/* Headline */}
          <h1 className="max-w-3xl text-center text-4xl font-extrabold leading-tight tracking-tight text-[#f5f5f5] sm:text-5xl lg:text-6xl">
            Plataforma privada de{' '}
            <span className="relative">
              <span className="relative z-10 text-[#1a6fff]">entrenamiento</span>
              <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full bg-[rgba(26,111,255,0.4)]" />
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-center text-base leading-relaxed text-[#a3a3a3] sm:text-lg">
            Comunidad, clases, recursos y acompañamiento para{' '}
            <span className="font-semibold text-[#f5f5f5]">dominar el closing</span>.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="flex items-center gap-2 rounded-full bg-[#1a6fff] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_8px_30px_rgba(26,111,255,0.35)] hover:bg-[#0f52cc] hover:shadow-[0_8px_30px_rgba(26,111,255,0.5)] transition-all"
            >
              Entrar a la comunidad <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-[rgba(255,255,255,0.12)] px-7 py-3.5 text-sm font-medium text-[#a3a3a3] hover:border-[rgba(255,255,255,0.25)] hover:text-[#f5f5f5] transition-all"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 mb-16 flex flex-wrap justify-center gap-8 sm:gap-12">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-extrabold text-[#1a6fff] sm:text-3xl">{s.value}</div>
              <div className="mt-0.5 text-xs uppercase tracking-widest text-[#a3a3a3]">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Divisor */}
        <div className="mb-12 flex items-center gap-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[rgba(26,111,255,0.2)] to-transparent" />
          <span className="text-xs uppercase tracking-widest text-[#a3a3a3]">Qué incluye</span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[rgba(26,111,255,0.2)] to-transparent" />
        </div>

        {/* Feature cards */}
        <div className="grid gap-5 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group flex flex-col gap-4 rounded-2xl border border-[rgba(26,111,255,0.12)] bg-[#0a0a0a] p-6 transition-all hover:border-[rgba(26,111,255,0.3)] hover:bg-[#0d0d0d] hover:shadow-[0_8px_30px_rgba(26,111,255,0.1)]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(26,111,255,0.1)] text-xl">
                {f.icon}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#f5f5f5]">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[#a3a3a3]">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[rgba(26,111,255,0.08)] py-6 text-center text-xs text-[#a3a3a3]">
        © {new Date().getFullYear()} {brand.name}. Todos los derechos reservados.
      </footer>

    </div>
  );
}
