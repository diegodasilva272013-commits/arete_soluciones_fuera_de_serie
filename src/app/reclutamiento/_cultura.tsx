const PUNTOS = [
  {
    title: 'Buscamos personas, no robots',
    body: 'Para lo robótico ya usamos IA. Lo que no podemos automatizar es el criterio, la persistencia y la forma real de conectar con alguien del otro lado del teléfono — eso lo pone la persona, no un script.',
  },
  {
    title: 'Más que experiencia, compromiso',
    body: 'No nos importa tanto cuánto sabés hoy — nos importa si vas a sostener el proceso todos los días, si te hacés cargo de tus resultados y si seguís cuando algo no sale a la primera.',
  },
  {
    title: 'Qué vas a hacer',
    body: 'Llamar y setear leads: contactar prospectos, calificarlos y agendar reuniones para el equipo de ventas. Trabajo de ejecución diaria, no de teoría.',
  },
];

const DESCALIFICA = [
  'No poder sostener un compromiso diario',
  'Poner excusas en vez de mostrar resultados',
  'Inconsistencia — arrancar fuerte y abandonar a la semana',
  'No querer seguir un proceso ya probado',
];

export function Cultura() {
  return (
    <section className="border-t border-brand-gold/10 bg-brand-black py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-brand-gold">
          Nuestra cultura
        </p>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-brand-text sm:text-4xl">
          Ser distinto no es un slogan acá — es el filtro.
        </h2>

        <div className="mt-14 grid gap-8 sm:grid-cols-3">
          {PUNTOS.map((p) => (
            <div key={p.title} className="rounded-2xl border border-brand-gold/10 bg-brand-surface/60 p-6">
              <h3 className="text-base font-semibold text-brand-text">{p.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-brand-muted">{p.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-red-900/30 bg-red-950/10 p-6">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-red-400">
            Esto te descalifica
          </h3>
          <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {DESCALIFICA.map((d) => (
              <li key={d} className="flex items-start gap-2.5 text-sm text-brand-muted">
                <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-red-500" />
                {d}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
