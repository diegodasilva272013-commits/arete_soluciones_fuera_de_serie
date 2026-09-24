import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import s from '../../corp.module.css';
import { RevealObserver } from '../../_reveal';
import { waUrl, WA_MSG_SERVICIO } from '../../_content';
import { SEO } from '../../_seo';

export const metadata: Metadata = {
  title: { absolute: SEO.automatizacion.title },
  description: SEO.automatizacion.description,
  alternates: { canonical: SEO.automatizacion.canonical },
};

const WA = waUrl(WA_MSG_SERVICIO);

const CUANDO_AUTOMATIZAR = [
  { t: 'El proceso está claro', d: 'Automatizar un proceso mal definido solo produce errores más rápido. Primero diseñamos, después automatizamos.' },
  { t: 'El volumen lo justifica', d: 'Una tarea que se hace tres veces por semana no necesita automatización. Una que se repite 50 veces por día, sí.' },
  { t: 'Hay un costo real', d: 'Tiempo del equipo, errores frecuentes, información que se pierde. La automatización tiene que generar un retorno medible.' },
];

const EJEMPLOS = [
  'Envío automático de propuestas, recordatorios y seguimientos de cobro',
  'Sincronización entre sistemas que no se hablan (CRM, facturación, logística)',
  'Carga automática de datos desde formularios o emails al sistema interno',
  'Notificaciones al equipo cuando un estado cambia o vence un plazo',
  'Generación automática de reportes diarios o semanales para dirección',
  'Asignación automática de tareas por reglas de negocio del proceso real',
];

export default function AutomatizacionDeProcesosPage() {
  return (
    <>
      <RevealObserver revealClass={s.revealOn} />

      <section className={s.pageHero}>
        <div className={s.pageHeroInner}>
          <div className={`${s.kicker} ${s.reveal}`} data-reveal="">
            <span className={s.kickerLine} />
            <span className={s.kickerLabel}>Implementación · Automatización</span>
          </div>
          <h1 className={`${s.heroTitle} ${s.reveal} ${s.revealDelay1}`} data-reveal="">
            Automatización de procesos<br /><em>para empresas.</em>
          </h1>
          <p className={`${s.heroSub} ${s.reveal} ${s.revealDelay2}`} data-reveal="">
            Automatizamos las tareas repetitivas que consumen tiempo del equipo e integramos los sistemas que no se hablan. Pero primero nos aseguramos de que el proceso valga la pena automatizar.
          </p>
          <div className={`${s.reveal} ${s.revealDelay3}`} data-reveal="" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <a href={WA} target="_blank" rel="noopener noreferrer" className={s.btnPrimary}>
              Consultar <ArrowRight size={14} />
            </a>
            <Link href="/empresa/servicios" className={s.btnGhost}>
              Ver todos los servicios
            </Link>
          </div>
        </div>
      </section>

      {/* ── CUÁNDO AUTOMATIZAR ── */}
      <section className={`${s.section} ${s.sectionAlt}`}>
        <div className={s.inner}>
          <div className={`${s.sectionLockup} ${s.reveal}`} data-reveal="" style={{ marginBottom: 56 }}>
            <p className={s.kickerLabel} style={{ marginBottom: 14 }}>El criterio</p>
            <h2 className={s.sectionTitle}>Primero simplificar.<br /><em>Después automatizar.</em></h2>
            <p className={s.sectionSub}>
              Automatizar un proceso malo produce errores a mayor velocidad. El diagnóstico define qué se simplifica antes y qué se automatiza después.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {CUANDO_AUTOMATIZAR.map(c => (
              <div
                key={c.t}
                className={`${s.reveal}`}
                data-reveal=""
                style={{
                  display: 'grid',
                  gridTemplateColumns: '180px 1fr',
                  gap: 40,
                  padding: '32px 0',
                  borderTop: '1px solid rgba(242,239,233,0.07)',
                  alignItems: 'start',
                }}
              >
                <span style={{ fontWeight: 700, fontSize: 14, color: '#1a6fff' }}>{c.t}</span>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.78, color: 'rgba(242,239,233,0.55)' }}>{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EJEMPLOS ── */}
      <section className={s.section}>
        <div className={s.inner}>
          <div className={s.splitGrid}>
            <div className={`${s.reveal}`} data-reveal="">
              <div className={s.sectionLockup}>
                <p className={s.kickerLabel} style={{ marginBottom: 14 }}>Qué automatizamos</p>
                <h2 className={s.sectionTitle}>Tareas repetitivas<br /><em>con alto costo operativo.</em></h2>
              </div>
            </div>
            <div className={`${s.bandRight} ${s.reveal} ${s.revealDelay1}`} data-reveal="">
              <div className={s.bandPanel}>
                <span className={s.bandPanelBorder} aria-hidden="true" />
                <ul className={s.panelList}>
                  {EJEMPLOS.map(item => (
                    <li key={item} className={s.panelItem}>
                      <span className={s.panelDot} aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={s.ctaBand}>
        <div className={s.inner}>
          <div className={s.reveal} data-reveal="">
            <h2 className={s.ctaTitle}>¿Hay procesos en tu empresa<br /><em>que todavía dependen de alguien?</em></h2>
            <p className={s.ctaSub}>Si una persona se va y el proceso se frena, ese proceso tiene solución.</p>
            <div className={s.ctaRow}>
              <a href={WA} target="_blank" rel="noopener noreferrer" className={s.btnPrimary}>
                Hablar con el equipo <ArrowRight size={15} />
              </a>
              <Link href="/empresa/servicios/diagnostico-operativo" className={s.btnGhost}>
                Ver el diagnóstico primero
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
