'use client';

/**
 * Efectos de la landing de la Temporada 1:
 *  - BLUR:            BlurIn (entrada desenfocada al entrar en viewport) y fondos con backdrop-blur.
 *  - CROSSFADE:       ProximoEpisodio (rota episodios en el hero) y las semanas del Programa.
 *  - SHARED ELEMENT:  Programa — la tarjeta del episodio se transforma en el detalle (layoutId).
 *  - MAGNIFICATION:   DockProfes — el dock se agranda según la distancia al cursor.
 * Todo respeta prefers-reduced-motion vía MotionConfig reducedMotion="user".
 */

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AnimatePresence,
  LayoutGroup,
  MotionConfig,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { ArrowUpRight, Play, X } from 'lucide-react';
import c from '@/app/empresa/corp.module.css';
import s from './t1.module.css';
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

/* ═════════════════════ BLUR ═════════════════════ */

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

/* ═════════════════════ CROSSFADE (hero) ═════════════════════ */

export function ProximoEpisodio() {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => setI((v) => (v + 1) % EPISODIOS.length), 3200);
    return () => clearInterval(id);
  }, []);

  const ep = EPISODIOS[i];
  return (
    <div className={s.nextEp}>
      <span className={c.kickerLabel}>Episodios de la temporada</span>
      <div className={s.xfade} aria-live="off">
        <AnimatePresence initial={false}>
          <motion.div
            key={ep.n}
            className={s.nextEpTitle}
            initial={{ opacity: 0, filter: 'blur(8px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, filter: 'blur(8px)' }}
            transition={{ duration: 0.9, ease: EASE }}
          >
            {String(ep.n).padStart(2, '0')} · {ep.titulo}
            <span>{ep.dia} {ep.fecha}</span>
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

/* ═════════════════════ PÓSTER DEL EQUIPO ═════════════════════ */

/**
 * Se oculta sola si el archivo todavía no está en /public. No se chequea
 * con fs en el servidor a propósito: un path dinámico dentro de public/
 * hace que Vercel empaquete toda la carpeta (videos) en la función.
 */
export function PosterEquipo() {
  const [falta, setFalta] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  // Si la imagen falló antes de hidratar, onError no llega a dispararse.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setFalta(true);
  }, []);
  if (falta) return null;
  return (
    <BlurIn delay={0.1} className={s.poster}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={POSTER_TEMPORADA}
        alt="Diego Da Silva, Mauro Benitez, Fátima Rivera, Cecilia Gutierrez y Daniel Peña · Fuera de Serie Temporada 1"
        width={1932}
        height={1932}
        ref={imgRef}
        onError={() => setFalta(true)}
      />
    </BlurIn>
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

/* ═════════════════════ PROGRAMA: CROSSFADE + SHARED ELEMENT ═════════════════════ */

function EpisodioContenido({ ep, detalle = false }: { ep: Episodio; detalle?: boolean }) {
  const finale = ep.n === 9;
  return (
    <>
      <motion.span layoutId={`ep-n-${ep.n}`} className={s.epN}>
        {String(ep.n).padStart(2, '0')}
      </motion.span>
      <motion.span layoutId={`ep-w-${ep.n}`} className={s.epWhen}>
        {ep.dia} {ep.fecha} · {ep.hora}
      </motion.span>
      <motion.h3 layoutId={`ep-t-${ep.n}`} className={`${s.epTitle} ${finale ? s.finale : ''}`}>
        {ep.titulo}
      </motion.h3>
      <motion.p layoutId={`ep-b-${ep.n}`} className={s.epBajada}>
        {ep.bajada}
      </motion.p>
      {!detalle && (
        <span className={s.epWho}>{finale ? 'Cierre de temporada' : `Con ${profesLabel(ep.profes)}`}</span>
      )}
    </>
  );
}

export function Programa() {
  const [semana, setSemana] = useState(0);
  const [abierto, setAbierto] = useState<Episodio | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastCard = useRef<HTMLElement | null>(null);
  // Destino del portal: el wrapper del layout (tiene las variables de fuentes y no está transformado)
  const [portal, setPortal] = useState<HTMLElement | null>(null);
  useEffect(() => setPortal(document.querySelector('main')?.parentElement ?? document.body), []);

  useEffect(() => {
    if (!abierto) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setAbierto(null);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
      lastCard.current?.focus();
    };
  }, [abierto]);

  const irARegistro = () => {
    setAbierto(null);
    setTimeout(() => {
      document.getElementById('registro')?.scrollIntoView({ behavior: 'smooth' });
    }, 350);
  };

  return (
    <MotionConfig reducedMotion="user">
      <LayoutGroup>
        <div className={s.tabs} role="tablist" aria-label="Semanas de la temporada">
          {SEMANAS.map((sem, i) => (
            <button
              key={sem.n}
              role="tab"
              aria-selected={semana === i}
              className={s.tab}
              onClick={() => setSemana(i)}
            >
              <span className={s.tabKick}>Semana {sem.n}</span>
              <span className={s.tabName}>{sem.nombre}</span>
              {semana === i && <motion.span layoutId="tab-line" className={s.tabLine} transition={{ duration: 0.45, ease: EASE }} />}
            </button>
          ))}
        </div>

        <div className={s.xfade}>
          <AnimatePresence initial={false}>
            <motion.div
              key={semana}
              role="tabpanel"
              className={s.epGrid}
              initial={{ opacity: 0, filter: 'blur(10px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, filter: 'blur(10px)' }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              {SEMANAS[semana].episodios.map((ep) => (
                <motion.button
                  key={ep.n}
                  layoutId={`ep-${ep.n}`}
                  className={s.epCard}
                  onClick={(e) => {
                    lastCard.current = e.currentTarget;
                    setAbierto(ep);
                  }}
                  aria-label={`Ver episodio ${ep.n}: ${ep.titulo}`}
                  transition={{ duration: 0.5, ease: EASE }}
                >
                  <ArrowUpRight size={18} className={s.epMore} aria-hidden />
                  <EpisodioContenido ep={ep} />
                </motion.button>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Portal: BlurIn aplica filter/transform a sus ancestros, que romperían el position:fixed del detalle */}
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
                onClick={() => setAbierto(null)}
              />
              <div className={s.detailWrap} key="detail">
                <motion.div
                  layoutId={`ep-${abierto.n}`}
                  className={s.detail}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby={`ep-dlg-${abierto.n}`}
                  transition={{ duration: 0.5, ease: EASE }}
                >
                  <button ref={closeRef} className={s.close} onClick={() => setAbierto(null)} aria-label="Cerrar">
                    <X size={18} />
                  </button>
                  <span className={c.kickerLabel}>Temporada 1 · Episodio {abierto.n}</span>
                  <div className={s.detailBody} id={`ep-dlg-${abierto.n}`}>
                    <EpisodioContenido ep={abierto} detalle />
                  </div>
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: 0.25 } }}
                    exit={{ opacity: 0 }}
                  >
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
                    <button className={c.btnPrimary} style={{ marginTop: 30 }} onClick={irARegistro}>
                      Reservar mi lugar <ArrowUpRight size={14} />
                    </button>
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

/* ═════════════════════ MAGNIFICATION ═════════════════════ */

function DockItem({ mouseX, nombre, apellido, foto, base }: { mouseX: MotionValue<number>; nombre: string; apellido: string; foto?: string; base: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const distancia = useTransform(mouseX, (x) => {
    const r = ref.current?.getBoundingClientRect();
    return r ? x - (r.left + r.width / 2) : Infinity;
  });
  const tam = useTransform(distancia, [-170, 0, 170], [base, base * 1.75, base]);
  const size = useSpring(tam, { mass: 0.1, stiffness: 170, damping: 14 });
  const font = useTransform(size, (v) => v * 0.36);

  return (
    <div className={s.dockItem}>
      <motion.div ref={ref} className={s.avatar} style={{ width: size, height: size, fontSize: font }} aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {foto ? <img src={foto} alt="" /> : `${nombre[0]}${apellido[0]}`}
      </motion.div>
      <span className={s.dockName}>{nombre}<br />{apellido}</span>
    </div>
  );
}

export function DockProfes() {
  const mouseX = useMotionValue(Infinity);
  const [base, setBase] = useState(76);

  useEffect(() => {
    const update = () => setBase(window.innerWidth < 640 ? 52 : 76);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <div
        className={s.dock}
        onPointerMove={(e) => mouseX.set(e.clientX)}
        onPointerLeave={() => mouseX.set(Infinity)}
      >
        {PROFES.map((p) => (
          <DockItem key={p.nombre} mouseX={mouseX} nombre={p.nombre} apellido={p.apellido} foto={p.foto} base={base} />
        ))}
      </div>
    </MotionConfig>
  );
}
