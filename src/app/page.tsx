'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { brand } from '@/constants/branding';
import { BrandLogo } from '@/components/brand/brand-logo';

const FEATURES = [
  { icon: '⚡', title: 'Entrenamiento real', desc: 'Apertura, cualificación, objeciones y cierre con estructura clara.' },
  { icon: '🏆', title: 'Comunidad privada', desc: 'Comparte llamadas, recibe feedback y crece con otros closers.' },
  { icon: '🎯', title: 'Mentorías en vivo', desc: 'Roleplays, prácticas y revisiones cada semana.' },
];

export default function HomePage() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.volume = 0;
    v.play().catch(() => {});
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505]">

      {/* Luces ambientales de fondo */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[20%] top-[-10%] h-[500px] w-[500px] rounded-full bg-[#1a6fff] opacity-[0.05] blur-[130px]" />
        <div className="absolute right-[10%] top-[20%] h-[400px] w-[400px] rounded-full bg-[#1a6fff] opacity-[0.04] blur-[100px]" />
        <div className="absolute bottom-0 left-1/2 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-[#1a6fff] opacity-[0.03] blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative z-20 mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-6">
        <div className="flex min-w-0 items-center gap-3">
          <BrandLogo size="md" priority />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#f5f5f5] sm:text-base">{brand.name}</p>
            <p className="hidden text-[10px] uppercase tracking-widest text-[#1a6fff] sm:block">{brand.tagline}</p>
          </div>
        </div>
        <nav className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link href="/login" className="rounded-full border border-[rgba(26,111,255,0.3)] px-3 py-2 text-xs font-medium text-[#f5f5f5] hover:bg-[rgba(26,111,255,0.08)] transition-colors sm:px-4 sm:text-sm">
            Iniciar sesión
          </Link>
          <Link href="/register" className="rounded-full bg-[#1a6fff] px-3 py-2 text-xs font-semibold text-white hover:bg-[#0f52cc] transition-colors sm:px-4 sm:text-sm">
            Crear cuenta
          </Link>
        </nav>
      </header>

      {/* HERO — dos columnas */}
      <section className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 pb-10 pt-6 sm:px-6 sm:pt-10 lg:grid-cols-2 lg:gap-16 lg:pb-20 lg:pt-16">

        {/* Columna izquierda — copy */}
        <div className="flex flex-col items-start">

          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-[rgba(26,111,255,0.3)] bg-[rgba(26,111,255,0.08)] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#1a6fff]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#1a6fff]" />
            Solo por invitación
          </span>

          <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-[#f5f5f5] sm:text-5xl lg:text-[56px]">
            Plataforma privada<br />
            de{' '}
            <span className="relative inline-block">
              <span className="relative z-10 text-[#1a6fff]">entrenamiento</span>
              <span className="absolute -bottom-1 left-0 right-0 h-[2px] rounded-full bg-[rgba(26,111,255,0.4)]" />
            </span>
          </h1>

          <p className="mt-5 text-base leading-relaxed text-[#a3a3a3] sm:text-lg">
            Comunidad, clases, recursos y acompañamiento<br className="hidden sm:block" />
            para <span className="font-semibold text-[#f5f5f5]">dominar el closing</span>.
          </p>

          {/* Stats */}
          <div className="mt-8 flex gap-8">
            {[
              { v: '+200', l: 'Closers' },
              { v: '94%', l: 'Retención' },
              { v: '3×', l: 'Mejora' },
            ].map(s => (
              <div key={s.l}>
                <div className="text-2xl font-extrabold text-[#1a6fff]">{s.v}</div>
                <div className="text-xs uppercase tracking-widest text-[#a3a3a3]">{s.l}</div>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/register" className="flex items-center gap-2 rounded-full bg-[#1a6fff] px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_30px_rgba(26,111,255,0.35)] hover:bg-[#0f52cc] hover:shadow-[0_8px_30px_rgba(26,111,255,0.5)] transition-all">
              Entrar a la comunidad <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/login" className="rounded-full border border-[rgba(255,255,255,0.1)] px-6 py-3 text-sm font-medium text-[#a3a3a3] hover:border-[rgba(255,255,255,0.25)] hover:text-[#f5f5f5] transition-all">
              Ya tengo cuenta
            </Link>
          </div>

          {/* Trust */}
          <p className="mt-6 flex items-center gap-2 text-xs text-[#a3a3a3]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#1a6fff]">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Acceso seguro · Solo miembros verificados
          </p>
        </div>

        {/* Columna derecha — phone frame con video */}
        <div className="flex items-center justify-center lg:justify-end">
          <div className="relative">

            {/* Glow detrás del teléfono */}
            <div className="absolute inset-0 rounded-[44px] bg-[#1a6fff] opacity-20 blur-[40px] scale-90" />

            {/* Marco del teléfono */}
            <div
              className="relative overflow-hidden"
              style={{
                width: '260px',
                height: '520px',
                borderRadius: '42px',
                border: '8px solid #141414',
                boxShadow: `
                  0 0 0 1px rgba(255,255,255,0.06),
                  0 40px 100px rgba(0,0,0,0.8),
                  inset 0 0 0 1px rgba(255,255,255,0.04)
                `,
                background: '#000',
              }}
            >
              {/* Notch */}
              <div className="absolute left-1/2 top-3 z-10 h-5 w-20 -translate-x-1/2 rounded-full bg-[#0a0a0a] border border-[rgba(255,255,255,0.05)]" />

              {/* Botón lateral */}
              <div className="absolute -right-[10px] top-20 h-10 w-[5px] rounded-r-full bg-[#1a1a1a]" />
              <div className="absolute -left-[10px] top-16 h-7 w-[5px] rounded-l-full bg-[#1a1a1a]" />
              <div className="absolute -left-[10px] top-28 h-7 w-[5px] rounded-l-full bg-[#1a1a1a]" />

              {/* Video */}
              <video
                ref={videoRef}
                src="/video_pagina.mp4"
                autoPlay
                muted
                playsInline
                loop
                className="absolute inset-0 h-full w-full object-cover"
              />

              {/* Overlay sutil arriba para el notch */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/50 to-transparent" />
            </div>

            {/* Badge flotante — debajo del teléfono */}
            <div
              className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full border border-[rgba(26,111,255,0.25)] bg-[#0a0a0a] px-4 py-2 text-xs font-semibold text-[#f5f5f5] shadow-[0_8px_30px_rgba(0,0,0,0.5)] whitespace-nowrap"
            >
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#22c55e]" />
              Comunidad activa
            </div>
          </div>
        </div>

      </section>

      {/* Feature cards */}
      <section className="relative z-10 mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="mb-10 flex items-center gap-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[rgba(26,111,255,0.2)] to-transparent" />
          <span className="text-xs uppercase tracking-widest text-[#a3a3a3]">Qué incluye</span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[rgba(26,111,255,0.2)] to-transparent" />
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="group flex flex-col gap-4 rounded-2xl border border-[rgba(26,111,255,0.1)] bg-[#0a0a0a] p-6 transition-all hover:border-[rgba(26,111,255,0.28)] hover:shadow-[0_8px_30px_rgba(26,111,255,0.08)]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(26,111,255,0.08)] text-xl">
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

      <footer className="relative z-10 border-t border-[rgba(26,111,255,0.07)] py-6 text-center text-xs text-[#a3a3a3]">
        © {new Date().getFullYear()} {brand.name}. Todos los derechos reservados.
      </footer>

    </div>
  );
}
