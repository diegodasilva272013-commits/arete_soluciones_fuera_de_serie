'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowRight, ChevronDown, Check, X, Mic } from 'lucide-react';
import { checkPassword, notifyAcceptance } from './actions';
import AnimatedGradient from '@/components/ui/animated-gradient';
import { ContainerScroll } from '@/components/ui/container-scroll-animation';
import s from '../../corp.module.css';

// ── RevealObserver ────────────────────────────────────────────────────────────
function RevealObserver() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add(s.revealOn); io.unobserve(e.target); }
      }),
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}

// ── Password gate ─────────────────────────────────────────────────────────────
function PasswordGate() {
  const [pwd, setPwd]     = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const [pending, start]  = useTransition();
  const router            = useRouter();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    start(async () => {
      const res = await checkPassword(pwd);
      if (res.ok) { router.refresh(); }
      else { setError(true); setShake(true); setPwd(''); setTimeout(() => setShake(false), 500); }
    });
  };

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', position: 'relative', overflow: 'hidden', isolation: 'isolate' }}>
      <AnimatedGradient config={{ preset: 'Prism' }} />
      <div style={{
        position: 'relative', zIndex: 1, width: '100%', maxWidth: 420,
        background: 'rgba(5,5,5,0.92)', border: '1px solid var(--linea)',
        padding: '52px 44px', backdropFilter: 'blur(24px)',
        clipPath: 'polygon(20px 0,100% 0,100% calc(100% - 20px),calc(100% - 20px) 100%,0 100%,0 20px)',
        animation: shake ? 'propShake 0.4s ease' : 'none',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Image src="/LOGO_ARETE.png" alt="Areté" width={160} height={46} style={{ height: 36, width: 'auto', objectFit: 'contain', margin: '0 auto 20px' }} priority />
          <p className={s.kickerLabel} style={{ marginBottom: 8 }}>Propuesta técnica confidencial</p>
          <h1 style={{ margin: 0, fontFamily: 'var(--f-display), Montserrat, sans-serif', fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--hueso)' }}>Dax Cards</h1>
        </div>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 10, fontWeight: 500, color: 'var(--ceniza)', letterSpacing: '0.26em', textTransform: 'uppercase', fontFamily: 'var(--f-mono), monospace' }}>Clave de acceso</label>
          <input type="password" value={pwd} onChange={e => { setPwd(e.target.value); setError(false); }} placeholder="••••••••" required autoFocus
            style={{ display: 'block', width: '100%', boxSizing: 'border-box', padding: '15px 18px', background: 'rgba(242,239,233,0.03)', border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'var(--linea)'}`, color: 'var(--hueso)', fontSize: 16, outline: 'none', fontFamily: 'inherit', letterSpacing: '0.1em', transition: 'border-color 0.2s' }} />
          {error && <p style={{ margin: 0, fontSize: 12, color: 'rgba(239,68,68,0.85)', fontFamily: 'var(--f-mono), monospace' }}>Clave incorrecta. Revisá con el equipo de Areté.</p>}
          <button type="submit" disabled={pending || !pwd} className={s.btnPrimary} style={{ marginTop: 12, justifyContent: 'center', opacity: !pwd ? 0.45 : 1, cursor: pending ? 'wait' : !pwd ? 'default' : 'pointer' }}>
            {pending ? 'Verificando…' : 'Ver propuesta'}{!pending && <ArrowRight size={13} />}
          </button>
        </form>
      </div>
      <style>{`@keyframes propShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}`}</style>
    </div>
  );
}

// ── DATA ──────────────────────────────────────────────────────────────────────
const COMPARACION = [
  { antes: 'El soporte depende del horario y de que alguien esté libre', despues: 'Atención continua, 24 horas, todos los días' },
  { antes: 'Las mismas consultas básicas se responden una y otra vez', despues: 'El agente las resuelve solo, sin consumir tiempo del equipo' },
  { antes: 'Las consultas llegan por canales distintos y no quedan registradas de forma uniforme', despues: 'Cada contacto queda con la misma estructura de datos, trazable' },
  { antes: 'No hay historial ni métrica de qué se rompe más seguido', despues: 'Cada caso queda clasificado por producto y tipo de problema' },
  { antes: 'El cliente que escribe de noche espera hasta el día siguiente', despues: 'El cliente es atendido en el momento y se va con un número de ticket' },
];

const TABS_SOLUCION = [
  {
    id: 'agente', label: '3.1 El agente',
    content: (
      <>
        <p className={s.bandBody} style={{ margin: '0 0 10px', fontSize: 13 }}>Atiende desde el primer mensaje, identifica el problema y decide si lo resuelve o lo deriva.</p>
        <ul className={s.panelList} style={{ padding: 0, margin: 0 }}>
          {['Diagnostica en máximo 3 preguntas.','Habla español rioplatense, tono directo y cálido.','Nunca simula ser humano: si le preguntan, lo aclara.','No inventa: si no sabe, dice que lo deriva.']
            .map(item => <li key={item} className={s.panelItem}><span className={s.panelDot} aria-hidden="true" />{item}</li>)}
        </ul>
      </>
    ),
  },
  {
    id: 'resuelve', label: '3.2 Resuelve',
    content: (
      <>
        <p className={s.bandBody} style={{ margin: '0 0 10px', fontSize: 13 }}>Todo lo que el cliente puede resolver sin intervención del equipo de Dax.</p>
        <ul className={s.panelList} style={{ padding: 0, margin: 0 }}>
          {['Dudas sobre productos, plataformas y activación de tarjetas.','Consulta de estado de tickets ya abiertos.','Preguntas de compatibilidad y soporte de uso básico.','Información de cobertura, disponibilidad y planes.']
            .map(item => <li key={item} className={s.panelItem}><span className={s.panelDot} aria-hidden="true" />{item}</li>)}
        </ul>
      </>
    ),
  },
  {
    id: 'deriva', label: '3.3 Deriva',
    content: (
      <>
        <p className={s.bandBody} style={{ margin: '0 0 10px', fontSize: 13 }}>Lo que no puede resolver solo lo convierte en un ticket estructurado antes de pasar al equipo.</p>
        <ul className={s.panelList} style={{ padding: 0, margin: 0 }}>
          {['Tarjetas con fallas técnicas o defectos de fabricación.','Reclamos formales, garantías y solicitudes de reembolso.','Problemas con pedidos, envíos o datos de cuenta.','Cualquier situación que requiera criterio humano.']
            .map(item => <li key={item} className={s.panelItem}><span className={s.panelDot} aria-hidden="true" />{item}</li>)}
        </ul>
      </>
    ),
  },
  {
    id: 'ticket', label: '3.4 El ticket',
    content: (
      <>
        <p className={s.bandBody} style={{ margin: '0 0 10px', fontSize: 13 }}>Antes de derivar, el agente arma un registro completo para que el equipo no tenga que preguntar de nuevo.</p>
        <ul className={s.panelList} style={{ padding: 0, margin: 0 }}>
          {['Nombre, canal de contacto y país del cliente.','Producto involucrado, tipo de problema y nivel de urgencia.','Número de pedido y lo que el cliente ya intentó.','Resumen de la conversación en lenguaje claro.']
            .map(item => <li key={item} className={s.panelItem}><span className={s.panelDot} aria-hidden="true" />{item}</li>)}
        </ul>
      </>
    ),
  },
  {
    id: 'interfaz', label: '3.5 Interfaz',
    content: (
      <>
        <p className={s.bandBody} style={{ margin: '0 0 10px', fontSize: 13 }}>El equipo de Dax gestiona los tickets desde una interfaz simple, sin necesidad de herramientas externas.</p>
        <ul className={s.panelList} style={{ padding: 0, margin: 0 }}>
          {['Cola de tickets con estados: abierto / en revisión / resuelto.','Filtros por producto, tipo de problema y urgencia.','Visualización de transcripción y audio de cada caso.','Carga de respuesta pública al cliente desde la misma interfaz.']
            .map(item => <li key={item} className={s.panelItem}><span className={s.panelDot} aria-hidden="true" />{item}</li>)}
        </ul>
      </>
    ),
  },
  {
    id: 'aviso', label: '3.6 Aviso auto',
    content: (
      <>
        <p className={s.bandBody} style={{ margin: '0 0 10px', fontSize: 13 }}>Cuando el equipo marca un ticket como resuelto, el cliente recibe un aviso automático por el canal que usó para contactarse.</p>
        <ul className={s.panelList} style={{ padding: 0, margin: 0 }}>
          {['Sin pasos manuales ni recordatorios internos.','El cliente sabe que su caso fue atendido, sin tener que preguntar.','El canal de aviso sigue el canal de origen: web, WhatsApp o email.']
            .map(item => <li key={item} className={s.panelItem}><span className={s.panelDot} aria-hidden="true" />{item}</li>)}
        </ul>
      </>
    ),
  },
  {
    id: 'panel', label: '3.7 Panel',
    content: (
      <>
        <p className={s.bandBody} style={{ margin: '0 0 10px', fontSize: 13 }}>Una vista de todo lo que pasó: quién llamó, por qué y cómo se resolvió.</p>
        <ul className={s.panelList} style={{ padding: 0, margin: 0 }}>
          {['Transcripción y audio de cada conversación.','Distribución de casos por producto y tipo de problema.','Trazabilidad completa: desde el primer contacto hasta el cierre.','Métricas de volumen y tiempos de resolución.']
            .map(item => <li key={item} className={s.panelItem}><span className={s.panelDot} aria-hidden="true" />{item}</li>)}
        </ul>
      </>
    ),
  },
];

const LIMITES = [
  'Hace reembolsos, cambios ni reemplazos.',
  'Aprueba ni rechaza garantías.',
  'Modifica pedidos, envíos ni direcciones.',
  'Interpreta políticas: deriva el caso para que el equipo lo revise.',
  'Da diagnósticos técnicos inventados ("es el chip", "es tu celular").',
  'Promete plazos de resolución.',
  'Vende ni presiona por una compra.',
];

const INCLUIDO = [
  'Un agente de voz en el canal web.',
  'Idioma español, atención pensada para Argentina.',
  'Base de conocimiento construida con el contenido de Dax.',
  'Base de datos con el registro de cada consulta.',
  'Grabación y transcripción de conversaciones (30 días de retención).',
  'Panel de visualización de conversaciones y casos.',
  'Interfaz de gestión de tickets.',
  'Aviso automático al cliente cuando su ticket se resuelve.',
  'Guion de pruebas ejecutado antes de la puesta en producción.',
];

const NO_INCLUIDO = [
  'Inglés y portugués (Estados Unidos, Bolivia y Brasil).',
  'Canal WhatsApp.',
  'Número telefónico entrante.',
  'Integración con sistemas internos de Dax (cuentas, pedidos, stock).',
];

const NECESITAMOS = [
  { n: '01', t: 'Contenido del Help Center', d: 'Los pasos de activación de cada producto. Al preparar el agente, la web principal fue la única accesible.' },
  { n: '02', t: 'Políticas vigentes', d: 'Garantía, ventas, reembolsos y envíos. El agente deriva en vez de improvisar, pero necesita saber a qué derivar.' },
  { n: '03', t: 'Canal de notificación', d: 'A quién y por qué canal se notifican los tickets nuevos.' },
  { n: '04', t: 'Acceso técnico al sitio', d: 'O el punto donde insertar el componente del agente.' },
  { n: '05', t: 'Un referente del equipo', d: 'Para resolver dudas de negocio durante la implementación.' },
];

const ETAPAS_IMPL = [
  { n: '01', t: 'Base de conocimiento', d: 'Carga y estructuración de toda la información de Dax. El contenido vive en archivos, no en el código.' },
  { n: '02', t: 'Sistema de datos', d: 'Base de datos, estructura de tickets, panel de visualización e interfaz de gestión.' },
  { n: '03', t: 'Integración y pruebas', d: 'Montaje del agente en la web de Dax y ejecución del guion de pruebas completo.' },
  { n: '04', t: 'Producción', d: 'Entrega, capacitación del equipo sobre el uso del panel y seguimiento de los primeros casos reales.' },
];

const ROADMAP = [
  { n: '01', t: 'Help Center y políticas', d: 'Sube de golpe el porcentaje de casos que se resuelven sin tocar al equipo.' },
  { n: '02', t: 'Inglés y portugués', d: 'Para los mercados de Estados Unidos, Bolivia y Brasil.' },
  { n: '03', t: 'Canal WhatsApp', d: 'Con la misma base de conocimiento y el mismo sistema de tickets.' },
  { n: '04', t: 'Integración con sistemas', d: 'El agente pasa de registrar a consultar estado real de cuentas y pedidos.' },
  { n: '05', t: 'Reportes de motivos', d: 'Qué producto genera más soporte y dónde conviene intervenir el producto, no el soporte.' },
];

const SEGURIDAD_ITEMS = [
  ['Nunca pide datos sensibles', 'Contraseñas, códigos de verificación, códigos de activación completos, datos bancarios. Si el cliente empieza a dictarlos, lo frena con amabilidad.'],
  ['Sin acceso a sistemas internos', 'No se conecta a cuentas, perfiles ni pedidos de Dax. No hay superficie de ataque.'],
  ['Información encriptada', 'En tránsito y almacenada.'],
  ['Acceso con usuario y contraseña', 'Por persona, al panel y a la interfaz de tickets.'],
  ['Retención de 30 días', 'Grabaciones y transcripciones en ventana móvil.'],
  ['No confirma ni niega existencia', 'No filtra información a quien llame sin ser el titular.'],
];

// ── Accordion ─────────────────────────────────────────────────────────────────
function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid var(--linea)' }}>
      <button onClick={() => setOpen(v => !v)} style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '22px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 16,
      }}>
        <span style={{ fontFamily: 'var(--f-display), Montserrat, sans-serif', fontWeight: 700, fontSize: 15, color: open ? 'var(--hueso)' : 'rgba(242,239,233,0.7)', letterSpacing: '-0.01em', transition: 'color 0.2s' }}>{title}</span>
        <span style={{
          width: 28, height: 28, flexShrink: 0, border: '1px solid var(--linea)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: open ? 'rgba(47,123,246,0.1)' : 'transparent',
          borderColor: open ? 'rgba(47,123,246,0.4)' : 'var(--linea)',
          transition: 'all 0.2s',
        }}>
          <ChevronDown size={14} color={open ? 'var(--azul-luz)' : 'var(--ceniza)'} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s ease, color 0.2s' }} />
        </span>
      </button>
      <div style={{ overflow: 'hidden', maxHeight: open ? 999 : 0, transition: 'max-height 0.4s cubic-bezier(0.16,0.84,0.28,1)', paddingBottom: open ? 24 : 0 }}>
        {children}
      </div>
    </div>
  );
}

const SOLUCION_IMAGES = [
  '/galeria1.png',
  '/galeria2.png',
  '/galeria3.png',
  '/galeria4.png',
  '/galeria5.png',
  '/galeria6.png',
  '/galeria7.png',
];

// ── ElasticSolucion — desktop: elastic horizontal / mobile: elastic vertical ──
function ElasticSolucion({ items }: { items: typeof TABS_SOLUCION }) {
  const [activeId, setActiveId] = useState(items[0].id);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (isMobile) {
    /* ── MOBILE: imagen elástica + texto debajo separado ── */
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--linea)' }}>
        {items.map((item, idx) => {
          const isActive = activeId === item.id;
          const img = SOLUCION_IMAGES[idx] ?? '/galeria1.png';
          return (
            <div key={item.id} style={{ background: '#050505' }}>
              {/* Imagen elástica — 48px colapsada → 180px activa */}
              <div
                onClick={() => setActiveId(item.id)}
                style={{
                  position: 'relative',
                  height: isActive ? 180 : 48,
                  transition: 'height 0.6s cubic-bezier(0.25,1,0.5,1)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                }}
              >
                <Image
                  src={img}
                  alt={item.label}
                  fill
                  sizes="100vw"
                  style={{
                    objectFit: 'cover',
                    transform: isActive ? 'scale(1.02)' : 'scale(1.1)',
                    transition: 'transform 1s cubic-bezier(0.25,1,0.5,1), filter 0.5s',
                    filter: isActive ? 'brightness(0.65) saturate(0.8)' : 'brightness(0.32) saturate(0.4)',
                  }}
                />
                {/* Label siempre visible sobre la imagen */}
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 18, paddingRight: 14, background: isActive ? 'none' : 'rgba(5,5,5,0.2)' }}>
                  <span style={{ fontFamily: 'var(--f-mono), monospace', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: isActive ? 'rgba(242,239,233,0.9)' : 'rgba(242,239,233,0.75)', whiteSpace: 'nowrap' }}>{item.label}</span>
                  <ChevronDown size={11} color="rgba(242,239,233,0.6)" style={{ transform: isActive ? 'rotate(180deg)' : 'none', transition: 'transform 0.4s', flexShrink: 0 }} />
                </div>
              </div>
              {/* Texto — separado, debajo de la imagen */}
              <div style={{
                overflow: 'hidden',
                maxHeight: isActive ? 520 : 0,
                transition: 'max-height 0.5s cubic-bezier(0.25,1,0.5,1)',
              }}>
                <div style={{ padding: '14px 18px 20px', borderTop: '1px solid var(--linea)' }}>
                  <span style={{ display: 'inline-block', marginBottom: 8, padding: '2px 8px', border: '1px solid rgba(92,154,255,0.4)', background: 'rgba(47,123,246,0.12)', fontFamily: 'var(--f-mono), monospace', fontSize: 8, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--azul-luz)' }}>{item.label}</span>
                  {item.content}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  /* ── DESKTOP: elastic horizontal ── */
  return (
    <div style={{ display: 'flex', gap: 1, background: 'var(--linea)', height: 480, alignItems: 'stretch' }}>
      {items.map((item, idx) => {
        const isActive = activeId === item.id;
        const img = SOLUCION_IMAGES[idx] ?? '/galeria1.png';
        return (
          <div
            key={item.id}
            onMouseEnter={() => setActiveId(item.id)}
            onClick={() => setActiveId(item.id)}
            style={{
              flex: isActive ? 5 : 1,
              transition: 'flex 0.7s cubic-bezier(0.25,1,0.5,1)',
              cursor: 'pointer',
              overflow: 'hidden',
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ position: 'relative', height: 200, flexShrink: 0, overflow: 'hidden' }}>
              <Image
                src={img}
                alt={item.label}
                fill
                sizes="25vw"
                style={{
                  objectFit: 'cover',
                  transform: isActive ? 'scale(1.03)' : 'scale(1.1)',
                  transition: 'transform 1s cubic-bezier(0.25,1,0.5,1), filter 0.5s',
                  filter: isActive ? 'brightness(0.75) saturate(0.8)' : 'brightness(0.38) saturate(0.45)',
                }}
              />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isActive ? 0 : 1, transition: 'opacity 0.2s', pointerEvents: 'none' }}>
                <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontFamily: 'var(--f-mono), monospace', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(242,239,233,0.9)', whiteSpace: 'nowrap' }}>{item.label}</span>
              </div>
            </div>
            <div style={{ flex: 1, padding: '18px 20px', background: '#050505', borderTop: '1px solid var(--linea)', opacity: isActive ? 1 : 0, transform: isActive ? 'translateY(0)' : 'translateY(6px)', transition: 'opacity 0.35s 0.12s, transform 0.35s 0.12s' }}>
              <span style={{ display: 'inline-block', marginBottom: 10, padding: '2px 8px', border: '1px solid rgba(92,154,255,0.4)', background: 'rgba(47,123,246,0.12)', fontFamily: 'var(--f-mono), monospace', fontSize: 8, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--azul-luz)' }}>{item.label}</span>
              {item.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── ElasticComparacion — hover-activated comparison rows ──────────────────────
function ElasticComparacion({ items }: { items: typeof COMPARACION }) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div>
      {/* Column headers */}
      <div className="p-cmp-head" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'var(--linea)', marginBottom: 1 }}>
        <div style={{ padding: '12px 28px', background: '#050505', borderBottom: '2px solid rgba(239,68,68,0.3)' }}>
          <span style={{ fontFamily: 'var(--f-mono), monospace', fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(239,68,68,0.55)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <X size={9} /> Sin el agente
          </span>
        </div>
        <div style={{ padding: '12px 28px', background: 'rgba(47,123,246,0.04)', borderBottom: '2px solid var(--azul)' }}>
          <span style={{ fontFamily: 'var(--f-mono), monospace', fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--azul-luz)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Check size={9} /> Con el agente
          </span>
        </div>
      </div>

      {/* Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--linea)' }}>
        {items.map((row, i) => {
          const isHov = hovered === i;
          return (
            <div
              key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className="p-cmp-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'var(--linea)', cursor: 'default' }}
            >
              <div style={{
                padding: isHov ? '28px 28px' : '20px 28px',
                background: isHov ? 'rgba(239,68,68,0.05)' : '#050505',
                transition: 'padding 0.3s, background 0.3s',
                display: 'flex', alignItems: 'flex-start', gap: 14,
              }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(239,68,68,0.45)', flexShrink: 0, marginTop: 10 }} />
                <p style={{
                  margin: 0, fontFamily: 'var(--f-texto), Spectral, serif',
                  fontSize: 14, lineHeight: 1.78,
                  color: isHov ? 'rgba(242,239,233,0.45)' : 'rgba(242,239,233,0.3)',
                  fontStyle: 'italic',
                  transition: 'color 0.3s',
                }}>{row.antes}</p>
              </div>
              <div style={{
                padding: isHov ? '28px 28px' : '20px 28px',
                background: isHov ? 'rgba(47,123,246,0.08)' : 'rgba(47,123,246,0.02)',
                transition: 'padding 0.3s, background 0.3s',
                display: 'flex', alignItems: 'flex-start', gap: 14,
              }}>
                <Check size={12} color={isHov ? 'var(--azul-luz)' : 'var(--azul)'} style={{ flexShrink: 0, marginTop: 5, transition: 'color 0.3s' }} />
                <p style={{
                  margin: 0, fontFamily: 'var(--f-texto), Spectral, serif',
                  fontSize: 14, lineHeight: 1.78,
                  color: isHov ? 'var(--hueso)' : 'rgba(242,239,233,0.6)',
                  transition: 'color 0.3s',
                }}>{row.despues}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── DemoButton — triggers ElevenLabsWidget in empresa layout ──────────────────
function DemoButton() {
  const [hov, setHov] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const btn = document.querySelector<HTMLButtonElement>('button[aria-label="Colgar"]');
      setActive(!!btn);
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });
    return () => observer.disconnect();
  }, []);

  const handleClick = () => {
    const btn = document.querySelector<HTMLButtonElement>('button[aria-label="Llamar a un asesor"], button[aria-label="Colgar"]');
    btn?.click();
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 10,
        padding: '15px 32px',
        background: active ? 'rgba(239,68,68,0.08)' : hov ? 'rgba(47,123,246,0.1)' : 'transparent',
        border: `1.5px solid ${active ? 'rgba(239,68,68,0.5)' : hov ? 'var(--azul)' : 'rgba(92,154,255,0.3)'}`,
        color: active ? 'rgba(239,68,68,0.9)' : hov ? 'var(--azul-luz)' : 'rgba(92,154,255,0.65)',
        fontFamily: 'var(--f-mono), monospace',
        fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
        cursor: 'pointer', transition: 'all 0.25s',
      }}
    >
      <Mic size={13} />
      {active ? 'Colgar' : 'Probar el agente'}
    </button>
  );
}

// ── ElasticRoadmap — vertical elastic panels ──────────────────────────────────
function ElasticRoadmap({ items }: { items: typeof ROADMAP }) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--linea)' }}>
      {items.map((item, i) => {
        const isActive = activeIdx === i;
        return (
          <div
            key={item.n}
            onMouseEnter={() => setActiveIdx(i)}
            onMouseLeave={() => setActiveIdx(null)}
            style={{
              display: 'grid', gridTemplateColumns: '56px 1fr',
              background: isActive ? 'rgba(47,123,246,0.05)' : '#050505',
              borderLeft: `2px solid ${isActive ? 'var(--azul)' : 'transparent'}`,
              transition: 'background 0.25s, border-color 0.25s',
              cursor: 'default',
            }}
          >
            <div style={{ padding: '24px 16px', borderRight: '1px solid var(--linea)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'var(--f-mono), monospace', fontSize: 11, letterSpacing: '0.18em', color: isActive ? 'var(--azul-luz)' : 'var(--azul)', transition: 'color 0.25s' }}>{item.n}</span>
            </div>
            <div style={{ padding: '24px 32px' }}>
              <p style={{ margin: '0 0 8px', fontFamily: 'var(--f-display), Montserrat, sans-serif', fontWeight: 700, fontSize: 15, color: isActive ? 'var(--hueso)' : 'rgba(242,239,233,0.7)', letterSpacing: '-0.01em', transition: 'color 0.25s' }}>{item.t}</p>
              <p style={{
                margin: 0, fontFamily: 'var(--f-texto), Spectral, serif',
                fontSize: 14, lineHeight: 1.7,
                color: 'var(--ceniza)',
                maxHeight: isActive ? 120 : 0,
                overflow: 'hidden',
                transition: 'max-height 0.4s cubic-bezier(0.16,0.84,0.28,1)',
              }}>{item.d}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── ProposalContent ───────────────────────────────────────────────────────────
function ProposalContent() {
  const [accepted,  setAccepted]  = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [activeNav, setActiveNav] = useState('');
  const [pending, start] = useTransition();

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const fn = () => {
      const sections = Object.entries(sectionRefs.current);
      for (let i = sections.length - 1; i >= 0; i--) {
        const [id, el] = sections[i];
        if (el && window.scrollY + 140 >= el.offsetTop) { setActiveNav(id); break; }
      }
    };
    window.addEventListener('scroll', fn, { passive: true });
    fn();
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const scrollTo = (id: string) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const setRef = (id: string) => (el: HTMLElement | null) => { sectionRefs.current[id] = el; };

  const handleAccept = () => {
    setAccepting(true);
    start(async () => {
      await notifyAcceptance();
      setAccepted(true);
      setAccepting(false);
      const msg = encodeURIComponent('Hola Santino, acabo de aceptar la propuesta de Dax Cards. ¿Cuándo arrancamos?');
      window.open(`https://wa.me/5493875047561?text=${msg}`, '_blank');
    });
  };

  const NAV_ITEMS = [
    { id: 'situacion', label: 'Situación' },
    { id: 'solucion',  label: 'Solución' },
    { id: 'seguridad', label: 'Seguridad' },
    { id: 'alcance',   label: 'Alcance' },
    { id: 'inversion', label: 'Inversión' },
    { id: 'proceso',   label: 'Proceso' },
  ];

  return (
    <>
      <RevealObserver />

      {/* ── Mobile responsive styles ── */}
      <style>{`
        @media (max-width: 768px) {
          .p-nav { overflow-x: auto !important; flex-wrap: nowrap !important; -webkit-overflow-scrolling: touch; scrollbar-width: none; padding: 0 12px !important; }
          .p-nav::-webkit-scrollbar { display: none; }
          .p-nav-fade { display: block !important; }
          .p-seg-img { min-height: 320px !important; }
          .p-seg-text-inner { padding: 24px 20px !important; }
          .p-seg-grid { grid-template-columns: 1fr !important; height: auto !important; }
          .p-seg-img { min-height: 260px !important; position: relative !important; }
          .p-seg-right { padding: 32px 20px !important; }
          .p-grid2 { grid-template-columns: 1fr !important; height: auto !important; }
          .p-pad { padding: 28px 20px !important; }
          .p-inv-pad { padding: 36px 20px !important; }
          .p-grid4 { grid-template-columns: 1fr 1fr !important; }
          .p-cmp-row { grid-template-columns: 1fr !important; }
          .p-cmp-row > div:first-child { border-bottom: 1px solid var(--linea); }
          .p-cmp-head { grid-template-columns: 1fr !important; }
          .p-nec-pad { padding: 16px 14px !important; }
          .p-limits { padding: 24px 16px !important; }
          .p-hero-metrics { max-width: 100% !important; margin-left: 0 !important; margin-right: 0 !important; }
        }
      `}</style>

      {/* ── Barra de secciones (bajo el CorpHeader) ── */}
      <div style={{ position: 'sticky', top: 68, zIndex: 100 }}>
        <nav className="p-nav" style={{
          display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'nowrap',
          padding: '0 32px', height: 44,
          background: 'rgba(5,5,5,0.96)',
          borderBottom: '1px solid var(--linea)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }}>
          {NAV_ITEMS.map(({ id, label }) => (
            <button key={id} onClick={() => scrollTo(id)} style={{
              padding: '4px 14px', background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--f-mono), monospace', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
              color: activeNav === id ? 'var(--azul-luz)' : 'rgba(242,239,233,0.4)',
              transition: 'color 0.2s', flexShrink: 0,
              borderBottom: activeNav === id ? '2px solid var(--azul)' : '2px solid transparent',
            }}>{label}</button>
          ))}
          <span style={{ marginLeft: 'auto', padding: '3px 10px', fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', fontFamily: 'var(--f-mono), monospace', color: 'var(--azul-luz)', border: '1px solid rgba(92,154,255,0.22)', flexShrink: 0 }}>
            Confidencial
          </span>
        </nav>
        {/* Fade derecho — indica que hay más items a la derecha en mobile */}
        <div className="p-nav-fade" style={{
          display: 'none', position: 'absolute', top: 0, right: 0, width: 64, height: '100%',
          background: 'linear-gradient(to right, transparent, rgba(5,5,5,0.96))',
          pointerEvents: 'none',
        }} />
      </div>

      {/* ── Hero (ContainerScroll) ── */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <AnimatedGradient config={{ preset: 'Prism' }} style={{ zIndex: 0 }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <ContainerScroll
            titleComponent={
              <div style={{ padding: '0 16px' }}>
                <div className={s.kicker} style={{ marginBottom: 20, justifyContent: 'center' }}>
                  <span className={s.kickerLine} />
                  <span className={s.kickerLabel}>Dax Cards — daxcards.com · Septiembre 2026</span>
                </div>
                <h1 className={s.heroTitle} style={{ marginBottom: 20 }}>
                  Soporte por voz,<br /><em>24 horas al día.</em>
                </h1>
                <p className={s.heroSub} style={{ maxWidth: 600, margin: '0 auto 36px' }}>
                  Dax vende tarjetas NFC y perfiles digitales. Cada venta abre la puerta a una consulta posterior. Esta propuesta cubre un agente de IA que atiende por voz, resuelve en el momento lo que puede, y convierte todo lo demás en un ticket estructurado.
                </p>
                {/* Métricas */}
                <div className="p-hero-metrics" style={{ display: 'flex', gap: 1, background: 'var(--linea)', marginBottom: 28, flexWrap: 'wrap', maxWidth: 640, margin: '0 auto 28px' }}>
                  {[
                    { val: 'USD 1.500', label: 'Desarrollo', sub: '50% al inicio · 50% al entregar' },
                    { val: 'USD 150', label: 'Por mes', sub: 'Operación y mantenimiento' },
                    { val: '1–2 sem.', label: 'Entrega', sub: 'Desde la confirmación' },
                  ].map(({ val, label, sub }) => (
                    <div key={label} style={{ padding: '20px 28px', background: 'rgba(5,5,5,0.92)', backdropFilter: 'blur(8px)', flex: '1 1 140px' }}>
                      <div style={{ fontFamily: 'var(--f-display), Montserrat, sans-serif', fontWeight: 900, fontSize: 'clamp(18px,2vw,26px)', letterSpacing: '-0.05em', color: 'var(--hueso)' }}>{val}</div>
                      <div style={{ fontFamily: 'var(--f-mono), monospace', fontSize: 9, letterSpacing: '0.26em', textTransform: 'uppercase', color: 'var(--azul-luz)', margin: '5px 0 3px' }}>{label}</div>
                      <div style={{ fontFamily: 'var(--f-mono), monospace', fontSize: 9, color: 'var(--ceniza)' }}>{sub}</div>
                    </div>
                  ))}
                </div>
                {/* Demo button */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <DemoButton />
                </div>
              </div>
            }
          >
            {/* Card: galeria9 como preview del sistema */}
            <div style={{ position: 'relative', height: '100%', width: '100%' }}>
              <Image
                src="/galeria9.png"
                alt="Vista previa del agente"
                fill
                sizes="100vw"
                priority
                style={{ objectFit: 'cover', filter: 'brightness(0.5) saturate(0.65)' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 80%, rgba(47,123,246,0.2) 0%, rgba(5,5,5,0.55) 70%)' }} />
              <div style={{ position: 'absolute', bottom: 20, left: 24, right: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'var(--f-mono), monospace', fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(92,154,255,0.65)', border: '1px solid rgba(92,154,255,0.2)', padding: '3px 10px', backdropFilter: 'blur(8px)' }}>Areté Fuera de Serie</span>
                <span style={{ fontFamily: 'var(--f-mono), monospace', fontSize: 9, letterSpacing: '0.2em', color: 'rgba(242,239,233,0.3)' }}>aretesoluciones.space</span>
              </div>
            </div>
          </ContainerScroll>
        </div>
      </div>

      {/* ── 01 Situación ── */}
      <section className={s.section} ref={setRef('situacion')}>
        <div className={s.inner}>
          <div className={`${s.sectionLockup} ${s.reveal}`} data-reveal="" style={{ marginBottom: 52 }}>
            <p className={s.kickerLabel} style={{ marginBottom: 14 }}>01 — Situación que resuelve</p>
            <h2 className={s.sectionTitle}>Antes y después<br /><em>del agente.</em></h2>
            <p className={s.sectionSub}>Pasá el cursor por cada fila para ver el contraste.</p>
          </div>
          <div className={`${s.reveal}`} data-reveal="">
            <ElasticComparacion items={COMPARACION} />
          </div>
        </div>
      </section>

      {/* ── 02 Solución ── */}
      <section className={`${s.section} ${s.sectionAlt}`} ref={setRef('solucion')}>
        <div className={s.inner}>
          <div className={`${s.sectionLockup} ${s.reveal}`} data-reveal="" style={{ marginBottom: 52 }}>
            <p className={s.kickerLabel} style={{ marginBottom: 14 }}>02 — La solución en detalle</p>
            <h2 className={s.sectionTitle}>Siete componentes,<br /><em>un sistema.</em></h2>
            <p className={s.sectionSub}>Pasá el cursor por cada panel para explorar cada módulo.</p>
          </div>
          <div className={`${s.reveal}`} data-reveal="">
            <ElasticSolucion items={TABS_SOLUCION} />
          </div>
        </div>
      </section>

      {/* ── 03 Seguridad ── */}
      <section ref={setRef('seguridad')} className="p-seg-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', height: 580 }}>
        {/* Imagen izquierda */}
        <div className="p-seg-img" style={{ position: 'relative', overflow: 'hidden' }}>
          <Image src="/galeria8.png" alt="Seguridad" fill sizes="50vw" style={{ objectFit: 'cover', filter: 'brightness(0.38) saturate(0.6)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, transparent 50%, #050505 100%)' }} />
          <div className="p-seg-text-inner" style={{ position: 'absolute', inset: 0, padding: '60px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            <div className={`${s.sectionLockup} ${s.reveal}`} data-reveal="">
              <p className={s.kickerLabel} style={{ marginBottom: 14 }}>03 — Seguridad</p>
              <h2 className={s.sectionTitle}>Construido para<br /><em>no exponer nada.</em></h2>
              <p className={s.sectionSub} style={{ maxWidth: 320 }}>El agente no accede a cuentas ni a sistemas internos de Dax.</p>
            </div>
          </div>
        </div>
        {/* Accordions derecha */}
        <div className="p-seg-right" style={{ padding: '60px 56px', background: '#050505', overflowY: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className={`${s.reveal} ${s.revealDelay1}`} data-reveal="">
            {SEGURIDAD_ITEMS.map(([titulo, desc]) => (
              <Accordion key={titulo} title={titulo}>
                <p style={{ margin: 0, fontFamily: 'var(--f-texto), Spectral, serif', fontSize: 14, lineHeight: 1.75, color: '#B4B1AB' }}>{desc}</p>
              </Accordion>
            ))}
          </div>
        </div>
      </section>

      {/* ── 04 Alcance ── */}
      <section className={`${s.section} ${s.sectionAlt}`} ref={setRef('alcance')}>
        <div className={s.inner}>
          <div className={`${s.sectionLockup} ${s.reveal}`} data-reveal="" style={{ marginBottom: 52 }}>
            <p className={s.kickerLabel} style={{ marginBottom: 14 }}>04 — Alcance</p>
            <h2 className={s.sectionTitle}>Qué incluye<br /><em>esta etapa.</em></h2>
          </div>

          <div className={`${s.reveal} p-grid2`} data-reveal="" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'var(--linea)', marginBottom: 32 }}>
            {/* Incluido */}
            <div className="p-pad" style={{ padding: '40px', background: 'rgba(47,123,246,0.04)', borderTop: '2px solid var(--azul)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
                <span style={{ width: 8, height: 8, background: 'var(--azul)', borderRadius: 1 }} />
                <p style={{ margin: 0, fontFamily: 'var(--f-mono), monospace', fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--azul-luz)' }}>Incluido</p>
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {INCLUIDO.map(item => (
                  <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <Check size={12} color="var(--azul)" style={{ flexShrink: 0, marginTop: 4 }} />
                    <span style={{ fontFamily: 'var(--f-texto), Spectral, serif', fontSize: 14, lineHeight: 1.65, color: 'rgba(242,239,233,0.75)' }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Fuera de etapa */}
            <div className="p-pad" style={{ padding: '40px', background: '#050505', borderTop: '2px solid var(--linea)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
                <span style={{ width: 8, height: 8, background: 'var(--ceniza)', borderRadius: 1 }} />
                <p style={{ margin: 0, fontFamily: 'var(--f-mono), monospace', fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--ceniza)' }}>Fuera de esta etapa</p>
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {NO_INCLUIDO.map(item => (
                  <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <span style={{ width: 12, height: 12, flexShrink: 0, marginTop: 4, border: '1px solid rgba(138,138,138,0.3)', borderRadius: 2 }} />
                    <span style={{ fontFamily: 'var(--f-texto), Spectral, serif', fontSize: 14, lineHeight: 1.65, color: 'rgba(242,239,233,0.3)', textDecoration: 'none' }}>{item}</span>
                  </li>
                ))}
              </ul>
              <p style={{ marginTop: 28, fontFamily: 'var(--f-texto), Spectral, serif', fontStyle: 'italic', fontSize: 13, color: 'var(--ceniza)', borderTop: '1px solid var(--linea)', paddingTop: 20 }}>Disponibles como ampliación posterior.</p>
            </div>
          </div>

          {/* Qué no hace — límites */}
          <div className={`${s.reveal} p-limits`} data-reveal="" style={{ padding: '36px 40px', border: '1px solid var(--linea)', background: 'rgba(239,68,68,0.02)', borderTop: '2px solid rgba(239,68,68,0.2)' }}>
            <p style={{ margin: '0 0 20px', fontFamily: 'var(--f-mono), monospace', fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'rgba(239,68,68,0.5)' }}>El agente no hace esto — declarado por diseño</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px,1fr))', gap: 12 }}>
              {LIMITES.map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <X size={11} color="rgba(239,68,68,0.5)" style={{ flexShrink: 0, marginTop: 3 }} />
                  <span style={{ fontFamily: 'var(--f-texto), Spectral, serif', fontSize: 13, color: 'rgba(242,239,233,0.45)', lineHeight: 1.6 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 05 Inversión ── */}
      <section className={s.section} ref={setRef('inversion')}>
        <div className={s.inner}>
          <div className={`${s.sectionLockup} ${s.reveal}`} data-reveal="" style={{ marginBottom: 52 }}>
            <p className={s.kickerLabel} style={{ marginBottom: 14 }}>05 — Inversión</p>
            <h2 className={s.sectionTitle}>Precio claro,<br /><em>sin sorpresas.</em></h2>
          </div>

          <div className={`${s.reveal} p-grid2`} data-reveal="" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'var(--linea)' }}>
            {/* Desarrollo */}
            <div className="p-inv-pad" style={{ padding: '52px 48px', background: '#050505', borderTop: '2px solid var(--linea)' }}>
              <p style={{ margin: '0 0 8px', fontFamily: 'var(--f-mono), monospace', fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--ceniza)' }}>Pago único</p>
              <div style={{ fontFamily: 'var(--f-display), Montserrat, sans-serif', fontWeight: 900, fontSize: 'clamp(44px,6vw,72px)', letterSpacing: '-0.05em', color: 'var(--hueso)', lineHeight: 1, marginBottom: 8 }}>1.500</div>
              <div style={{ fontFamily: 'var(--f-mono), monospace', fontSize: 14, letterSpacing: '0.08em', color: 'var(--ceniza)', marginBottom: 32 }}>USD · Desarrollo e implementación</div>
              <div style={{ padding: '16px 0', borderTop: '1px solid var(--linea)', marginBottom: 24 }}>
                <p style={{ margin: 0, fontFamily: 'var(--f-mono), monospace', fontSize: 10, letterSpacing: '0.14em', color: 'rgba(242,239,233,0.5)' }}>50% al confirmar · 50% contra entrega</p>
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {INCLUIDO.slice(0, 5).map(item => (
                  <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <Check size={11} color="var(--azul)" style={{ flexShrink: 0, marginTop: 4 }} />
                    <span style={{ fontFamily: 'var(--f-texto), Spectral, serif', fontSize: 13, lineHeight: 1.65, color: 'rgba(242,239,233,0.6)' }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Mensual */}
            <div className="p-inv-pad" style={{ padding: '52px 48px', background: 'rgba(47,123,246,0.05)', borderTop: '2px solid var(--azul)', position: 'relative' }}>
              <p style={{ margin: '0 0 8px', fontFamily: 'var(--f-mono), monospace', fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--azul)' }}>Mensual desde producción</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
                <div style={{ fontFamily: 'var(--f-display), Montserrat, sans-serif', fontWeight: 900, fontSize: 'clamp(44px,6vw,72px)', letterSpacing: '-0.05em', color: 'var(--hueso)', lineHeight: 1 }}>150</div>
                <span style={{ fontFamily: 'var(--f-mono), monospace', fontSize: 16, color: 'var(--ceniza)' }}>/mes</span>
              </div>
              <div style={{ fontFamily: 'var(--f-mono), monospace', fontSize: 14, letterSpacing: '0.08em', color: 'var(--ceniza)', marginBottom: 32 }}>USD · Operación y mantenimiento</div>
              <div style={{ padding: '16px 0', borderTop: '1px solid rgba(47,123,246,0.2)', marginBottom: 24 }}>
                <p style={{ margin: 0, fontFamily: 'var(--f-mono), monospace', fontSize: 10, letterSpacing: '0.14em', color: 'rgba(242,239,233,0.5)' }}>Sin cargos sorpresa · Se revisa si el volumen crece</p>
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {['Disponibilidad 24 horas.', 'Infraestructura de voz y procesamiento.', 'Alojamiento de base de datos y paneles.', 'Monitoreo y ajustes de conocimiento.', 'Soporte al equipo en uso del panel.'].map(item => (
                  <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <Check size={11} color="var(--azul-luz)" style={{ flexShrink: 0, marginTop: 4 }} />
                    <span style={{ fontFamily: 'var(--f-texto), Spectral, serif', fontSize: 13, lineHeight: 1.65, color: 'rgba(242,239,233,0.7)' }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── 06 Proceso ── */}
      <section className={`${s.section} ${s.sectionAlt}`} ref={setRef('proceso')}>
        <div className={s.inner}>
          <div className={`${s.sectionLockup} ${s.reveal}`} data-reveal="" style={{ marginBottom: 64 }}>
            <p className={s.kickerLabel} style={{ marginBottom: 14 }}>06 — Proceso de implementación</p>
            <h2 className={s.sectionTitle}>Cuatro etapas,<br /><em>1 a 2 semanas.</em></h2>
          </div>

          {/* Timeline horizontal */}
          <div className={`${s.reveal} p-grid4`} data-reveal="" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: 'var(--linea)', position: 'relative', marginBottom: 56 }}>
            {ETAPAS_IMPL.map((e, i) => (
              <div key={e.n} style={{ background: '#050505', padding: '36px 28px', position: 'relative' }}>
                {/* Connector line */}
                {i < ETAPAS_IMPL.length - 1 && (
                  <div style={{ position: 'absolute', top: 52, right: -1, width: 1, height: 1, background: 'transparent' }} />
                )}
                {/* Number */}
                <div style={{
                  width: 44, height: 44, border: '1px solid var(--azul)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 24, background: 'rgba(47,123,246,0.06)',
                }}>
                  <span style={{ fontFamily: 'var(--f-mono), monospace', fontSize: 11, color: 'var(--azul-luz)', letterSpacing: '0.1em' }}>{e.n}</span>
                </div>
                <h3 style={{ margin: '0 0 12px', fontFamily: 'var(--f-display), Montserrat, sans-serif', fontWeight: 700, fontSize: 15, color: 'var(--hueso)', letterSpacing: '-0.02em' }}>{e.t}</h3>
                <p style={{ margin: 0, fontFamily: 'var(--f-texto), Spectral, serif', fontWeight: 300, fontSize: 13, lineHeight: 1.75, color: 'var(--ceniza)' }}>{e.d}</p>
              </div>
            ))}
          </div>

          {/* Qué necesitamos */}
          <div className={`${s.sectionLockup} ${s.reveal}`} data-reveal="" style={{ marginBottom: 32 }}>
            <p className={s.kickerLabel} style={{ marginBottom: 14 }}>Qué necesitamos de Dax para ejecutar</p>
            <p className={s.sectionSub}>Al preparar el agente solo pudo leerse la página principal del sitio. Con el Help Center cargado, el agente resuelve muchos más casos solo.</p>
          </div>
          <div className={`${s.reveal}`} data-reveal="" style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--linea)' }}>
            {NECESITAMOS.map((item) => (
              <div key={item.n} style={{ display: 'grid', gridTemplateColumns: '56px 1fr', background: '#050505', gap: 0 }}>
                <div style={{ padding: '22px 16px', borderRight: '1px solid var(--linea)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontFamily: 'var(--f-mono), monospace', fontSize: 11, color: 'var(--azul)', letterSpacing: '0.16em' }}>{item.n}</span>
                </div>
                <div className="p-nec-pad" style={{ padding: '22px 32px' }}>
                  <p style={{ margin: '0 0 4px', fontFamily: 'var(--f-display), Montserrat, sans-serif', fontWeight: 700, fontSize: 14, color: 'var(--hueso)' }}>{item.t}</p>
                  <p style={{ margin: 0, fontFamily: 'var(--f-texto), Spectral, serif', fontSize: 13, lineHeight: 1.7, color: 'var(--ceniza)' }}>{item.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 07 Roadmap ── */}
      <section className={s.section}>
        <div className={s.inner}>
          <div className={`${s.sectionLockup} ${s.reveal}`} data-reveal="" style={{ marginBottom: 52 }}>
            <p className={s.kickerLabel} style={{ marginBottom: 14 }}>07 — Próximos pasos naturales</p>
            <h2 className={s.sectionTitle}>Una vez operando,<br /><em>estas son las ampliaciones.</em></h2>
            <p className={s.sectionSub}>Pasá el cursor para ver el detalle de cada ampliación.</p>
          </div>
          <div className={`${s.reveal}`} data-reveal="">
            <ElasticRoadmap items={ROADMAP} />
          </div>
        </div>
      </section>

      {/* ── Demo del agente ── */}
      <section style={{ position: 'relative', height: 520, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', overflow: 'hidden' }}>
        <Image src="/galeria10.png" alt="" fill sizes="100vw" style={{ objectFit: 'cover', filter: 'brightness(0.22) saturate(0.5)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(47,123,246,0.18) 0%, rgba(5,5,5,0.7) 70%)' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 640, padding: '0 40px' }}>
          <div className={`${s.reveal}`} data-reveal="">
            <div style={{ width: 72, height: 72, margin: '0 auto 32px', border: '1px solid rgba(47,123,246,0.5)', background: 'rgba(47,123,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(12px)' }}>
              <Mic size={26} color="var(--azul-luz)" />
            </div>
            <p className={s.kickerLabel} style={{ marginBottom: 16 }}>Demo en vivo</p>
            <h2 style={{ margin: '0 0 20px', fontFamily: 'var(--f-display), Montserrat, sans-serif', fontWeight: 900, fontSize: 'clamp(30px,4vw,52px)', letterSpacing: '-0.04em', color: 'var(--hueso)', lineHeight: 1.08 }}>
              Hablá con el agente<br /><em style={{ fontFamily: 'var(--f-texto), Spectral, serif', fontWeight: 400, fontStyle: 'italic', color: 'var(--azul-luz)' }}>ahora mismo.</em>
            </h2>
            <p style={{ margin: '0 0 40px', fontFamily: 'var(--f-texto), Spectral, serif', fontSize: 16, lineHeight: 1.75, color: 'rgba(242,239,233,0.65)' }}>
              Este es el mismo agente que se integraría en la web de Dax. Podés escuchar cómo habla, qué preguntas hace y cómo maneja un caso de soporte real.
            </p>
            <DemoButton />
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={s.ctaBand}>
        <div className={s.inner}>
          {accepted ? (
            <div className={`${s.reveal}`} data-reveal="" style={{ maxWidth: 540, margin: '0 auto', padding: '56px 48px', background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.2)', textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, margin: '0 auto 28px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Check size={22} color="#22c55e" />
              </div>
              <h2 className={s.ctaTitle} style={{ fontSize: 'clamp(26px,4vw,40px)' }}>Propuesta aceptada</h2>
              <p className={s.ctaSub}>El equipo de Areté fue notificado. Te contactamos en las próximas horas para coordinar inicio, primer pago y kickoff.</p>
            </div>
          ) : (
            <div className={`${s.reveal}`} data-reveal="">
              <h2 className={s.ctaTitle}>¿Arrancamos?</h2>
              <p className={s.ctaSub}>Confirmación por escrito y el 50% inicial. Con eso arranca la Etapa 1 y corre el plazo de entrega.</p>
              <div className={s.ctaRow}>
                <button
                  onClick={handleAccept}
                  disabled={accepting || pending}
                  className={s.btnPrimary}
                  style={{ fontSize: 12, padding: '18px 48px', cursor: accepting || pending ? 'wait' : 'pointer', opacity: accepting || pending ? 0.6 : 1 }}
                >
                  {accepting || pending ? 'Enviando…' : 'Acepto la propuesta'}
                  {!accepting && !pending && <ArrowRight size={14} />}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export function DaxCardsClient({ unlocked }: { unlocked: boolean }) {
  if (!unlocked) return <PasswordGate />;
  return <ProposalContent />;
}
