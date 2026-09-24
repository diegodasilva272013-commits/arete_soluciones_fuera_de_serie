import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import s from '../../corp.module.css';
import { RevealObserver } from '../../_reveal';
import { waUrl, WA_MSG_SERVICIO } from '../../_content';
import { SEO } from '../../_seo';

export const metadata: Metadata = {
  title: { absolute: SEO.softwareAMedida.title },
  description: SEO.softwareAMedida.description,
  alternates: { canonical: SEO.softwareAMedida.canonical },
};

const WA = waUrl(WA_MSG_SERVICIO);

const DIFERENCIAS = [
  { t: 'A medida', d: 'Se construye sobre cómo trabaja tu empresa. No sobre cómo trabaja una empresa genérica del mismo sector.' },
  { t: 'Sin licencias', d: 'No pagás por funcionalidades que no usás. El costo es de implementación, no de suscripción mensual indefinida.' },
  { t: 'Sin adopción forzada', d: 'El sistema se adapta al proceso existente. No al revés. El equipo no necesita cambiar cómo trabaja para poder usarlo.' },
  { t: 'Evoluciona con vos', d: 'El código es tuyo. Podemos ampliarlo, ajustarlo o traspasarlo a tu equipo técnico en cualquier momento.' },
];

const TIPOS = [
  'Sistemas de gestión comercial (pipeline, seguimiento, cierres)',
  'Tableros de gestión para dirección con indicadores reales',
  'Portales de clientes o proveedores con acceso controlado',
  'Sistemas de seguimiento de entrega y operaciones',
  'Módulos de administración: facturación, cobros, reportes',
  'Integraciones entre sistemas que no se comunican',
];

export default function SoftwareAMedidaPage() {
  return (
    <>
      <RevealObserver revealClass={s.revealOn} />

      <section className={s.pageHero}>
        <div className={s.pageHeroInner}>
          <div className={`${s.kicker} ${s.reveal}`} data-reveal="">
            <span className={s.kickerLine} />
            <span className={s.kickerLabel}>Implementación · Software</span>
          </div>
          <h1 className={`${s.heroTitle} ${s.reveal} ${s.revealDelay1}`} data-reveal="">
            Software a medida<br /><em>para empresas.</em>
          </h1>
          <p className={`${s.heroSub} ${s.reveal} ${s.revealDelay2}`} data-reveal="">
            Construimos el sistema que la empresa necesita, no el que existe en el mercado. Diseñamos sobre el proceso real y elegimos la tecnología como consecuencia del diseño.
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

      {/* ── QUÉ NOS DIFERENCIA ── */}
      <section className={`${s.section} ${s.sectionAlt}`}>
        <div className={s.inner}>
          <div className={`${s.sectionLockup} ${s.reveal}`} data-reveal="" style={{ marginBottom: 56 }}>
            <p className={s.kickerLabel} style={{ marginBottom: 14 }}>Por qué a medida</p>
            <h2 className={s.sectionTitle}>El sistema se adapta a la empresa.<br /><em>No al revés.</em></h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {DIFERENCIAS.map(d => (
              <div
                key={d.t}
                className={`${s.reveal}`}
                data-reveal=""
                style={{
                  display: 'grid',
                  gridTemplateColumns: '160px 1fr',
                  gap: 40,
                  padding: '32px 0',
                  borderTop: '1px solid rgba(242,239,233,0.07)',
                  alignItems: 'start',
                }}
              >
                <span style={{ fontWeight: 700, fontSize: 14, color: '#1a6fff' }}>{d.t}</span>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.78, color: 'rgba(242,239,233,0.55)' }}>{d.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TIPOS DE SISTEMAS ── */}
      <section className={s.section}>
        <div className={s.inner}>
          <div className={s.splitGrid}>
            <div className={`${s.reveal}`} data-reveal="">
              <div className={s.sectionLockup}>
                <p className={s.kickerLabel} style={{ marginBottom: 14 }}>Qué construimos</p>
                <h2 className={s.sectionTitle}>Sistemas que resuelven<br /><em>problemas reales.</em></h2>
                <p className={s.sectionSub}>
                  No hacemos apps genéricas ni templates. Cada sistema nace de un diagnóstico que entiende qué fricción tiene que desaparecer.
                </p>
              </div>
            </div>
            <div className={`${s.bandRight} ${s.reveal} ${s.revealDelay1}`} data-reveal="">
              <div className={s.bandPanel}>
                <span className={s.bandPanelBorder} aria-hidden="true" />
                <ul className={s.panelList}>
                  {TIPOS.map(item => (
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

      {/* ── PRECIO ── */}
      <section className={`${s.section} ${s.sectionAlt}`}>
        <div className={s.inner}>
          <div className={`${s.reveal}`} data-reveal="" style={{ maxWidth: 600 }}>
            <p className={s.kickerLabel} style={{ marginBottom: 20 }}>Inversión</p>
            <dl className={s.meta}>
              <div className={s.metaItem}>
                <dt className={s.metaDt}>Rango</dt>
                <dd className={s.metaDd}><em>USD 1.500 – 10.000</em></dd>
              </div>
              <div className={s.metaItem}>
                <dt className={s.metaDt}>Según alcance</dt>
                <dd className={s.metaDd}>de cada proyecto</dd>
              </div>
            </dl>
            <p style={{ marginTop: 24, fontSize: 13, lineHeight: 1.7, color: 'rgba(242,239,233,0.35)' }}>
              El precio se define después del diagnóstico. Nunca cotizamos software sin entender qué problema resuelve.
            </p>
          </div>
        </div>
      </section>

      <section className={s.ctaBand}>
        <div className={s.inner}>
          <div className={s.reveal} data-reveal="">
            <h2 className={s.ctaTitle}>¿Tenés un sistema<br /><em>que no funciona como debería?</em></h2>
            <p className={s.ctaSub}>Empezamos con un diagnóstico. Si hay algo para construir, lo construimos.</p>
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
