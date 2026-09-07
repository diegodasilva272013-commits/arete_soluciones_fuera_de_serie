import type { Metadata } from 'next';
import Link from 'next/link';
import s from '../corp.module.css';
import { RevealObserver } from '../_reveal';
import { MaskTitle } from '@/components/empresa/MaskTitle';
import { Track, type Etapa } from '@/components/empresa/metodologia/Track';
import { waLink } from '../constants';

export const metadata: Metadata = {
  title: 'Metodología — Areté Soluciones',
  description: 'Las seis etapas del método Areté: de la inmersión en la operación a la evolución continua del sistema.',
};

const WA = waLink('Hola, me interesa saber más sobre Areté Soluciones');

// El desarrollo completo vive acá — en el home queda solo una línea por
// etapa, para que la página interna no repita lo mismo.
const ETAPAS: Etapa[] = [
  {
    n: '01',
    title: 'Inmersión',
    duration: '1–2 semanas',
    body: 'Arrancamos hablando con quien dirige y con quien ejecuta. No con un formulario de requerimientos: con conversaciones sobre cómo funciona la empresa realmente. Lo que está escrito en el manual y lo que pasa en la práctica rara vez son lo mismo.',
    pull: 'Partimos de la empresa. No de supuestos sobre cómo debería funcionar.',
    items: ['Entrevistas con dirección y equipo', 'Observación del flujo operativo real', 'Relevamiento de herramientas actuales', 'Mapa inicial de la operación'],
  },
  {
    n: '02',
    title: 'Auditoría',
    duration: '1–2 semanas',
    body: 'Con el mapa de la operación, auditamos en profundidad cada área relevante. Identificamos los puntos de fuga: dónde se pierde información, dónde se tarda más de lo necesario, dónde el trabajo depende de una persona que no puede faltar.',
    pull: 'No hay que arreglar todo. Hay que encontrar qué es lo que más daño hace.',
    items: ['Análisis detallado por área', 'Identificación de dependencias críticas', 'Cuantificación del impacto de cada problema', 'Listado de fricciones priorizadas'],
  },
  {
    n: '03',
    title: 'Priorización',
    duration: '3–5 días',
    body: 'Pareto aplicado a la operación. No todos los problemas pesan igual. Esta etapa define qué se resuelve primero y en qué orden. El criterio no es lo que parece urgente: es lo que genera más impacto por unidad de esfuerzo.',
    pull: 'El orden de resolución importa tanto como la solución.',
    items: ['Priorización por impacto vs esfuerzo', 'Definición de quick wins de impacto inmediato', 'Hoja de ruta del proyecto', 'Presupuesto por etapa de implementación'],
  },
  {
    n: '04',
    title: 'Arquitectura',
    duration: '1–2 semanas',
    body: 'Diseñamos cómo debería funcionar la empresa. Flujos, roles, información, decisiones. Recién cuando el diseño está aprobado elegimos las herramientas: como consecuencia del diseño, no antes.',
    pull: 'La herramienta se elige al final, no al principio.',
    items: ['Diseño del flujo operativo futuro', 'Definición de roles y responsabilidades', 'Selección de herramientas según el diseño', 'Prototipo funcional para validación'],
  },
  {
    n: '05',
    title: 'Implementación',
    duration: 'Variable según proyecto',
    body: 'Construimos siguiendo el plan de prioridades. Cada entrega genera valor antes de que termine el proyecto. El equipo empieza a usar el nuevo sistema antes de que esté completo, lo que permite detectar ajustes tempranos.',
    pull: 'Cada semana de implementación tiene que producir algo que el equipo ya puede usar.',
    items: ['Construcción en sprints por área', 'Capacitación del equipo en cada entrega', 'Ajustes en tiempo real según feedback', 'Documentación del nuevo sistema'],
  },
  {
    n: '06',
    title: 'Evolución',
    duration: 'Continua post-entrega',
    body: 'El trabajo no termina en la entrega. Medimos adopción, observamos cómo usa el equipo el nuevo sistema en la práctica real, y ajustamos. La empresa cambia, el sistema tiene que poder cambiar con ella.',
    pull: 'Lo que entregamos no es un sistema terminado: es un sistema que puede mejorar.',
    items: ['Seguimiento de adopción por área', 'Métricas de uso y resultado', 'Sesiones de ajuste incluidas en los primeros 30 días', 'Protocolo de evolución a largo plazo'],
  },
];

export default function MetodologiaPage() {
  return (
    <>
      <RevealObserver revealClass={s.revealOn} />

      <section className={s.pageHero} style={{ background: 'var(--sombra)' }}>
        <div className={s.pageHeroInner}>
          <MaskTitle
            as="h1"
            trigger="load"
            className={s.heroTitle}
            lines={['Seis etapas.', <em key="e">El orden no se altera.</em>]}
          />
          <p className={`${s.heroSub} ${s.reveal} ${s.revealDelay2}`} data-reveal="">
            Empezamos entendiendo. Terminamos midiendo. Lo que hay en el medio es diseño antes que tecnología.
          </p>
          <div className={`${s.reveal} ${s.revealDelay3}`} data-reveal="" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <a href={WA} target="_blank" rel="noopener noreferrer" className={s.btn}>
              Hablar con el equipo
            </a>
            <Link href="/empresa/servicios" className={s.btnSec}>
              Ver servicios y precios
            </Link>
          </div>
        </div>
      </section>

      <Track etapas={ETAPAS} />

      <section className={`${s.quoteBand} ${s.reveal}`} data-reveal="">
        <div className={s.quoteInner}>
          <p className={s.quoteText}>
            "No empezamos con una herramienta y buscamos dónde ponerla. Empezamos con <em>la empresa</em> y diseñamos
            cómo debería funcionar."
          </p>
          <span className={s.quoteAuthor}>Areté Soluciones · Forma de trabajar</span>
        </div>
      </section>

      <section className={s.ctaBand}>
        <div className={s.inner}>
          <div className={s.reveal} data-reveal="">
            <h2 className={s.ctaTitle}>¿Tiene sentido arrancar?</h2>
            <p className={s.ctaSub}>Una conversación de 30 minutos. Sin compromiso, sin presión.</p>
            <div className={s.ctaRow}>
              <a href={WA} target="_blank" rel="noopener noreferrer" className={s.btn}>
                Agendar conversación
              </a>
              <Link href="/empresa/nosotros" className={s.btnSec}>
                Conocer el equipo
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
