import { Spotlight } from '@/components/ui/spotlight';
import { Countdown } from './_countdown';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-brand-black px-5 pb-16 pt-24 sm:pt-32">
      <Spotlight className="-top-40 left-1/2 -translate-x-1/2" size={480} />

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-gold">
          Reclutamiento — Setters &amp; Cold Callers
        </p>
        <h1 className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight text-brand-text sm:text-6xl">
          Buscamos gente que{' '}
          <span className="bg-gold-gradient bg-clip-text text-transparent">levante el teléfono</span>
          , no que lo tema.
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-brand-muted sm:text-lg">
          Sumate al equipo para llamar y setear leads. No buscamos el currículum perfecto —
          buscamos compromiso real, todos los días.
        </p>

        <a
          href="#postularme"
          className="mt-9 inline-flex items-center justify-center rounded-xl bg-brand-gold px-8 py-3.5 text-sm font-semibold text-white shadow-gold transition hover:bg-brand-goldSoft"
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
