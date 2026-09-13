import c from '../empresa/corp.module.css';
import { NeonMesh } from '@/components/ui/neon-mesh';

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
    <section className={c.section} style={{ position: 'relative', overflow: 'hidden' }}>

      {/* ── NeonMesh 3D de fondo — colores Areté azul ── */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          // El canvas llena el section completo
        }}
      >
        <NeonMesh />
      </div>

      {/* Gradiente superior e inferior para fundir el mesh con el negro de la página */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          background:
            'linear-gradient(to bottom, #050505 0%, transparent 14%, transparent 86%, #050505 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Contenido sobre el mesh */}
      <div className={c.inner} style={{ position: 'relative', zIndex: 2 }}>
        <div className={c.sectionLockup}>
          <span className={c.mono}>Nuestra cultura</span>
          <h2 className={c.sectionTitle}>
            Ser distinto no es un slogan acá —{' '}
            <em>es el filtro.</em>
          </h2>
          <p className={c.sectionSub}>
            El equipo que construimos define los resultados que logramos.
            El filtro es simple: consistencia real, todos los días.
          </p>
        </div>

        {/* Grid de puntos */}
        <div className={`${c.etapasGrid} ${c.revealOn}`}>
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
          className={`${c.bandPanel} ${c.revealOn}`}
          style={{
            marginTop: '32px',
            borderColor: 'rgba(239,68,68,.2)',
            background: 'rgba(239,68,68,.04)',
          }}
        >
          <div className={c.bandPanelBorder} style={{ borderColor: 'rgba(239,68,68,.15)' }} />
          <span
            className={c.mono}
            style={{ color: 'rgba(239,68,68,.7)', display: 'block', marginBottom: '20px' }}
          >
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
