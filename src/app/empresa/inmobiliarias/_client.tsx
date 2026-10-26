'use client';

import Link from 'next/link';
import { InmobiliariasHero } from './_hero/HeroSection';
import { RevealObserver } from '@/components/propuesta/RevealObserver';
import { SectionHead } from '@/components/propuesta/SectionHead';
import { MetricStrip } from '@/components/propuesta/MetricStrip';
import { ElasticComparacion } from '@/components/propuesta/ElasticComparacion';
import { FeatureGrid } from '@/components/propuesta/FeatureGrid';
import { PanelBand } from '@/components/propuesta/PanelBand';
import { NumberedList } from '@/components/propuesta/NumberedList';
import { SectionNav, useSectionNav } from '@/components/propuesta/SectionNav';
import AnimatedGradient from '@/components/ui/animated-gradient';
import { waUrl, WA_MSG_INMOBILIARIAS } from '../_content';
import * as d from './_content/inmobiliarias.data';
import s from '@/app/empresa/corp.module.css';

type Etapa = { desde: number; hasta: number; kicker: string; titulo: string; texto: string };
type HeroContent = { marca: string; bajada: string; indicacion_scroll: string; frames_base: string; etapas: Etapa[] };

// Estilos locales responsive de esta página, con prefijo "inm" (inmobiliarias)
// para no chocar con los "pm" (Payma) ni "pv" (Providus).
const LOCAL_CSS = `
.inmSplit{display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:start}
.inmNiveles{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--linea)}
.inmNivel{background:#050505;padding:32px 28px;display:flex;flex-direction:column;gap:18px;clip-path:polygon(14px 0,100% 0,100% calc(100% - 14px),calc(100% - 14px) 100%,0 100%,0 14px)}
.inmNivelDestacado{border-top:1px solid var(--azul);background:rgba(47,123,246,0.06)}
@media (max-width:768px){
  .propNav{overflow-x:auto!important;flex-wrap:nowrap!important;-webkit-overflow-scrolling:touch;scrollbar-width:none;padding:0 16px!important}
  .propNav::-webkit-scrollbar{display:none}
  .propNavFade{display:block!important}
  .propFeatureGrid{grid-template-columns:1fr!important}
  .inmSplit{grid-template-columns:1fr!important;gap:28px!important}
  .inmNiveles{grid-template-columns:1fr!important}
}
`;

const etiqueta: React.CSSProperties = { margin: '0 0 6px', fontFamily: 'var(--f-mono), monospace', fontSize: 10.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ceniza)' };
const textoNivel: React.CSSProperties = { margin: 0, fontFamily: 'var(--f-texto), Spectral, serif', fontSize: 14, lineHeight: 1.6, color: 'rgba(242,239,233,0.75)' };

export function InmobiliariasClient({ hero }: { hero: HeroContent }) {
  const { activeId, setRef, scrollTo } = useSectionNav();

  return (
    <>
      <RevealObserver />
      <style dangerouslySetInnerHTML={{ __html: LOCAL_CSS }} />

      <InmobiliariasHero hero={hero} framesBase={hero.frames_base} />

      <SectionNav items={d.navItems} activeId={activeId} onNavigate={scrollTo} />

      {/* ── Apertura ── */}
      <section className={s.section} style={{ textAlign: 'center', paddingTop: 80, position: 'relative', overflow: 'hidden', isolation: 'isolate' }}>
        <AnimatedGradient config={{ preset: 'Prism' }} />
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

      {/* ── 01 — Lo que pasa hoy ── */}
      <section className={s.section} ref={setRef('problema')}>
        <div className={s.inner}>
          <SectionHead {...d.sections.problema} />
          <div className={s.reveal} data-reveal=""><ElasticComparacion items={d.problemaComparacion} /></div>
        </div>
      </section>

      {/* ── 02 — Lo que construimos ── */}
      <section className={`${s.section} ${s.sectionAlt}`} ref={setRef('sistema')}>
        <div className={s.inner}>
          <SectionHead {...d.sections.sistema} />
          <FeatureGrid items={d.servicios} columns={3} />
          <PanelBand pull={d.serviciosCierre} bordered style={{ marginTop: 1 }} />
        </div>
      </section>

      {/* ── 03 — Por dónde se empieza ── */}
      <section className={s.section} ref={setRef('entrada')}>
        <div className={s.inner}>
          <SectionHead {...d.sections.entrada} />
          <div className="inmSplit">
            <PanelBand body={d.entradaBody} />
            <PanelBand items={d.entradaItems} />
          </div>
        </div>
      </section>

      {/* ── 04 — Por qué es distinto ── */}
      <section className={`${s.section} ${s.sectionAlt}`} ref={setRef('diferencia')}>
        <div className={s.inner}>
          <SectionHead {...d.sections.diferencia} />
          <NumberedList items={d.diferencias} variant="static" />
        </div>
      </section>

      {/* ── 05 — Lo que no hacemos ── */}
      <section className={s.section}>
        <div className={s.inner}>
          <SectionHead {...d.sections.noHacemos} />
          <PanelBand items={d.noHacemos} />
        </div>
      </section>

      {/* ── 06 — Inversión ── */}
      <section className={`${s.section} ${s.sectionAlt}`} ref={setRef('inversion')}>
        <div className={s.inner}>
          <SectionHead {...d.sections.inversion} />
          <div className={`${s.reveal} inmNiveles`} data-reveal="">
            {d.niveles.map((n) => (
              <div key={n.nombre} className={`inmNivel${n.nombre === 'Completo' ? ' inmNivelDestacado' : ''}`}>
                <div>
                  <p style={{ margin: '0 0 10px', fontFamily: 'var(--f-mono), monospace', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--azul)' }}>{n.nombre}</p>
                  <p style={{ margin: 0, fontFamily: 'var(--f-display), Montserrat, sans-serif', fontWeight: 900, fontSize: 24, lineHeight: 1.2, color: 'var(--azul-luz)' }}>{n.rango}</p>
                </div>
                <div><p style={etiqueta}>Para quién</p><p style={textoNivel}>{n.para}</p></div>
                <div><p style={etiqueta}>Qué incluye</p><p style={textoNivel}>{n.incluye}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 07 — Garantía ── */}
      <section className={s.section} ref={setRef('garantia')}>
        <div className={s.inner}>
          <SectionHead {...d.sections.garantia} />
          <PanelBand items={d.garantiaItems} />
          <div className={s.reveal} data-reveal="" style={{ marginTop: 28 }}>
            <p className={s.bandPull}>{d.garantiaPull}</p>
          </div>
        </div>
      </section>

      {/* ── 08 — Cómo trabajamos ── */}
      <section className={`${s.section} ${s.sectionAlt}`} ref={setRef('proceso')}>
        <div className={s.inner}>
          <SectionHead {...d.sections.proceso} />
          <NumberedList items={d.proceso} variant="accordion" />
        </div>
      </section>

      {/* ── Cierre ── */}
      <section className={s.section} style={{ textAlign: 'center' }}>
        <div className={s.inner}>
          <h2 className={s.heroTitle} style={{ margin: '0 auto 16px', maxWidth: 720 }}>{d.cierreTitulo}</h2>
          <p className={s.heroSub} style={{ maxWidth: 560, margin: '0 auto 32px' }}>{d.cierreTexto}</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a className={s.btnPrimary} href={waUrl(WA_MSG_INMOBILIARIAS)} target="_blank" rel="noopener noreferrer">{d.cierreBoton}</a>
            <Link className={s.btnGhost} href="/empresa/contacto">{d.cierreBotonSecundario}</Link>
          </div>
        </div>
      </section>
    </>
  );
}
