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
            No lo contamos nosotros.<br /><em>Lo cuenta quien ya lo usa.</em>
          </h1>
          <p className={`${s.heroSub} ${s.reveal} ${s.revealDelay2}`} data-reveal="" style={{ maxWidth: 560 }}>
            Un caso real: qué construimos para Centro Jurídico NOA y qué dice quien lo usa todos los días.
          </p>
        </div>
      </section>

      {/* ── Caso: testimonio en video ── */}
      <div className={s.band}>
        <div className={s.bandGrid}>
          <div className={`${s.reveal}`} data-reveal="">
            <p className={s.bandNum}>Centro Jurídico NOA · Jujuy, Argentina</p>
            <h2 className={s.bandTitle}>Un estudio jurídico,<br /><em>disponible las 24 horas.</em></h2>
            <p className={s.bandBody}>
              Centro Jurídico NOA es un estudio jurídico en Jujuy. Le construimos dos agentes de voz
              con inteligencia artificial: uno para el estudio, que responde consultas legales, agenda
              turnos con los abogados e informa las áreas de práctica; y uno para Rodrigo Reyes, abogado
              y consultor patrimonial, enfocado en protección de activos y planificación patrimonial.
            </p>
            <p className={s.bandBody}>
              Los dos derivan cada caso al profesional indicado, disponibles las 24 horas.
            </p>
            <div style={{ marginTop: 28 }}>
              <Link href="/empresa/agentes-ia" className={s.btnGhost}>
                Ver el agente en vivo <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          <div className={`${s.bandRight} ${s.reveal} ${s.revealDelay1}`} data-reveal="">
            <LogoVideo
              src="/testimonios/noa-testimonio.mp4"
              poster="/testimonios/noa-testimonio-poster.jpg"
            />
            <p className={s.bandNum} style={{ margin: '16px 0 0' }}>Rodrigo Reyes — Centro Jurídico NOA</p>
          </div>
        </div>
      </div>

      {/* ── El estudio, por fuera ── */}
      <div className={s.band}>
        <div className={`${s.bandGrid} ${s.bandGridFlip}`}>
          <div className={`${s.bandFig} ${s.reveal}`} data-reveal="">
            <div className={s.bandFigFrame} style={{ aspectRatio: '9/16', maxWidth: 340, margin: '0 auto' }}>
              <AutoplayVideo
                src="/testimonios/noa-demo.mp4"
                poster="/testimonios/noa-demo-poster.jpg"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>
          </div>
          <div className={`${s.reveal} ${s.revealDelay1}`} data-reveal="">
            <p className={s.bandNum}>El estudio</p>
            <h2 className={s.bandTitle}>Así es Centro Jurídico NOA,<br /><em>por fuera.</em></h2>
            <p className={s.bandBody}>
              El mismo estudio, atendido también por voz: un agente de inteligencia artificial que
              responde consultas legales, agenda turnos y deriva cada caso, disponible las 24 horas.
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
