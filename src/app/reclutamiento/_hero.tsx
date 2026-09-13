import { Spotlight } from '@/components/ui/spotlight';
import { BrandLogo } from '@/components/brand/brand-logo';
import { Countdown } from './_countdown';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#050505] px-5 pb-16 pt-16 sm:pt-20">
      <Spotlight className="-top-40 left-1/2 -translate-x-1/2" size={480} />

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center">
        <BrandLogo size="lg" priority />

        <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#D4AF37]">
          Reclutamiento — Setters &amp; Cold Callers
        </p>
        <h1 className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight text-brand-text sm:text-6xl">
          Buscamos gente que{' '}
          <span className="bg-gradient-to-b from-[#f4dfa0] to-[#D4AF37] bg-clip-text text-transparent">
            levante el teléfono
          </span>
          , no que lo tema.
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-brand-muted sm:text-lg">
          Sumate al equipo para llamar y setear leads. No buscamos el currículum perfecto —
          buscamos compromiso real, todos los días.
        </p>

        <a
          href="#postularme"
          className="mt-9 inline-flex items-center justify-center rounded-md bg-gradient-to-br from-[#f4dfa0] to-[#D4AF37] px-8 py-3.5 text-sm font-semibold text-[#0a0a0a] shadow-[0_8px_24px_-12px_rgba(212,175,55,0.6)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_-10px_rgba(212,175,55,0.85)]"
        >
          Quiero postularme
        </a>

        <div className="mt-14">
          <Countdown />
        </div>
      </div>
    </section>
  );
}
