import c from '../empresa/corp.module.css';

const PUNTOS = [
  {
    n: '01',
    title: 'Buscamos personas, no robots',
    body: 'Para lo robótico ya usamos IA. Lo que no podemos automatizar es el criterio, la persistencia y la forma real de conectar con alguien del otro lado del teléfono — eso lo pone la persona, no un script.',
  },
  {
    n: '02',
    title: 'Más que experiencia, compromiso',
    body: 'No nos importa tanto cuánto sabés hoy — nos importa si vas a sostener el proceso todos los días, si te hacés cargo de tus resultados y si seguís cuando algo no sale a la primera.',
  },
  {
    n: '03',
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
    <section className={c.section}>
      <div className={c.inner}>
        <div className={c.sectionLockup}>
          <span className={c.mono}>Nuestra cultura</span>
          <h2 className={c.sectionTitle}>
            Ser distinto no es un slogan acá —{' '}
            <em>es el filtro.</em>
          </h2>
          <p className={c.sectionSub}>
            El equipo que construimos define los resultados que logramos. El filtro es simple: consistencia real, todos los días.
          </p>
        </div>

        {/* Grid de puntos */}
        <div className={c.etapasGrid}>
          {PUNTOS.map((p) => (
            <div key={p.n} className={c.etapa}>
              <div className={c.etapaN}>{p.n}</div>
              <h3 className={c.etapaTitle}>{p.title}</h3>
              <p className={c.etapaBody}>{p.body}</p>
            </div>
          ))}
        </div>

        {/* Descalifica */}
        <div
          className={c.bandPanel}
          style={{
            marginTop: '32px',
            borderColor: 'rgba(239,68,68,.2)',
            background: 'rgba(239,68,68,.04)',
          }}
        >
          <div className={c.bandPanelBorder} style={{ borderColor: 'rgba(239,68,68,.15)' }} />
          <span className={c.mono} style={{ color: 'rgba(239,68,68,.7)', display: 'block', marginBottom: '20px' }}>
            Esto te descalifica
          </span>
          <ul className={c.panelList}>
            {DESCALIFICA.map((d) => (
              <li key={d} className={c.panelItem}>
                <span className={c.panelDot} style={{ background: 'rgba(239,68,68,.6)' }} />
                {d}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
