import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import s from '@/app/empresa/corp.module.css';
import { RevealObserver } from '@/app/empresa/_reveal';
import { waUrl, WA_MSG_GENERAL } from '@/app/empresa/_content';
import { SEO_FDS } from '@/app/empresa/_seo';

export const metadata: Metadata = {
  title: { absolute: SEO_FDS.capacitacionEquipos.title },
  description: SEO_FDS.capacitacionEquipos.description,
  alternates: { canonical: SEO_FDS.capacitacionEquipos.canonical },
};

const WA = waUrl(WA_MSG_GENERAL);

const PROCESO = [
  { n: '01', t: 'Diagnóstico del equipo', d: 'Escuchamos conversaciones reales del equipo. Detectamos patrones: qué funciona, qué se repite como error y dónde se está dejando valor sobre la mesa.' },
  { n: '02', t: 'Diseño del programa', d: 'Armamos el programa sobre lo que encontramos en el diagnóstico. No hay un temario genérico: cada programa se construye sobre la realidad del equipo.' },
  { n: '03', t: 'Entrenamiento en vivo', d: 'Trabajamos sobre las llamadas y conversaciones reales del equipo. Analizamos, simulamos y corregimos en tiempo real.' },
  { n: '04', t: 'Seguimiento por persona', d: 'Medimos el progreso individual. Cada corrección queda registrada como evidencia. El seguimiento no es subjetivo.' },
];

const PARA_QUIEN = [
  'Empresas con equipo comercial establecido que quieren subir el nivel',
  'Equipos que tienen conversaciones pero no están convirtiendo lo suficiente',
  'Organizaciones que quieren estandarizar el criterio comercial de toda el área',
  'Empresas con rotación alta que necesitan un sistema de entrenamiento reproducible',
];

export default function CapacitacionEquiposPage() {
  return (
    <>
      <RevealObserver revealClass={s.revealOn} />

      <section className={s.pageHero}>
        <div className={s.pageHeroInner}>
          <div className={`${s.kicker} ${s.reveal}`} data-reveal="">
            <span className={s.kickerLine} />
            <span className={s.kickerLabel}>Fuera de Serie · Para empresas</span>
          </div>
          <h1 className={`${s.heroTitle} ${s.reveal} ${s.revealDelay1}`} data-reveal="">
            Capacitación de equipos<br /><em>de venta para empresas.</em>
          </h1>
          <p className={`${s.heroSub} ${s.reveal} ${s.revealDelay2}`} data-reveal="">
            Entrenamos a tu equipo comercial sobre sus propias llamadas reales. No sobre scripts genéricos: sobre las conversaciones que ya están teniendo con tus prospectos.
          </p>
          <div className={`${s.reveal} ${s.revealDelay3}`} data-reveal="" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <a href={WA} target="_blank" rel="noopener noreferrer" className={s.btnPrimary}>
              Consultar <ArrowRight size={14} />
            </a>
            <Link href="/fuera-de-serie" className={s.btnGhost}>
              Ver todas las líneas
            </Link>
          </div>
        </div>
      </section>

      {/* ── PROCESO ── */}
      <section className={`${s.section} ${s.sectionAlt}`}>
        <div className={s.inner}>
          <div className={`${s.sectionLockup} ${s.reveal}`} data-reveal="" style={{ marginBottom: 56 }}>
            <p className={s.kickerLabel} style={{ marginBottom: 14 }}>Cómo trabajamos</p>
            <h2 className={s.sectionTitle}>Sobre las conversaciones<br /><em>que ya están pasando.</em></h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {PROCESO.map(p => (
              <div
                key={p.n}
                className={`${s.reveal}`}
                data-reveal=""
                style={{
                  display: 'grid',
                  gridTemplateColumns: '80px 1fr',
                  gap: 40,
                  padding: '36px 0',
                  borderTop: '1px solid rgba(242,239,233,0.07)',
                  alignItems: 'start',
                }}
              >
                <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 10, fontWeight: 700, letterSpacing: '0.28em', color: 'rgba(26,111,255,0.5)' }}>{p.n}</span>
                <div>
                  <h3 style={{ margin: '0 0 10px', fontWeight: 700, fontSize: 16, color: '#f2efe9' }}>{p.t}</h3>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.78, color: 'rgba(242,239,233,0.5)' }}>{p.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PARA QUIÉN ── */}
      <section className={s.section}>
        <div className={s.inner}>
          <div className={s.splitGrid}>
            <div className={`${s.reveal}`} data-reveal="">
              <div className={s.sectionLockup}>
                <p className={s.kickerLabel} style={{ marginBottom: 14 }}>Para quién tiene sentido</p>
                <h2 className={s.sectionTitle}>Empresas con equipo<br /><em>que quiere mejorar.</em></h2>
              </div>
            </div>
            <div className={`${s.bandRight} ${s.reveal} ${s.revealDelay1}`} data-reveal="">
              <div className={s.bandPanel}>
                <span className={s.bandPanelBorder} aria-hidden="true" />
                <ul className={s.panelList}>
                  {PARA_QUIEN.map(item => (
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
            <h2 className={s.ctaTitle}>¿Tiene sentido para<br /><em>tu equipo?</em></h2>
            <p className={s.ctaSub}>Una conversación de 20 minutos para entender qué nivel tiene el equipo y qué se puede mejorar.</p>
            <div className={s.ctaRow}>
              <a href={WA} target="_blank" rel="noopener noreferrer" className={s.btnPrimary}>
                Hablar con el equipo <ArrowRight size={15} />
              </a>
              <Link href="/fuera-de-serie/programa-venta-consultiva" className={s.btnGhost}>
                Ver el programa individual
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
