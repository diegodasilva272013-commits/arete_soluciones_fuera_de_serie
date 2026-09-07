import Link from 'next/link';
import Image from 'next/image';
import s from './corp.module.css';
import { RevealObserver } from './_reveal';
import ScrollExpandMedia from '@/components/ui/scroll-expansion-hero';
import { SvgPathDrawingTextAnimation } from '@/components/ui/path-drawing-portfolio-hero';

const WA = 'https://wa.me/5491143215678?text=Hola%2C%20quiero%20saber%20m%C3%A1s%20sobre%20Aret%C3%A9%20Soluciones';

const FRICCIONES = [
  { n: 'Fricción', t: 'Información duplicada', d: 'El mismo dato se carga tres veces porque los sistemas no se hablan.' },
  { n: 'Fricción', t: 'Dependencia de personas', d: '"Eso lo maneja Sandra." Si Sandra no está, el proceso se frena.' },
  { n: 'Fricción', t: 'Decisiones a ciegas', d: 'Para saber cómo viene el mes hay que llamar a cinco personas.' },
  { n: 'Fricción', t: 'Equipos que repiten', d: 'El mismo error, en el mismo punto, semana tras semana. Sin sistema, no hay corrección.' },
];

const ETAPAS = [
  { n: '01', t: 'Inmersión',        d: 'Entender la empresa desde adentro. Con dirección y con quien ejecuta.' },
  { n: '02', t: 'Auditoría',        d: 'Mapear la operación real. Fricciones, duplicaciones, dependencias.' },
  { n: '03', t: 'Priorización',     d: 'El 20% de problemas que genera el 80% de la pérdida.' },
  { n: '04', t: 'Arquitectura',     d: 'Diseñar cómo debería funcionar. Recién acá se elige tecnología.' },
  { n: '05', t: 'Implementación',   d: 'Construir por prioridad de impacto, no todo junto.' },
  { n: '06', t: 'Evolución',        d: 'Medir, observar, ajustar. Una empresa no es estática.' },
];

const PRIN_SISTEMAS = [
  'Si no entendemos el proceso, no podemos automatizarlo.',
  'Si no sabemos qué problema resolvemos, no debemos desarrollar.',
  'Si una tecnología no genera impacto, no la implementamos.',
  'Si podemos simplificar antes de automatizar, simplificamos.',
  'Si el sistema obliga a la empresa a trabajar peor para poder usarlo, diseñamos mal el sistema.',
];

const PRIN_PERSONAS = [
  'No formamos vendedores. Formamos solucionadores de problemas.',
  'La intención se percibe. Primero comprender, después diagnosticar, después decidir.',
  'Decir que no también es una buena decisión. La reputación está por encima de cualquier venta.',
  'Conocimiento sin acción es entretenimiento.',
  'No protegemos egos, protegemos crecimiento. La corrección es información.',
  'La realidad está por encima de la interpretación. No asumimos, observamos.',
];

export default function EmpresaHome() {
  return (
    <>
      <RevealObserver revealClass={s.revealOn} />

      {/* ══════════════ HERO ══════════════ */}
      <ScrollExpandMedia
        mediaType="video"
        mediaSrc="/video_hero.mp4"
        posterSrc="/video_hero-poster.jpg"
        bgImageSrc="/video_hero-poster.jpg"
        date="Areté"
        scrollToExpand="Desplazá para explorar"
      >
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <h1 className={s.homeH1} style={{ margin: '0 auto 24px', textAlign: 'center' }}>
            La fricción no está en las herramientas.<br /><em>Está entre ellas.</em>
          </h1>
          <p style={{ fontFamily: 'var(--f-texto), Spectral, Georgia, serif', fontWeight: 300, fontSize: 20, lineHeight: 1.65, color: '#C9C6C0' }}>
            Una empresa puede tener veinte sistemas y un equipo completo, y seguir funcionando mal. Entramos, entendemos cómo trabaja de verdad, y recién después construimos.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 32, flexWrap: 'wrap' }}>
            <Link href="/empresa/servicios" className={s.btn}>Ver cómo trabajamos</Link>
            <Link href="/empresa/metodologia" className={s.btnSec}>El método</Link>
          </div>
        </div>
      </ScrollExpandMedia>

      {/* ══════════════ EL PROBLEMA ══════════════ */}
      <section className={s.blk}>
        <div className={s.inner}>
          <div className={`${s.shead} ${s.reveal}`} data-reveal="">
            <div className={s.mono}>01 · El problema</div>
            <h2>Cada parte funciona.<br /><em>El conjunto no.</em></h2>
            <p>Ventas usa un CRM. Marketing otra plataforma. Administración un Excel. Operaciones WhatsApp. Cada herramienta anda bien por separado, y nadie tiene la visión completa.</p>
          </div>
          <div className={`${s.frict} ${s.reveal}`} data-reveal="">
            {FRICCIONES.map(f => (
              <div key={f.t} className={s.frictItem}>
                <div className={s.frictN}>{f.n}</div>
                <div className={s.frictT}>{f.t}</div>
                <div className={s.frictD}>{f.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ BIFURCACIÓN ══════════════ */}
      <section className={s.blk}>
        <div className={s.inner}>
          <div className={`${s.shead} ${s.reveal}`} data-reveal="">
            <div className={s.mono}>02 · Dos frentes, un criterio</div>
            <h2>La fricción está en los sistemas<br /><em>o está en las personas.</em></h2>
            <p>Casi siempre está en los dos. Por eso Areté trabaja los dos, con el mismo método: comprender antes de proponer.</p>
          </div>

          <div className={`${s.bif} ${s.reveal}`} data-reveal="">
            {/* Areté Soluciones */}
            <Link className={s.rama} href="/empresa/servicios">
              <div className={s.ramaFoto} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0A0A0B' }}>
                <Image
                  src="/LOGO_ARETE.png"
                  alt="Areté Soluciones"
                  width={260}
                  height={80}
                  style={{ width: '55%', height: 'auto', objectFit: 'contain' }}
                />
              </div>
              <div className={s.ramaBody}>
                <div className={s.ramaKick}>Línea 01 · Sistemas</div>
                <h3 className={s.ramaTitle}>
                  <SvgPathDrawingTextAnimation
                    text="Areté Soluciones"
                    fromColor="var(--azul)"
                    toColor="var(--azul-luz)"
                    fillColor="var(--hueso)"
                    fontFamily="var(--f-display), Montserrat, system-ui, sans-serif"
                    exactMeasure={false}
                    fontSize={40}
                    viewBoxWidth={480}
                    viewBoxHeight={70}
                    strokeWidth={1.5}
                    minHeight={46}
                  />
                </h3>
                <div className={s.ramaSub}>Diseñamos e implementamos sistemas empresariales que se adaptan a cómo trabaja tu empresa. No al revés.</div>
                <ul className={s.ramaList}>
                  <li className={s.ramaListItem}>Diagnóstico de las cuatro áreas</li>
                  <li className={s.ramaListItem}>Arquitectura antes que tecnología</li>
                  <li className={s.ramaListItem}>Desarrollo a medida</li>
                  <li className={s.ramaListItem}>Precio según el trabajo</li>
                </ul>
              </div>
              <span className={s.ramaGo}>
                <span className={s.ramaGoLine} />
                Ver la línea
              </span>
            </Link>

            {/* Areté Fuera de Serie */}
            <div className={s.rama}>
              <div className={s.ramaFoto} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0A0A0B' }}>
                <Image
                  src="/Aretea_fuera _de_serie_logo.png"
                  alt="Areté Fuera de Serie"
                  width={260}
                  height={80}
                  style={{ width: '55%', height: 'auto', objectFit: 'contain' }}
                />
              </div>
              <div className={s.ramaBody}>
                <div className={s.ramaKick}>Línea 02 · Personas</div>
                <h3 className={s.ramaTitle}>
                  <SvgPathDrawingTextAnimation
                    text="Areté Fuera de Serie"
                    fromColor="var(--azul)"
                    toColor="var(--azul-luz)"
                    fillColor="var(--hueso)"
                    fontFamily="var(--f-display), Montserrat, system-ui, sans-serif"
                    exactMeasure={false}
                    fontSize={32}
                    viewBoxWidth={480}
                    viewBoxHeight={70}
                    strokeWidth={1.3}
                    minHeight={46}
                  />
                </h3>
                <div className={s.ramaSub}>No formamos vendedores. Formamos solucionadores de problemas: personas capaces de comprender una situación y decidir qué corresponde hacer.</div>
                <ul className={s.ramaList}>
                  <li className={s.ramaListItem}>Personal formado para tu empresa</li>
                  <li className={s.ramaListItem}>Capacitación de tu equipo comercial</li>
                  <li className={s.ramaListItem}>Mentorías individuales</li>
                  <li className={s.ramaListItem}>Precio según el trabajo</li>
                </ul>
              </div>
              <span className={s.ramaGo}>
                <span className={s.ramaGoLine} />
                Próximamente
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ BANDA 1: Soluciones ══════════════ */}
      <div className={s.band}>
        <div className={s.bandGrid}>
          <div className={`${s.bandFig} ${s.reveal}`} data-reveal="">
            <div className={s.bandFigFrame}>
              <video autoPlay muted loop playsInline poster="/Video_diagnostico-poster.jpg" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}>
                <source src="/Video_diagnostico.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
          <div className={`${s.reveal} ${s.revealDelay1}`} data-reveal="">
            <div className={s.bandNum}>Areté Soluciones</div>
            <h3 className={s.bandTitle}>Primero entender.<br /><em>Después construir.</em></h3>
            <p className={s.bandBody}>Entramos en la empresa y hablamos con quien dirige, pero también con quien ejecuta. El CEO dice que el proceso funciona perfecto; la secretaria dice que hace lo mismo siete veces por día. Las dos miradas importan.</p>
            <p className={s.bandBody}>Del relevamiento sale un mapa de la operación con lo que cada proceso está costando, y el orden en que conviene intervenirlo. Recién ahí se decide qué construir.</p>
            <div className={s.meta}>
              <div className={s.metaItem}>
                <span className={s.metaDt}>Áreas</span>
                <span className={s.metaDd}>Ventas · Marketing · Administración · Delivery</span>
              </div>
              <div className={s.metaItem}>
                <span className={s.metaDt}>Inversión</span>
                <span className={s.metaDd}>Según el trabajo</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════ BANDA 2: Personas ══════════════ */}
      <div className={s.band}>
        <div className={`${s.bandGrid} ${s.bandGridFlip}`}>
          <div className={`${s.bandFig} ${s.reveal}`} data-reveal="">
            <div className={s.bandFigFrame}>
              <Image
                src="/Foto_acompañamiento.png"
                alt="Persona en sesión de formación"
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>
          <div className={`${s.reveal} ${s.revealDelay1}`} data-reveal="">
            <div className={s.bandNum}>Areté Fuera de Serie</div>
            <h3 className={s.bandTitle}>No entrenamos respuestas.<br /><em>Entrenamos pensamiento.</em></h3>
            <p className={s.bandBody}>Los guiones cambian. Los mercados cambian. Las herramientas cambian. Una persona capaz de observar una situación, comprenderla y decidir qué corresponde hacer siempre va a tener valor.</p>
            <p className={s.bandBody}>Por eso no creamos personajes comerciales ni copias. Desarrollamos capacidades sobre la identidad que cada uno ya tiene.</p>
            <div className={s.meta}>
              <div className={s.metaItem}>
                <span className={s.metaDt}>Formatos</span>
                <span className={s.metaDd}>Personal · Equipos · Individual</span>
              </div>
              <div className={s.metaItem}>
                <span className={s.metaDt}>Inversión</span>
                <span className={s.metaDd}>Según el trabajo</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════ BANDA 3: La plataforma ══════════════ */}
      <div className={s.band}>
        <div className={s.bandGrid}>
          <div className={`${s.bandFig} ${s.reveal}`} data-reveal="">
            <div className={s.bandFigFrame}>
              <video autoPlay muted loop playsInline poster="/Video_diagnostico-poster.jpg" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}>
                <source src="/Video_diagnostico.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
          <div className={`${s.reveal} ${s.revealDelay1}`} data-reveal="">
            <div className={s.bandNum}>La prueba</div>
            <h3 className={s.bandTitle}>La plataforma que usamos<br /><em>la construimos nosotros.</em></h3>
            <p className={s.bandBody}>El sistema de entrenamiento de Fuera de Serie es, literalmente, un sistema empresarial a medida hecho por Areté Soluciones. Simulador de campo, matriz de evaluación, historial de evidencia por persona y detección de patrones.</p>
            <p className={s.bandBody}>No hay mejor demostración de lo que hacemos que mostrar lo que construimos para nosotros mismos.</p>
            <div className={s.meta}>
              <div className={s.metaItem}>
                <span className={s.metaDt}>Ciclo</span>
                <span className={s.metaDd}>Aprender · Aplicar · Evaluar · Corregir</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════ MÉTODO ══════════════ */}
      <section className={s.blk}>
        <div className={s.inner}>
          <div className={`${s.shead} ${s.reveal}`} data-reveal="">
            <div className={s.mono}>03 · El método</div>
            <h2>Seis etapas.<br /><em>El orden no se altera.</em></h2>
            <p>El mismo criterio ordena una auditoría de procesos y una conversación comercial: comprender antes de proponer, diagnosticar antes de decidir.</p>
          </div>
          <div className={`${s.etapasGrid} ${s.reveal}`} data-reveal="">
            {ETAPAS.map(e => (
              <div key={e.n} className={s.etapa}>
                <div className={s.etapaN}>{e.n}</div>
                <h4 className={s.etapaTitle}>{e.t}</h4>
                <p className={s.etapaBody}>{e.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ PRINCIPIOS ══════════════ */}
      <section className={s.blk}>
        <div className={s.inner}>
          <div className={`${s.shead} ${s.reveal}`} data-reveal="">
            <div className={s.mono}>04 · Los principios</div>
            <h2>Lo que no negociamos.</h2>
            <p>Que las dos listas convivan es deliberado. Son la misma idea en dos planos.</p>
          </div>
          <div className={`${s.prin} ${s.reveal}`} data-reveal="">
            <div>
              <div className={s.prinColHead}>Sistemas · Areté Soluciones</div>
              <ol className={s.prinList}>
                {PRIN_SISTEMAS.map(p => <li key={p} className={s.prinItem}>{p}</li>)}
              </ol>
            </div>
            <div>
              <div className={s.prinColHead}>Personas · Areté Fuera de Serie</div>
              <ol className={s.prinList}>
                {PRIN_PERSONAS.map(p => <li key={p} className={s.prinItem}>{p}</li>)}
              </ol>
            </div>
          </div>
          <div className={`${s.cita} ${s.reveal}`} data-reveal="">
            Los resultados sostenibles no nacen de memorizar respuestas.<br />
            <span>Nacen de aprender a pensar.</span>
          </div>
        </div>
      </section>

      {/* ══════════════ CIERRE CTA ══════════════ */}
      <section className={s.ctaBand}>
        <div className={s.inner}>
          <div className={s.reveal} data-reveal="">
            <div className={s.mono} style={{ marginBottom: 22, display: 'block', textAlign: 'center' }}>Empezamos por entender</div>
            <h2 className={s.ctaTitle}>Contanos cómo<br /><em>trabaja tu empresa.</em></h2>
            <p className={s.ctaSub}>Una conversación para ver dónde está la fricción. Si vemos que no hay nada para hacer, te lo decimos.</p>
            <div className={s.ctaRow}>
              <a href={WA} target="_blank" rel="noopener noreferrer" className={s.btn}>Escribir a Areté</a>
              <Link href="/empresa/contacto" className={s.btnSec}>Ver formas de contacto</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
