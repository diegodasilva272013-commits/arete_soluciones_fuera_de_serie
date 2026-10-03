'use client';

/**
 * Efectos de la landing de la Temporada 1 — aplicados a las piezas centrales:
 *  - BLUR:            el póster del equipo entra desenfocado en el hero, y el hero
 *                     se desenfoca al scrollear (useScroll). Fondos con backdrop-blur.
 *  - CROSSFADE:       los 9 episodios rotan en grande sobre el póster.
 *  - MAGNIFICATION:   el programa completo es un dock de 9 episodios que se agrandan
 *                     según la distancia al cursor.
 *  - SHARED ELEMENT:  el episodio del dock se transforma en su ficha, y el botón
 *                     "Reservar mi lugar" se transforma en el formulario (layoutId).
 * Todo respeta prefers-reduced-motion vía MotionConfig reducedMotion="user".
 */

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AnimatePresence,
  LayoutGroup,
  MotionConfig,
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { ArrowUpRight, Play, X } from 'lucide-react';
import c from '@/app/empresa/corp.module.css';
import s from './t1.module.css';
import { RegistroForm } from './_registro';
import {
  EPISODIOS,
  POSTER_TEMPORADA,
  PROFES,
  SEMANAS,
  TEMPORADA_INICIO,
  VIDEO_TEMPORADA_POSTER,
  VIDEO_TEMPORADA_SRC,
  profesLabel,
  type Episodio,
} from './_data';

const EASE = [0.16, 0.84, 0.28, 1] as const;
const pad = (n: number) => String(n).padStart(2, '0');

/** Destino de portales: el wrapper del layout (tiene las fuentes y no está transformado). */
function usePortal() {
  const [el, setEl] = useState<HTMLElement | null>(null);
  useEffect(() => setEl(document.querySelector('main')?.parentElement ?? document.body), []);
  return el;
}

/** Bloquea el scroll del body y cierra con Escape mientras `open`. */
function useModal(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);
}

/* ═════════════════════ BLUR: entrada genérica ═════════════════════ */

export function BlurIn({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        className={className}
        initial={{ opacity: 0, filter: 'blur(14px)', y: 18 }}
        whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
        viewport={{ once: true, margin: '0px 0px -60px 0px' }}
        transition={{ duration: 0.9, delay, ease: EASE }}
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}

/* ═════════════════════ HERO: BLUR (entrada + scroll) + CROSSFADE ═════════════════════ */

/** Envuelve el hero: al scrollear hacia abajo, todo el contenido se desenfoca y se apaga. */
export function HeroEscena({ children, poster }: { children: React.ReactNode; poster: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const blur = useTransform(scrollYProgress, [0, 0.9], [0, 16]);
  const filter = useTransform(blur, (b) => `blur(${b}px)`);
  const opacity = useTransform(scrollYProgress, [0, 0.9], [1, 0.15]);
  const y = useTransform(scrollYProgress, [0, 1], [0, 90]);

  return (
    <MotionConfig reducedMotion="user">
      <motion.div ref={ref} className={s.heroGrid} style={{ filter, opacity, y }}>
        <div>{children}</div>
        {poster}
      </motion.div>
    </MotionConfig>
  );
}

/** Póster del equipo: entra desde un blur fuerte y sobre él rotan los episodios (crossfade). */
export function HeroPoster() {
  const [falta, setFalta] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  // Si la imagen falló antes de hidratar, onError no llega a dispararse.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setFalta(true);
  }, []);

  return (
    <motion.div
      className={`${s.heroPoster} ${falta ? s.heroPosterVacio : ''}`}
      initial={{ opacity: 0, filter: 'blur(36px)', scale: 1.1 }}
      animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
      transition={{ duration: 1.6, ease: EASE, delay: 0.2 }}
    >
      {!falta && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imgRef}
          src={POSTER_TEMPORADA}
          alt="Diego Da Silva, Mauro Benitez, Fátima Rivera, Cecilia Gutierrez y Daniel Peña · Fuera de Serie Temporada 1"
          width={1932}
          height={1932}
          onError={() => setFalta(true)}
        />
      )}
      <EpisodiosCrossfade />
    </motion.div>
  );
}

function EpisodiosCrossfade() {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => setI((v) => (v + 1) % EPISODIOS.length), 3400);
    return () => clearInterval(id);
  }, []);

  const ep = EPISODIOS[i];
  return (
    <div className={s.posterCaption}>
      <span className={c.kickerLabel}>Episodio {ep.n} de 9</span>
      <div className={s.xfade} aria-live="off">
        <AnimatePresence initial={false}>
          <motion.div
            key={ep.n}
            initial={{ opacity: 0, filter: 'blur(10px)', y: 8 }}
            animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
            exit={{ opacity: 0, filter: 'blur(10px)', y: -8 }}
            transition={{ duration: 1, ease: EASE }}
          >
            <div className={s.posterEpTitle}>{ep.titulo}</div>
            <div className={s.posterEpMeta}>
              {ep.dia} {ep.fecha} · {ep.hora} · {ep.n === 9 ? 'Cierre de temporada' : profesLabel(ep.profes)}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export function Countdown() {
  const [txt, setTxt] = useState<string | null>(null);

  useEffect(() => {
    const inicio = new Date(TEMPORADA_INICIO).getTime();
    const tick = () => {
      const ms = inicio - Date.now();
      if (ms <= 0) return setTxt(null);
      const d = Math.floor(ms / 864e5);
      const h = Math.floor(ms / 36e5) % 24;
      const m = Math.floor(ms / 6e4) % 60;
      setTxt(d > 0 ? `${d} d ${h} h ${m} min` : `${h} h ${m} min`);
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  if (!txt) return null;
  return (
    <p className={s.countdown}>
      Primera clase en <b>{txt}</b>
    </p>
  );
}

/* ═════════════════════ VIDEO ═════════════════════ */

export function VideoTemporada() {
  return (
    <div className={s.videoFrame}>
      {VIDEO_TEMPORADA_SRC ? (
        <video controls playsInline preload="metadata" poster={VIDEO_TEMPORADA_POSTER}>
          <source src={VIDEO_TEMPORADA_SRC} type="video/mp4" />
        </video>
      ) : (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={VIDEO_TEMPORADA_POSTER} alt="Areté Fuera de Serie · Temporada 1" />
          <div className={s.videoSoon}>
            <span className={s.playRing}><Play size={26} /></span>
            <span className={c.kickerLabel}>El video se publica en estos días</span>
          </div>
        </>
      )}
    </div>
  );
}

/* ═════════════════════ RESERVA: SHARED ELEMENT botón → formulario ═════════════════════ */

const ReservaCtx = createContext<(origen: string) => void>(() => {});

/** Provee "abrir formulario" a cualquier botón de reserva de la página. */
export function ReservaProvider({ children }: { children: React.ReactNode }) {
  const [origen, setOrigen] = useState<string | null>(null);
  const portal = usePortal();
  const cerrar = useCallback(() => setOrigen(null), []);
  useModal(origen !== null, cerrar);

  return (
    <MotionConfig reducedMotion="user">
      <LayoutGroup id="reserva">
        <ReservaCtx.Provider value={setOrigen}>
          {children}
          <ReservaFlotante oculto={origen !== null} />
        </ReservaCtx.Provider>
        {portal && createPortal(
          <MotionConfig reducedMotion="user">
            <AnimatePresence>
              {origen && (
                <>
                  <motion.div
                    key="ov"
                    className={s.overlay}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={cerrar}
                  />
                  <div className={s.detailWrap} key="form">
                    <motion.div
                      layoutId={`reserva-${origen}`}
                      className={s.formModal}
                      role="dialog"
                      aria-modal="true"
                      aria-label="Reservá tu lugar"
                      transition={{ duration: 0.55, ease: EASE }}
                    >
                      <button className={s.close} onClick={cerrar} aria-label="Cerrar"><X size={18} /></button>
                      <motion.div
                        initial={{ opacity: 0, filter: 'blur(8px)' }}
                        animate={{ opacity: 1, filter: 'blur(0px)', transition: { delay: 0.25, duration: 0.5 } }}
                        exit={{ opacity: 0, transition: { duration: 0.1 } }}
                      >
                        <span className={c.kickerLabel}>Temporada 1 · Inscripción gratuita</span>
                        <h2 className={c.sectionTitle} style={{ margin: '12px 0 24px' }}>Reservá <em>tu lugar.</em></h2>
                        <RegistroForm compacto />
                      </motion.div>
                    </motion.div>
                  </div>
                </>
              )}
            </AnimatePresence>
          </MotionConfig>,
          portal
        )}
      </LayoutGroup>
    </MotionConfig>
  );
}

/** Botón que se transforma en el formulario. `id` identifica el origen de la transición. */
export function ReservaBoton({ id, label = 'Reservar mi lugar' }: { id: string; label?: string }) {
  const abrir = useContext(ReservaCtx);
  return (
    <motion.button
      layoutId={`reserva-${id}`}
      className={c.btnPrimary}
      onClick={() => abrir(id)}
      transition={{ duration: 0.55, ease: EASE }}
    >
      <motion.span layout="position" style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
        {label} <ArrowUpRight size={14} />
      </motion.span>
    </motion.button>
  );
}

/** CTA flotante: aparece después del hero y se esconde cuando el formulario está a la vista. */
function ReservaFlotante({ oculto }: { oculto: boolean }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => {
      const reg = document.getElementById('registro')?.getBoundingClientRect();
      const cercaDelForm = reg ? reg.top < window.innerHeight * 0.85 : false;
      setVisible(window.scrollY > window.innerHeight * 0.8 && !cercaDelForm);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && !oculto && (
        <motion.div
          className={s.ctaFlotante}
          initial={{ opacity: 0, y: 24, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: 24, filter: 'blur(10px)' }}
          transition={{ duration: 0.45, ease: EASE }}
        >
          <ReservaBoton id="flotante" label="Reservar mi lugar · Gratis" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ═════════════════════ PROGRAMA: MAGNIFICATION + SHARED ELEMENT ═════════════════════ */

function DockEpisodio({ ep, mouseX, onOpen }: { ep: Episodio; mouseX: MotionValue<number>; onOpen: (ep: Episodio, el: HTMLElement) => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  const distancia = useTransform(mouseX, (x) => {
    const r = ref.current?.getBoundingClientRect();
    return r ? x - (r.left + r.width / 2) : Infinity;
  });
  const anchoT = useTransform(distancia, [-230, 0, 230], [100, 210, 100]);
  const altoT = useTransform(distancia, [-230, 0, 230], [180, 300, 180]);
  const width = useSpring(anchoT, { mass: 0.1, stiffness: 160, damping: 15 });
  const height = useSpring(altoT, { mass: 0.1, stiffness: 160, damping: 15 });
  const detalle = useTransform(width, [150, 205], [0, 1]);
  const finale = ep.n === 9;

  return (
    <motion.button
      ref={ref}
      layoutId={`ep-${ep.n}`}
      className={`${s.dockEp} ${finale ? s.dockEpFinale : ''}`}
      style={{ width, height }}
      onClick={(e) => onOpen(ep, e.currentTarget)}
      aria-label={`Episodio ${ep.n}: ${ep.titulo}. ${ep.dia} ${ep.fecha}, ${ep.hora}`}
    >
      <span className={s.dockEpWhen}>{ep.dia} {ep.fecha}</span>
      <motion.span layoutId={`ep-n-${ep.n}`} className={s.dockEpN}>{pad(ep.n)}</motion.span>
      <motion.span layoutId={`ep-t-${ep.n}`} className={s.dockEpTitle}>{ep.titulo}</motion.span>
      <motion.span className={s.dockEpMore} style={{ opacity: detalle }}>
        {ep.bajada}
        <em>{finale ? 'Cierre de temporada' : `Con ${profesLabel(ep.profes)}`} · {ep.hora}</em>
      </motion.span>
    </motion.button>
  );
}

function ListaEpisodio({ ep, onOpen }: { ep: Episodio; onOpen: (ep: Episodio, el: HTMLElement) => void }) {
  return (
    <motion.button
      layoutId={`ep-${ep.n}`}
      className={`${s.epCard} ${ep.n === 9 ? s.dockEpFinale : ''}`}
      onClick={(e) => onOpen(ep, e.currentTarget)}
      aria-label={`Episodio ${ep.n}: ${ep.titulo}`}
    >
      <ArrowUpRight size={18} className={s.epMore} aria-hidden />
      <motion.span layoutId={`ep-n-${ep.n}`} className={s.epN}>{pad(ep.n)}</motion.span>
      <span className={s.epWhen}>{ep.dia} {ep.fecha} · {ep.hora}</span>
      <motion.span layoutId={`ep-t-${ep.n}`} className={s.epTitle}>{ep.titulo}</motion.span>
      <span className={s.epBajada}>{ep.bajada}</span>
    </motion.button>
  );
}

export function Programa() {
  const mouseX = useMotionValue(Infinity);
  const [abierto, setAbierto] = useState<Episodio | null>(null);
  const [esDock, setEsDock] = useState(true);
  const lastCard = useRef<HTMLElement | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const portal = usePortal();

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1280px) and (hover: hover)');
    const update = () => setEsDock(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const cerrar = useCallback(() => {
    setAbierto(null);
    lastCard.current?.focus();
  }, []);
  useModal(abierto !== null, cerrar);
  useEffect(() => {
    if (abierto) closeRef.current?.focus();
  }, [abierto]);

  const abrir = (ep: Episodio, el: HTMLElement) => {
    lastCard.current = el;
    setAbierto(ep);
  };

  const semanaDe = (ep: Episodio) => SEMANAS.find((x) => x.episodios.includes(ep));

  return (
    <MotionConfig reducedMotion="user">
      <LayoutGroup id="programa">
        {esDock ? (
          <div
            className={s.dockProg}
            onPointerMove={(e) => mouseX.set(e.clientX)}
            onPointerLeave={() => mouseX.set(Infinity)}
          >
            {SEMANAS.map((sem) => (
              <div key={sem.n} className={s.dockSemana}>
                <div className={s.dockEps}>
                  {sem.episodios.map((ep) => (
                    <DockEpisodio key={ep.n} ep={ep} mouseX={mouseX} onOpen={abrir} />
                  ))}
                </div>
                <div className={s.dockSemanaLabel}>
                  <span className={c.kickerLabel}>Semana {sem.n}</span>
                  <span>{sem.nombre}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={s.listaProg}>
            {SEMANAS.map((sem) => (
              <div key={sem.n}>
                <div className={s.listaSemana}>
                  <span className={c.kickerLabel}>Semana {sem.n}</span>
                  <span>{sem.nombre}</span>
                </div>
                <div className={s.epGrid}>
                  {sem.episodios.map((ep) => <ListaEpisodio key={ep.n} ep={ep} onOpen={abrir} />)}
                </div>
              </div>
            ))}
          </div>
        )}

        {portal && createPortal(
          <MotionConfig reducedMotion="user">
            <AnimatePresence>
              {abierto && (
                <>
                  <motion.div
                    key="overlay"
                    className={s.overlay}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    onClick={cerrar}
                  />
                  <div className={s.detailWrap} key="detail">
                    <motion.div
                      layoutId={`ep-${abierto.n}`}
                      className={`${s.detail} ${abierto.n === 9 ? s.dockEpFinale : ''}`}
                      role="dialog"
                      aria-modal="true"
                      aria-labelledby={`ep-dlg-${abierto.n}`}
                      transition={{ duration: 0.55, ease: EASE }}
                    >
                      <button ref={closeRef} className={s.close} onClick={cerrar} aria-label="Cerrar">
                        <X size={18} />
                      </button>
                      <span className={c.kickerLabel}>Temporada 1 · Semana {semanaDe(abierto)?.n} · {semanaDe(abierto)?.nombre}</span>
                      <div className={s.detailBody}>
                        <motion.span layoutId={`ep-n-${abierto.n}`} className={s.epN}>{pad(abierto.n)}</motion.span>
                        <motion.h3 layoutId={`ep-t-${abierto.n}`} id={`ep-dlg-${abierto.n}`} className={s.epTitle}>
                          {abierto.titulo}
                        </motion.h3>
                      </div>
                      <motion.div
                        initial={{ opacity: 0, filter: 'blur(8px)', y: 8 }}
                        animate={{ opacity: 1, filter: 'blur(0px)', y: 0, transition: { delay: 0.25, duration: 0.5 } }}
                        exit={{ opacity: 0, transition: { duration: 0.1 } }}
                      >
                        <p className={s.epBajada}>{abierto.bajada}</p>
                        <div className={c.meta}>
                          <div className={c.metaItem}>
                            <span className={c.metaDt}>Cuándo</span>
                            <span className={c.metaDd}>{abierto.dia} {abierto.fecha} · {abierto.hora}</span>
                          </div>
                          <div className={c.metaItem}>
                            <span className={c.metaDt}>Quién</span>
                            <span className={c.metaDd}>{profesLabel(abierto.profes)}</span>
                          </div>
                          <div className={c.metaItem}>
                            <span className={c.metaDt}>Duración</span>
                            <span className={c.metaDd}>90 min · <em>Gratis</em></span>
                          </div>
                        </div>
                        <a
                          href="#registro"
                          className={c.btnPrimary}
                          style={{ marginTop: 30 }}
                          onClick={() => setAbierto(null)}
                        >
                          Reservar mi lugar <ArrowUpRight size={14} />
                        </a>
                      </motion.div>
                    </motion.div>
                  </div>
                </>
              )}
            </AnimatePresence>
          </MotionConfig>,
          portal
        )}
      </LayoutGroup>
    </MotionConfig>
  );
}

/* ═════════════════════ EQUIPO ═════════════════════ */

export function Equipo() {
  return (
    <div className={s.equipo}>
      {PROFES.map((p, i) => {
        const alias = p.nombre === 'Daniel' ? ['Daniel', 'Dani'] : [p.nombre];
        const eps = EPISODIOS.filter((e) => e.profes.some((x) => alias.includes(x)));
        return (
          <BlurIn key={p.nombre} delay={i * 0.08} className={s.equipoItem}>
            <span className={s.equipoNombre}>{p.nombre} <em>{p.apellido}</em></span>
            <span className={s.equipoEps}>
              {eps.map((e) => (
                <span key={e.n}>{pad(e.n)} · {e.titulo}</span>
              ))}
            </span>
          </BlurIn>
        );
      })}
    </div>
  );
}
