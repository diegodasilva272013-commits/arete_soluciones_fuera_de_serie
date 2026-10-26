'use client';

import { RevealObserver } from '@/components/propuesta/RevealObserver';
import { SectionHead } from '@/components/propuesta/SectionHead';
import { PanelBand } from '@/components/propuesta/PanelBand';
import AnimatedGradient from '@/components/ui/animated-gradient';
import * as d from './_content/flota.data';
import s from '@/app/empresa/corp.module.css';

// Estilos locales responsive, con prefijo "fl" (flota) para no chocar con los de otras propuestas.
const LOCAL_CSS = `
.flFull{min-height:calc(100svh - 68px);display:flex;align-items:center}
.flFull>.flInner{width:100%}
.flGrid3{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--linea)}
.flSplit{display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:start}
.flTabla{display:grid;grid-template-columns:1.25fr 1fr 1fr;gap:1px;background:var(--linea)}
@media (max-width:768px){
  .flGrid3{grid-template-columns:1fr!important}
  .flSplit{grid-template-columns:1fr!important;gap:28px!important}
  .flTabla{grid-template-columns:1.1fr 1fr 1fr!important}
  .flCelda{padding:12px 10px!important;font-size:12.5px!important}
  .flPortadaLogos{flex-direction:column!important;gap:20px!important}
}
`;

const BISEL = 'polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)';
const mono = (extra: React.CSSProperties = {}): React.CSSProperties => ({ fontFamily: 'var(--f-mono), monospace', ...extra });
const texto = (extra: React.CSSProperties = {}): React.CSSProperties => ({ fontFamily: 'var(--f-texto), Spectral, serif', ...extra });
const display = (extra: React.CSSProperties = {}): React.CSSProperties => ({ fontFamily: 'var(--f-display), Montserrat, sans-serif', ...extra });

function Celda({ children, cab, fuerte, azul }: { children: React.ReactNode; cab?: boolean; fuerte?: boolean; azul?: boolean }) {
  return (
    <div
      className="flCelda"
      style={{
        background: fuerte ? 'rgba(47,123,246,0.08)' : '#050505',
        padding: '16px 20px',
        fontSize: cab ? 11 : 14,
        letterSpacing: cab ? '0.18em' : undefined,
        textTransform: cab ? 'uppercase' : undefined,
        fontWeight: fuerte ? 800 : 400,
        color: cab ? 'var(--azul)' : azul ? 'var(--azul-luz)' : fuerte ? 'var(--hueso)' : 'rgba(242,239,233,0.78)',
        ...(cab ? mono() : texto()),
        ...(fuerte ? display({ fontSize: 15 }) : {}),
      }}
    >
      {children}
    </div>
  );
}

export function FlotaClient() {
  return (
    <>
      <RevealObserver />
      <style dangerouslySetInnerHTML={{ __html: LOCAL_CSS }} />

      {/* ── 1. Portada ── */}
      <section className={`${s.section} flFull`} style={{ textAlign: 'center', position: 'relative', overflow: 'hidden', isolation: 'isolate' }}>
        <AnimatedGradient config={{ preset: 'Prism' }} />
        <div className={`${s.inner} flInner`}>
          <div className="flPortadaLogos" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 36, marginBottom: 44 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/propuesta-flota/panamericano-logo.png" alt="Panamericano de Jujuy" style={{ height: 64, width: 'auto', maxWidth: '80vw' }} />
            <span style={mono({ fontSize: 14, color: 'var(--ceniza)' })} aria-hidden="true">×</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/LOGO_ARETE.png" alt="" width={48} height={48} style={{ objectFit: 'contain' }} />
              <span style={display({ fontWeight: 700, fontSize: 18, color: 'var(--hueso)' })}>{d.marcaAreteLabel}</span>
            </span>
          </div>
          <div className={`${s.kicker} ${s.reveal}`} data-reveal="" style={{ justifyContent: 'center' }}>
            <span className={s.kickerLine} />
            <span className={s.kickerLabel}>{d.kicker}</span>
          </div>
          <h1 className={s.heroTitle} style={{ margin: '0 auto 24px', maxWidth: 820 }}>{d.portadaTitulo}</h1>
          <p className={s.heroSub} style={{ maxWidth: 680, margin: '0 auto' }}>{d.portadaBajada}</p>
        </div>
      </section>

      {/* ── 2. La situación ── */}
      <section className={`${s.section} ${s.sectionAlt} flFull`}>
        <div className={`${s.inner} flInner`}>
          <SectionHead {...d.sections.situacion} />
          <p className={s.kickerLabel} style={{ marginBottom: 20 }}>{d.situacionEyebrow}</p>
          <div className={`${s.reveal} flGrid3`} data-reveal="">
            {d.situacionTarjetas.map((c) => (
              <div key={c.t} style={{ background: '#050505', padding: '32px 28px', clipPath: BISEL }}>
                <h3 style={display({ margin: '0 0 12px', fontWeight: 800, fontSize: 20, lineHeight: 1.25, color: 'var(--hueso)' })}>{c.t}</h3>
                <p style={texto({ margin: 0, fontSize: 15, lineHeight: 1.6, color: 'rgba(242,239,233,0.75)' })}>{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Qué incluye ── */}
      <section className={`${s.section} flFull`}>
        <div className={`${s.inner} flInner`}>
          <SectionHead {...d.sections.incluye} />
          <div className="flSplit">
            <PanelBand eyebrow={d.webTitulo} items={d.webItems} bordered />
            <PanelBand eyebrow={d.flotaTitulo} items={d.flotaItems} bordered />
          </div>
        </div>
      </section>

      {/* ── 4. Equipos e inversión ── */}
      <section className={`${s.section} ${s.sectionAlt} flFull`}>
        <div className={`${s.inner} flInner`}>
          <SectionHead {...d.sections.inversion} />
          <div className="flSplit">
            <div>
              <PanelBand eyebrow={d.equiposTitulo} items={d.equiposItems} bordered />
              <p style={texto({ margin: '20px 0 0', fontSize: 14, lineHeight: 1.6, color: 'var(--ceniza)' })}>{d.equiposReferencias}</p>
            </div>
            <div>
              <p className={s.kickerLabel} style={{ marginBottom: 16 }}>{d.inversionTitulo}</p>
              <div className={s.reveal} data-reveal="" style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--linea)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, padding: '16px 22px', background: '#050505' }}>
                  <span style={texto({ fontSize: 14, color: 'rgba(242,239,233,0.75)' })}>{d.inversionWeb.concepto}</span>
                  <span style={mono({ fontSize: 13, color: 'var(--azul-luz)', whiteSpace: 'nowrap' })}>{d.inversionWeb.monto}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, padding: '16px 22px', background: '#050505', alignItems: 'center' }}>
                  <span style={texto({ fontSize: 14, color: 'rgba(242,239,233,0.75)' })}>
                    {d.inversionFlota.concepto}
                    <span style={mono({ display: 'block', marginTop: 4, fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ceniza)' })}>{d.inversionFlota.etiqueta}</span>
                  </span>
                  <span style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <s style={mono({ fontSize: 12, color: 'var(--ceniza)', marginRight: 10 })}>{d.inversionFlota.montoTachado}</s>
                    <strong style={mono({ fontSize: 14, fontWeight: 500, color: 'var(--azul-luz)' })}>{d.inversionFlota.monto}</strong>
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, padding: '22px', background: 'rgba(47,123,246,0.06)', borderTop: '1px solid var(--azul)', alignItems: 'center' }}>
                  <span style={display({ fontWeight: 800, fontSize: 17, color: 'var(--hueso)' })}>{d.inversionTotal.concepto}</span>
                  <span style={display({ fontWeight: 900, fontSize: 28, color: 'var(--azul-luz)', whiteSpace: 'nowrap' })}>{d.inversionTotal.monto}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'var(--linea)' }}>
                  {d.inversionPagos.map((p) => (
                    <div key={p.momento} style={{ background: '#050505', padding: '16px 22px', textAlign: 'center' }}>
                      <p style={display({ margin: 0, fontWeight: 900, fontSize: 22, color: 'var(--hueso)' })}>{p.porcentaje}</p>
                      <p style={mono({ margin: '4px 0 0', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ceniza)' })}>{p.momento}</p>
                    </div>
                  ))}
                </div>
              </div>
              <p style={texto({ margin: '20px 0 0', fontSize: 14.5, lineHeight: 1.6, color: 'rgba(242,239,233,0.8)' })}>{d.inversionAbono}</p>
              <p style={texto({ margin: '14px 0 0', fontSize: 12.5, lineHeight: 1.55, fontStyle: 'italic', color: 'var(--ceniza)' })}>{d.inversionLetraChica}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Comparación y cierre ── */}
      <section className={`${s.section} flFull`}>
        <div className={`${s.inner} flInner`}>
          <SectionHead {...d.sections.comparacion} />
          <div className={`${s.reveal} flTabla`} data-reveal="" role="table" aria-label="Comparación mensual">
            {d.comparacionColumnas.map((c, i) => <Celda key={i} cab>{c}</Celda>)}
            {d.comparacionFilas.map((f) => (
              <div key={f.concepto} style={{ display: 'contents' }} role="row">
                <Celda fuerte={f.destacada}>{f.concepto}</Celda>
                <Celda fuerte={f.destacada}>{f.trailingsat}</Celda>
                <Celda fuerte={f.destacada} azul>{f.arete}</Celda>
              </div>
            ))}
          </div>
          <p style={display({ margin: '28px 0 0', fontWeight: 700, fontSize: 18, lineHeight: 1.45, color: 'var(--azul-luz)', borderLeft: '2px solid var(--azul)', paddingLeft: 18 })}>{d.comparacionDestacado}</p>
          <div style={{ marginTop: 44, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/LOGO_ARETE.png" alt="" width={44} height={44} style={{ objectFit: 'contain' }} />
            <p style={display({ margin: 0, fontWeight: 800, fontSize: 22, lineHeight: 1.35, color: 'var(--hueso)', flex: 1, minWidth: 240 })}>{d.cierreTexto}</p>
          </div>
        </div>
      </section>
    </>
  );
}
