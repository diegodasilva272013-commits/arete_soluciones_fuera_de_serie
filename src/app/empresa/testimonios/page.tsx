import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import s from '../corp.module.css';
import { RevealObserver } from '../_reveal';
import { AutoplayVideo } from '../_autoplay-video';
import { waUrl, WA_MSG_GENERAL } from '../_content';
import AnimatedGradient from '@/components/ui/animated-gradient';
import { LogoVideo } from '@/components/propuesta/LogoVideo';

const WA = waUrl(WA_MSG_GENERAL);

export default function TestimoniosPage() {
  return (
    <>
      <RevealObserver revealClass={s.revealOn} />

      {/* ── Hero ── */}
      <section className={s.pageHero} style={{ isolation: 'isolate' }}>
        <AnimatedGradient config={{ preset: 'Prism' }} />
        <div className={s.pageHeroInner} style={{ position: 'relative', zIndex: 1 }}>
          <div className={`${s.kicker} ${s.reveal}`} data-reveal="">
            <span className={s.kickerLine} />
            <span className={s.kickerLabel}>Casos reales</span>
          </div>
          <h1 className={`${s.heroTitle} ${s.reveal} ${s.revealDelay1}`} data-reveal="" style={{ maxWidth: 720 }}>
            No lo contamos nosotros.<br /><em>Lo cuenta quien trabaja con nosotros.</em>
          </h1>
          <p className={`${s.heroSub} ${s.reveal} ${s.revealDelay2}`} data-reveal="" style={{ maxWidth: 560 }}>
            Un caso real: qué construimos para Centro Jurídico NOA, y qué dice Rodrigo Reyes sobre trabajar con Areté.
          </p>
        </div>
      </section>

      {/* ── Caso: testimonio en video ── */}
      <div className={s.band}>
        <div className={s.bandGrid}>
          <div className={`${s.reveal}`} data-reveal="">
            <p className={s.bandNum}>Centro Jurídico NOA · Jujuy, Argentina</p>
            <h2 className={s.bandTitle}>Un ERP a medida,<br /><em>y un agente en camino.</em></h2>
            <p className={s.bandBody}>
              Centro Jurídico NOA es un estudio jurídico en Jujuy. Le construimos un ERP a medida
              para ordenar la gestión del estudio, y estamos implementando un agente de voz con
              inteligencia artificial para atender consultas y coordinar turnos.
            </p>
            <div style={{ marginTop: 28 }}>
              <Link href="/empresa/agentes-ia" className={s.btnGhost}>
                Probar el agente en desarrollo <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          <div className={`${s.bandRight} ${s.reveal} ${s.revealDelay1}`} data-reveal="">
            <div className={s.bandPanel} style={{ padding: 16 }}>
              <span className={s.bandPanelBorder} aria-hidden="true" />
              <LogoVideo
                src="/testimonios/noa-testimonio.mp4"
                poster="/testimonios/noa-testimonio-poster.jpg"
                rounded={false}
              />
            </div>
            <p className={s.bandNum} style={{ margin: '16px 0 0' }}>Rodrigo Reyes — Centro Jurídico NOA</p>
          </div>
        </div>
      </div>

      {/* ── El estudio, por fuera ── */}
      <div className={s.band}>
        <div className={`${s.bandGrid} ${s.bandGridFlip}`}>
          <div className={`${s.bandRight} ${s.reveal}`} data-reveal="" style={{ display: 'flex', justifyContent: 'center' }}>
            <div className={s.bandPanel} style={{ padding: 16, display: 'flex', justifyContent: 'center' }}>
              <span className={s.bandPanelBorder} aria-hidden="true" />
              <div style={{ aspectRatio: '9/16', maxWidth: 280, width: '100%', overflow: 'hidden' }}>
                <AutoplayVideo
                  src="/testimonios/noa-demo.mp4"
                  poster="/testimonios/noa-demo-poster.jpg"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
            </div>
          </div>
          <div className={`${s.reveal} ${s.revealDelay1}`} data-reveal="">
            <p className={s.bandNum}>El estudio</p>
            <h2 className={s.bandTitle}>Así es Centro Jurídico NOA,<br /><em>por fuera.</em></h2>
            <p className={s.bandBody}>
              El estudio donde estamos implementando el sistema: el ERP ya está en uso, y el agente
              de voz con inteligencia artificial está en desarrollo.
            </p>
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <section className={s.ctaBand}>
        <div className={s.inner}>
          <div className={s.reveal} data-reveal="">
            <h2 className={s.ctaTitle}>¿Querés ser el próximo caso?</h2>
            <p className={s.ctaSub}>Empezamos con un diagnóstico. Sin compromiso, sin presión.</p>
            <div className={s.ctaRow}>
              <a href={WA} target="_blank" rel="noopener noreferrer" className={s.btnPrimary}>
                Hablar por WhatsApp <ArrowRight size={15} />
              </a>
              <Link href="/empresa/contacto" className={s.btnGhost}>
                Otras formas de contacto
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
