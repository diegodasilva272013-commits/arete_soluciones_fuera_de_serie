'use client';

import { BombasHero } from './_hero/HeroSection';
import { RevealObserver } from '@/components/propuesta/RevealObserver';
import { PasswordGate } from '@/components/propuesta/PasswordGate';
import { SectionHead } from '@/components/propuesta/SectionHead';
import { MetricStrip } from '@/components/propuesta/MetricStrip';
import { ElasticComparacion } from '@/components/propuesta/ElasticComparacion';
import { PanelBand } from '@/components/propuesta/PanelBand';
import { ElasticSolucion, type ElasticTab } from '@/components/propuesta/ElasticSolucion';
import { NumberedList } from '@/components/propuesta/NumberedList';
import { SectionNav, useSectionNav } from '@/components/propuesta/SectionNav';
import { AcceptanceCta } from '@/components/propuesta/AcceptanceCta';
import AnimatedGradient from '@/components/ui/animated-gradient';
import { ProductosDemo } from './_productos';
import { checkPassword, notifyAcceptance } from './actions';
import * as d from './_content/bombas.data';
import s from '@/app/empresa/corp.module.css';

// Estilos locales responsive (barra de secciones en celular). Mismas clases
// que usa la propuesta de Payma.
const LOCAL_CSS = `
@media (max-width:768px){
  .propNav{overflow-x:auto!important;flex-wrap:nowrap!important;-webkit-overflow-scrolling:touch;scrollbar-width:none;padding:0 16px!important}
  .propNav::-webkit-scrollbar{display:none}
  .propNavFade{display:block!important}
}
`;

function webTabsToElastic(tabs: d.WebTabData[]): ElasticTab[] {
  return tabs.map((t) => ({
    id: t.id,
    label: t.label,
    img: t.img,
    content: <p className={s.bandBody} style={{ margin: 0, fontSize: 14 }}>{t.intro}</p>,
  }));
}

function ProposalContent() {
  const { activeId, setRef, scrollTo } = useSectionNav();
  const webTabsContent = webTabsToElastic(d.webTabs);

  return (
    <>
      <RevealObserver />
      <style dangerouslySetInnerHTML={{ __html: LOCAL_CSS }} />

      <BombasHero hero={d.hero} />

      <SectionNav items={d.navItems} activeId={activeId} onNavigate={scrollTo} />

      {/* ── Encabezado ── */}
      <section className={s.section} style={{ textAlign: 'center', paddingTop: 80, position: 'relative', overflow: 'hidden', isolation: 'isolate' }}>
        <AnimatedGradient config={{ preset: 'Prism' }} />
        <div className={s.inner}>
          <div className={`${s.kicker} ${s.reveal}`} data-reveal="" style={{ justifyContent: 'center' }}>
            <span className={s.kickerLine} />
            <span className={s.kickerLabel}>{d.kicker}</span>
          </div>
          <h1 className={s.heroTitle} style={{ margin: '0 auto 36px', maxWidth: 980 }}>
            {d.heroTitulo1}<br /><em>{d.heroTitulo2Em}</em>
          </h1>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <MetricStrip items={d.heroMetricas} style={{ maxWidth: 860 }} />
          </div>
        </div>
      </section>

      {/* ── 01 — Antes y después de la web ── */}
      <section className={s.section} ref={setRef('situacion')}>
        <div className={s.inner}>
          <SectionHead {...d.sections.situacion} />
          <div className={s.reveal} data-reveal="">
            <ElasticComparacion items={d.situacionComparacion} labelAntes={d.situacionLabelAntes} labelDespues={d.situacionLabelDespues} />
          </div>
        </div>
      </section>

      {/* ── 02 — La web ── */}
      <section className={`${s.section} ${s.sectionAlt}`} ref={setRef('web')}>
        <div className={s.inner}>
          <SectionHead {...d.sections.web} />
          <div className={s.reveal} data-reveal=""><ElasticSolucion items={webTabsContent} /></div>
          <div className={s.reveal} data-reveal="" style={{ marginTop: 64, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
            <p className={s.kickerLabel} style={{ justifyContent: 'center' }}>{d.productosDemoEyebrow}</p>
            <div style={{ width: '100%' }}><ProductosDemo /></div>
            <p className={s.bandBody} style={{ margin: 0, fontSize: 13, textAlign: 'center' }}>{d.productosDemoNota}</p>
          </div>
          <PanelBand body={d.webNotaDiseno} style={{ marginTop: 56 }} />
        </div>
      </section>

      {/* ── 03 — El panel ── */}
      <section className={s.section} ref={setRef('panel')}>
        <div className={s.inner}>
          <SectionHead {...d.sections.panel} />
          <PanelBand items={d.panelItems} />
        </div>
      </section>

      {/* ── 04 — Inversión ── */}
      <section className={`${s.section} ${s.sectionAlt}`} ref={setRef('inversion')}>
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
          <div className={s.reveal} data-reveal="" style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--linea)', marginBottom: 32 }}>
            {d.formaDePago.map((row) => (
              <div key={row.momento} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 20, padding: '16px 24px', background: '#050505', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--f-texto), Spectral, serif', fontSize: 14, color: 'rgba(242,239,233,0.75)' }}>{row.momento}</span>
                <span style={{ fontFamily: 'var(--f-mono), monospace', fontSize: 12, color: 'var(--ceniza)' }}>{row.porcentaje}</span>
                <span style={{ fontFamily: 'var(--f-mono), monospace', fontSize: 12, color: 'var(--azul-luz)', whiteSpace: 'nowrap' }}>{row.monto}</span>
              </div>
            ))}
          </div>
          <PanelBand eyebrow={d.mediosDePagoEyebrow} body={d.mediosDePago} />
        </div>
      </section>

      {/* ── 05 — Cómo lo hacemos ── */}
      <section className={s.section} ref={setRef('proceso')}>
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

export function BombasClient({ unlocked }: { unlocked: boolean }) {
  if (!unlocked) {
    return <PasswordGate title={d.nombreCliente} checkPassword={checkPassword} />;
  }
  return <ProposalContent />;
}
