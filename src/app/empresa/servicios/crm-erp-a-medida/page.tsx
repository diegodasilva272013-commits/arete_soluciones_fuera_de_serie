import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import s from '../../corp.module.css';
import { RevealObserver } from '../../_reveal';
import { waUrl, WA_MSG_SERVICIO } from '../../_content';
import { SEO } from '../../_seo';

export const metadata: Metadata = {
  title: { absolute: SEO.crmErpAMedida.title },
  description: SEO.crmErpAMedida.description,
  alternates: { canonical: SEO.crmErpAMedida.canonical },
};

const WA = waUrl(WA_MSG_SERVICIO);

const MODULOS_CRM = [
  'Pipeline de ventas adaptado al proceso real de cierre',
  'Seguimiento de oportunidades con historial completo',
  'Asignación y rotación de leads entre el equipo',
  'Alertas y recordatorios sin depender de la memoria',
  'Tablero de métricas comerciales para dirección',
];

const MODULOS_ERP = [
  'Facturación y cobros integrados al proceso administrativo',
  'Gestión de órdenes y entrega por proyecto o cliente',
  'Control de stock o avance de servicio en tiempo real',
  'Reportes financieros sin copiar datos a mano',
  'Roles y permisos por área o función',
];

export default function CrmErpAMedidaPage() {
  return (
    <>
      <RevealObserver revealClass={s.revealOn} />

      <section className={s.pageHero}>
        <div className={s.pageHeroInner}>
          <div className={`${s.kicker} ${s.reveal}`} data-reveal="">
            <span className={s.kickerLine} />
            <span className={s.kickerLabel}>Implementación · CRM · ERP</span>
          </div>
          <h1 className={`${s.heroTitle} ${s.reveal} ${s.revealDelay1}`} data-reveal="">
            CRM y ERP a medida<br /><em>para pymes.</em>
          </h1>
          <p className={`${s.heroSub} ${s.reveal} ${s.revealDelay2}`} data-reveal="">
            Un solo sistema que conecta ventas, clientes, facturación y operación. Diseñado sobre cómo trabaja tu empresa, no sobre cómo trabaja un cliente genérico del proveedor.
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

      {/* ── POR QUÉ A MEDIDA ── */}
      <section className={s.section}>
        <div className={s.inner}>
          <div className={s.splitGrid}>
            <div className={`${s.reveal}`} data-reveal="">
              <div className={s.sectionLockup}>
                <p className={s.kickerLabel} style={{ marginBottom: 14 }}>El problema con los CRM y ERP genéricos</p>
                <h2 className={s.sectionTitle}>Sin licencias que<br /><em>no vas a usar.</em></h2>
              </div>
            </div>
            <div className={`${s.reveal} ${s.revealDelay1}`} data-reveal="">
              <p style={{ margin: '0 0 20px', fontSize: 15, lineHeight: 1.78, color: 'rgba(242,239,233,0.55)' }}>
                Los CRM y ERP genéricos están diseñados para el cliente promedio de su mercado. Si tu proceso de ventas o tu operación no encaja en ese molde, terminás pagando por un sistema que obliga a la empresa a trabajar peor para poder usarlo.
              </p>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.78, color: 'rgba(242,239,233,0.55)' }}>
                Un sistema a medida empieza por el diagnóstico: entendemos cómo trabaja la empresa de verdad y construimos sobre eso. Sin funcionalidades que nunca vas a usar. Sin licencias que se renuevan aunque el sistema no resuelva nada.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── MÓDULOS ── */}
      <section className={`${s.section} ${s.sectionAlt}`}>
        <div className={s.inner}>
          <div className={`${s.sectionLockup} ${s.reveal}`} data-reveal="" style={{ marginBottom: 56 }}>
            <p className={s.kickerLabel} style={{ marginBottom: 14 }}>Módulos habituales</p>
            <h2 className={s.sectionTitle}>CRM y ERP: dos sistemas,<br /><em>un solo criterio.</em></h2>
          </div>
          <div className={s.splitGridTight}>
            <div className={`${s.reveal}`} data-reveal="">
              <div className={s.bandPanel} style={{ height: '100%' }}>
                <span className={s.bandPanelBorder} aria-hidden="true" />
                <p style={{ margin: '0 0 20px', fontFamily: 'ui-monospace, monospace', fontSize: 9, fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#1a6fff' }}>
                  CRM · Módulo comercial
                </p>
                <ul className={s.panelList}>
                  {MODULOS_CRM.map(item => (
                    <li key={item} className={s.panelItem}>
                      <span className={s.panelDot} aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className={`${s.reveal} ${s.revealDelay1}`} data-reveal="">
              <div className={s.bandPanel} style={{ height: '100%' }}>
                <span className={s.bandPanelBorder} aria-hidden="true" />
                <p style={{ margin: '0 0 20px', fontFamily: 'ui-monospace, monospace', fontSize: 9, fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#1a6fff' }}>
                  ERP · Módulo operativo
                </p>
                <ul className={s.panelList}>
                  {MODULOS_ERP.map(item => (
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
            <h2 className={s.ctaTitle}>¿Cuánto cuesta un sistema<br /><em>que funcione de verdad?</em></h2>
            <p className={s.ctaSub}>Primero el diagnóstico, después la cotización. Sin diagnóstico no cotizamos.</p>
            <div className={s.ctaRow}>
              <a href={WA} target="_blank" rel="noopener noreferrer" className={s.btnPrimary}>
                Hablar con el equipo <ArrowRight size={15} />
              </a>
              <Link href="/empresa/servicios/diagnostico-operativo" className={s.btnGhost}>
                Ver el diagnóstico
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
