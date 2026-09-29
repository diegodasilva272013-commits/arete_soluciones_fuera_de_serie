'use client';

import { HeroSection } from './_hero/HeroSection';
import { RevealObserver } from '@/components/propuesta/RevealObserver';
import { PasswordGate } from '@/components/propuesta/PasswordGate';
import { SectionHead } from '@/components/propuesta/SectionHead';
import { MetricStrip } from '@/components/propuesta/MetricStrip';
import { ElasticComparacion } from '@/components/propuesta/ElasticComparacion';
import { FeatureGrid } from '@/components/propuesta/FeatureGrid';
import { PanelBand } from '@/components/propuesta/PanelBand';
import { ElasticSolucion, type ElasticTab } from '@/components/propuesta/ElasticSolucion';
import { NumberedList } from '@/components/propuesta/NumberedList';
import { SectionNav, useSectionNav } from '@/components/propuesta/SectionNav';
import { AcceptanceCta } from '@/components/propuesta/AcceptanceCta';
import { AgentCard } from '@/components/propuesta/AgentCard';
import { checkPassword, notifyAcceptance } from './actions';
import * as d from './_content/payma.data';
import s from '@/app/empresa/corp.module.css';

type Etapa = { desde: number; hasta: number; kicker: string; titulo: string; texto: string };
type HeroContent = { marca: string; bajada: string; indicacion_scroll: string; etapas: Etapa[] };

// Estilos locales responsive de esta página, con prefijo "pm" (Payma) para
// no chocar con los "pv"/"p-" de la propuesta de Providus si ambas páginas
// coexisten en el mismo bundle del cliente.
const LOCAL_CSS = `
.pmGrid3{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--linea)}
.pmSplit{display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:start}
.pmFlow{display:flex;gap:1px;background:var(--linea)}
@media (max-width:768px){
  .propNav{overflow-x:auto!important;flex-wrap:nowrap!important;-webkit-overflow-scrolling:touch;scrollbar-width:none;padding:0 16px!important}
  .propNav::-webkit-scrollbar{display:none}
  .propNavFade{display:block!important}
  .propFeatureGrid{grid-template-columns:1fr!important}
  .pmGrid3{grid-template-columns:1fr!important}
  .pmSplit{grid-template-columns:1fr!important;gap:28px!important}
  .pmFlow{flex-direction:column!important}
}
`;

function webTabsToElastic(tabs: d.WebTabData[]): ElasticTab[] {
  return tabs.map((t) => ({
    id: t.id,
    label: t.label,
    content: (
      <>
        {t.intro && <p className={s.bandBody} style={{ margin: 0, fontSize: 14 }}>{t.intro}</p>}
        {t.items && (
          <ul className={s.panelList} style={{ padding: 0, margin: 0 }}>
            {t.items.map((item) => <li key={item} className={s.panelItem}><span className={s.panelDot} aria-hidden="true" />{item}</li>)}
          </ul>
        )}
      </>
    ),
  }));
}

function ProposalContent({ hero }: { hero: HeroContent }) {
  const { activeId, setRef, scrollTo } = useSectionNav();
  const webTabsContent = webTabsToElastic(d.webTabs);

  return (
    <>
      <RevealObserver />
      <style dangerouslySetInnerHTML={{ __html: LOCAL_CSS }} />

      <HeroSection hero={hero} />

      <SectionNav items={d.navItems} activeId={activeId} onNavigate={scrollTo} />

      {/* ── Apertura ── */}
      <section className={s.section} style={{ textAlign: 'center', paddingTop: 80 }}>
        <div className={s.inner}>
          <div className={`${s.kicker} ${s.reveal}`} data-reveal="" style={{ justifyContent: 'center' }}>
            <span className={s.kickerLine} />
            <span className={s.kickerLabel}>{d.kicker}</span>
          </div>
          <h1 className={s.heroTitle} style={{ margin: '0 auto 20px', maxWidth: 720 }}>
            {d.heroTitulo1}<br /><em>{d.heroTitulo2Em}</em>
          </h1>
          <p className={s.heroSub} style={{ maxWidth: 640, margin: '0 auto 36px' }}>{d.heroSub}</p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <MetricStrip items={d.heroMetricas} />
          </div>
        </div>
      </section>

      {/* ── 01 — La situación que resuelve ── */}
      <section className={s.section} ref={setRef('situacion')}>
        <div className={s.inner}>
          <SectionHead {...d.sections.situacion} />
          <div className={s.reveal} data-reveal=""><ElasticComparacion items={d.situacionComparacion} /></div>
        </div>
      </section>

      {/* ── 02 — La decisión de arquitectura ── */}
      <section className={`${s.section} ${s.sectionAlt}`} ref={setRef('sistema')}>
        <div className={s.inner}>
          <SectionHead {...d.sections.sistema} />
          <FeatureGrid items={d.arquitecturaCaras} />
          <PanelBand eyebrow={d.nucleoEyebrow} body={d.nucleoBody} items={d.nucleoItems} bordered style={{ marginTop: 1 }} />
        </div>
      </section>

      {/* ── 03 — La web de propiedades ── */}
      <section className={s.section} ref={setRef('web')}>
        <div className={s.inner}>
          <SectionHead {...d.sections.web} />
          <div className={s.reveal} data-reveal=""><ElasticSolucion items={webTabsContent} /></div>
        </div>
      </section>

      {/* ── 04 — El panel de Payma ── */}
      <section className={`${s.section} ${s.sectionAlt}`} ref={setRef('panel')}>
        <div className={s.inner}>
          <SectionHead {...d.sections.panel} />
          <div className="pmSplit">
            <PanelBand pull={d.panelPull} />
            <PanelBand items={d.panelItems} />
          </div>
        </div>
      </section>

      {/* ── 05 — Los tres agentes ── */}
      <section className={s.section} ref={setRef('agentes')}>
        <div className={s.inner}>
          <SectionHead {...d.sections.agentes} />
          <div className={`${s.reveal} pmGrid3`} data-reveal="" style={{ marginBottom: 1 }}>
            {d.agentesColumnas.map((col) => (
              <div key={col.titulo} style={{ background: '#050505', padding: '28px 26px' }}>
                <h3 style={{ margin: '0 0 16px', fontFamily: 'var(--f-display), Montserrat, sans-serif', fontWeight: 700, fontSize: 16, color: 'var(--hueso)' }}>{col.titulo}</h3>
                <ul className={s.panelList} style={{ padding: 0 }}>
                  {col.items.map((item) => <li key={item} className={s.panelItem}><span className={s.panelDot} aria-hidden="true" />{item}</li>)}
                </ul>
              </div>
            ))}
          </div>
          <PanelBand body={d.agentesTraspaso} style={{ marginBottom: 32 }} />
          <PanelBand eyebrow={d.agentesComoSeControla} items={d.agentesLimites} bordered />
          <div style={{ marginTop: 48 }}>
            <p className={s.kickerLabel} style={{ textAlign: 'center', justifyContent: 'center', marginBottom: 20 }}>{d.agentePruebaEyebrow}</p>
            <AgentCard agent={d.agentePrueba} />
          </div>
        </div>
      </section>

      {/* ── 06 — Emergencias 24/7 ── */}
      <section className={`${s.section} ${s.sectionAlt}`} ref={setRef('emergencias')}>
        <div className={s.inner}>
          <SectionHead {...d.sections.emergencias} />
          <div className={`${s.reveal} pmFlow`} data-reveal="" style={{ marginBottom: 40 }}>
            {d.emergenciasPasos.map((paso, i) => (
              <div key={paso} style={{ flex: 1, background: '#050505', padding: '24px 20px', textAlign: 'center' }}>
                <span style={{ display: 'inline-block', marginBottom: 12, fontFamily: 'var(--f-mono), monospace', fontSize: 11, letterSpacing: '0.18em', color: 'var(--azul)' }}>{String(i + 1).padStart(2, '0')}</span>
                <p style={{ margin: 0, fontFamily: 'var(--f-texto), Spectral, serif', fontSize: 13.5, lineHeight: 1.55, color: 'rgba(242,239,233,0.75)' }}>{paso}</p>
              </div>
            ))}
          </div>
          <PanelBand items={d.emergenciasItems} />
        </div>
      </section>

      {/* ── 07 — Incluido sin cargo ── */}
      <section className={s.section}>
        <div className={s.inner}>
          <SectionHead {...d.sections.ficha} />
          <PanelBand body={d.fichaBody} />
        </div>
      </section>

      {/* ── 08 — El sistema es de Payma ── */}
      <section className={`${s.section} ${s.sectionAlt}`}>
        <div className={s.inner}>
          <SectionHead {...d.sections.libertad} />
          <PanelBand body={d.libertadBody} items={d.libertadItems} />
          <div className={s.reveal} data-reveal="" style={{ marginTop: 28 }}>
            <p className={s.bandNum} style={{ color: 'var(--azul)' }}>{d.libertadCosto}</p>
            <p className={s.bandPull}>{d.libertadPull}</p>
          </div>
        </div>
      </section>

      {/* ── 09 — Inversión ── */}
      <section className={s.section} ref={setRef('inversion')}>
        <div className={s.inner}>
          <SectionHead {...d.sections.inversion} />
          <div className={s.reveal} data-reveal="" style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--linea)', marginBottom: 24 }}>
            {d.inversionConceptos.map((row) => (
              <div key={row.concepto} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, padding: '16px 24px', background: '#050505' }}>
                <span style={{ fontFamily: 'var(--f-texto), Spectral, serif', fontSize: 14, color: 'rgba(242,239,233,0.75)' }}>{row.concepto}</span>
                <span style={{ fontFamily: 'var(--f-mono), monospace', fontSize: 12, color: 'var(--azul-luz)', whiteSpace: 'nowrap' }}>{row.monto}</span>
              </div>
            ))}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, padding: '22px 24px', background: 'rgba(47,123,246,0.06)', borderTop: '1px solid var(--azul)' }}>
              <span style={{ fontFamily: 'var(--f-display), Montserrat, sans-serif', fontWeight: 800, fontSize: 17, color: 'var(--hueso)' }}>{d.inversionTotal.concepto}</span>
              <span style={{ fontFamily: 'var(--f-display), Montserrat, sans-serif', fontWeight: 900, fontSize: 22, color: 'var(--azul-luz)', whiteSpace: 'nowrap' }}>{d.inversionTotal.monto}</span>
            </div>
          </div>
          <p className={s.bandNum} style={{ color: 'var(--azul)' }}>{d.formaDePagoEyebrow}</p>
          <div className={s.reveal} data-reveal="" style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--linea)' }}>
            {d.formaDePago.map((row) => (
              <div key={row.momento} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 20, padding: '16px 24px', background: '#050505', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--f-texto), Spectral, serif', fontSize: 14, color: 'rgba(242,239,233,0.75)' }}>{row.momento}</span>
                <span style={{ fontFamily: 'var(--f-mono), monospace', fontSize: 12, color: 'var(--ceniza)' }}>{row.porcentaje}</span>
                <span style={{ fontFamily: 'var(--f-mono), monospace', fontSize: 12, color: 'var(--azul-luz)', whiteSpace: 'nowrap' }}>{row.monto}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 10 — Proceso ── */}
      <section className={`${s.section} ${s.sectionAlt}`} ref={setRef('proceso')}>
        <div className={s.inner}>
          <SectionHead {...d.sections.proceso} />
          <div style={{ marginBottom: 56 }}>
            <NumberedList items={d.procesoEtapas} variant="accordion" />
          </div>
          <div className={`${s.sectionLockup} ${s.reveal}`} data-reveal="" style={{ marginBottom: 32 }}>
            <p className={s.kickerLabel} style={{ marginBottom: 14 }}>{d.necesitamosEyebrow}</p>
          </div>
          <NumberedList items={d.necesitamos} variant="static" />
        </div>
      </section>

      {/* ── Cierre ── */}
      <AcceptanceCta
        title={d.cierreTitulo}
        sub={d.cierreTexto}
        buttonLabel={d.cierreBotonLabel}
        notifyAcceptance={notifyAcceptance}
      />

      <footer style={{ padding: '40px 16px 56px', textAlign: 'center', fontFamily: 'var(--f-mono), monospace', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ceniza)' }}>
        {d.footerText}
      </footer>
    </>
  );
}

export function PaymaClient({ hero, unlocked }: { hero: HeroContent; unlocked: boolean }) {
  if (!unlocked) {
    return <PasswordGate title={d.nombreCliente} checkPassword={checkPassword} />;
  }
  return <ProposalContent hero={hero} />;
}
