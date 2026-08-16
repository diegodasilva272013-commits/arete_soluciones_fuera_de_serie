import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { brand } from '@/constants/branding';
import { BrandLogo } from '@/components/brand/brand-logo';

const FEATURES = [
  { icon: '⚡', title: 'Entrenamiento real', desc: 'Apertura, cualificación, objeciones y cierre con estructura clara para escalar.' },
  { icon: '🏆', title: 'Comunidad privada', desc: 'Comparte llamadas, recibe feedback y crece junto a los mejores closers.' },
  { icon: '🎯', title: 'Mentorías en vivo', desc: 'Roleplays, prácticas y revisiones personalizadas cada semana.' },
];

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#050505]">

      {/* ── Luces ambiente ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[15%] top-[-5%] h-[600px] w-[600px] rounded-full bg-[#1a6fff] opacity-[0.055] blur-[140px]" />
        <div className="absolute right-[5%] top-[15%] h-[450px] w-[450px] rounded-full bg-[#1a6fff] opacity-[0.04] blur-[110px]" />
        <div className="absolute bottom-[-5%] left-1/2 h-[350px] w-[700px] -translate-x-1/2 rounded-full bg-[#1a6fff] opacity-[0.03] blur-[120px]" />
      </div>

      {/* ── Header ── */}
      <header className="relative z-20 mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8 sm:py-6">
        <div className="flex items-center gap-3">
          <BrandLogo size="md" priority />
          <div>
            <p className="text-sm font-semibold text-[#f5f5f5] sm:text-base">{brand.name}</p>
            <p className="hidden text-[10px] font-medium uppercase tracking-[0.2em] text-[#1a6fff] sm:block">{brand.tagline}</p>
          </div>
        </div>
        <nav className="flex items-center gap-2.5">
          <Link href="/login" className="rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-white/70 hover:border-white/20 hover:text-white transition-all sm:text-sm">
            Iniciar sesión
          </Link>
          <Link href="/register" className="rounded-full bg-[#1a6fff] px-4 py-2 text-xs font-semibold text-white shadow-[0_4px_20px_rgba(26,111,255,0.3)] hover:bg-[#0f52cc] transition-all sm:text-sm">
            Crear cuenta
          </Link>
        </nav>
      </header>

      {/* ── Hero ── */}
      <section className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-5 pb-12 pt-8 sm:px-8 lg:grid-cols-2 lg:gap-0 lg:pb-24 lg:pt-20 lg:min-h-[82vh]">

        {/* — Texto — */}
        <div className="flex flex-col justify-center lg:pr-12">

          <div className="mb-7 inline-flex w-fit items-center gap-2.5 rounded-full border border-[rgba(26,111,255,0.35)] bg-[rgba(26,111,255,0.08)] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#1a6fff]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#1a6fff]" />
            Plataforma privada · Solo invitación
          </div>

          <h1 className="text-[42px] font-black leading-[1.05] tracking-tight text-white sm:text-[52px] lg:text-[60px]">
            Domina el<br />
            <span className="relative">
              <span className="text-[#1a6fff]">closing</span>
              <span className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-[rgba(26,111,255,0.35)]" />
            </span>
            <span className="text-white/90"> de ventas</span>
          </h1>

          <p className="mt-5 max-w-md text-base leading-[1.7] text-white/50 sm:text-[17px]">
            Comunidad privada, clases, recursos y mentorías para vendedores de alto rendimiento.
          </p>

          {/* Stats */}
          <div className="mt-8 flex items-center gap-8 border-y border-white/[0.06] py-6">
            {[
              { v: '+200', l: 'Closers activos' },
              { v: '94%', l: 'Tasa de retención' },
              { v: '3×', l: 'Mejora promedio' },
            ].map(s => (
              <div key={s.l} className="flex flex-col gap-0.5">
                <span className="text-2xl font-black text-[#1a6fff] sm:text-3xl">{s.v}</span>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-white/35">{s.l}</span>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link href="/register" className="group flex items-center gap-2 rounded-full bg-[#1a6fff] px-7 py-3.5 text-sm font-bold text-white shadow-[0_8px_32px_rgba(26,111,255,0.38)] transition-all hover:bg-[#0f52cc] hover:shadow-[0_8px_40px_rgba(26,111,255,0.55)]">
              Entrar a la comunidad
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link href="/login" className="rounded-full border border-white/[0.08] px-7 py-3.5 text-sm font-medium text-white/50 transition-all hover:border-white/20 hover:text-white">
              Ya tengo cuenta
            </Link>
          </div>

          <p className="mt-5 flex items-center gap-2 text-[11px] text-white/25">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Acceso verificado · 100% privado
          </p>
        </div>

        {/* — Phone frame con video — */}
        <div className="flex items-center justify-center lg:justify-end">
          <div className="relative">

            {/* Glow */}
            <div className="absolute inset-[-10%] rounded-[50px] bg-[#1a6fff] opacity-[0.18] blur-[50px]" />

            {/* Teléfono exterior */}
            <div
              style={{
                position: 'relative',
                width: '280px',
                height: '570px',
                borderRadius: '48px',
                background: 'linear-gradient(160deg,#1c1c1e 0%,#0a0a0a 100%)',
                boxShadow: '0 0 0 1px rgba(255,255,255,0.07), 0 50px 120px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.08)',
                padding: '10px',
              }}
            >
              {/* Botones físicos */}
              <div style={{ position:'absolute', right:'-4px', top:'90px', width:'4px', height:'44px', borderRadius:'0 3px 3px 0', background:'#1a1a1c' }} />
              <div style={{ position:'absolute', left:'-4px', top:'76px', width:'4px', height:'32px', borderRadius:'3px 0 0 3px', background:'#1a1a1c' }} />
              <div style={{ position:'absolute', left:'-4px', top:'118px', width:'4px', height:'60px', borderRadius:'3px 0 0 3px', background:'#1a1a1c' }} />

              {/* Pantalla (inner) */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  borderRadius: '40px',
                  overflow: 'hidden',
                  background: '#000',
                }}
              >
                {/* Notch */}
                <div style={{ position:'absolute', top:'10px', left:'50%', transform:'translateX(-50%)', width:'90px', height:'24px', borderRadius:'20px', background:'#0a0a0a', zIndex:10, boxShadow:'inset 0 0 0 1px rgba(255,255,255,0.05)' }} />

                {/* Video — muted nativo en HTML para garantizar autoplay en mobile */}
                <div
                  style={{ position:'absolute', inset:0 }}
                  dangerouslySetInnerHTML={{
                    __html: `<video src="/video_pagina.mp4" autoplay muted playsinline loop style="width:100%;height:100%;object-fit:cover;display:block;"></video>`,
                  }}
                />

                {/* Overlay top */}
                <div style={{ position:'absolute', inset:'0 0 auto 0', height:'80px', background:'linear-gradient(to bottom, rgba(0,0,0,0.4), transparent)', zIndex:2, pointerEvents:'none' }} />
                {/* Overlay bottom */}
                <div style={{ position:'absolute', inset:'auto 0 0 0', height:'80px', background:'linear-gradient(to top, rgba(0,0,0,0.5), transparent)', zIndex:2, pointerEvents:'none' }} />
              </div>
            </div>

            {/* Badge inferior */}
            <div
              style={{
                position:'absolute', bottom:'-18px', left:'50%', transform:'translateX(-50%)',
                display:'flex', alignItems:'center', gap:'8px',
                background:'rgba(10,10,10,0.95)', border:'1px solid rgba(255,255,255,0.08)',
                borderRadius:'999px', padding:'8px 18px', whiteSpace:'nowrap',
                boxShadow:'0 8px 32px rgba(0,0,0,0.6)',
                backdropFilter:'blur(10px)',
              }}
            >
              <span style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#22c55e', boxShadow:'0 0 8px #22c55e', flexShrink:0 }} />
              <span style={{ fontSize:'12px', fontWeight:600, color:'rgba(255,255,255,0.8)', letterSpacing:'0.02em' }}>Comunidad activa</span>
            </div>

          </div>
        </div>

      </section>

      {/* ── Feature cards ── */}
      <section className="relative z-10 mx-auto max-w-6xl px-5 pb-24 sm:px-8">
        <div className="mb-10 flex items-center gap-5">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[rgba(26,111,255,0.18)]" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/25">Qué incluye</span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[rgba(26,111,255,0.18)]" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="group flex flex-col gap-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-7 transition-all hover:border-[rgba(26,111,255,0.25)] hover:bg-[rgba(26,111,255,0.04)]">
              <span className="text-2xl">{f.icon}</span>
              <div>
                <h3 className="text-sm font-bold text-white">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/40">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/[0.04] py-7 text-center text-xs text-white/20">
        © {new Date().getFullYear()} {brand.name} · Todos los derechos reservados
      </footer>

    </div>
  );
}
