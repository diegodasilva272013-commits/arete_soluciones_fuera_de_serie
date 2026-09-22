'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowRight, ChevronDown, Check, X, Mic } from 'lucide-react';
import { checkPassword, notifyAcceptance } from './actions';
import AnimatedGradient from '@/components/ui/animated-gradient';
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
      <div>
        <p className={s.bandBody} style={{ marginBottom: 24 }}>Un asistente de voz integrado en la web de Dax. Su comportamiento está diseñado, no improvisado.</p>
        <ul className={s.panelList} style={{ padding: 0 }}>
          {['Escucha primero. No abre pidiendo datos personales: abre pidiendo que la persona cuente qué le pasa.',
            'Diagnostica corto. Un máximo de tres preguntas para entender producto, plataforma y qué intentó la persona.',
            'Una pregunta por turno. Nunca encadena preguntas ni lee listas largas.',
            'Habla claro. Español rioplatense, tono cálido, respuestas de dos oraciones.',
            'Dice que es una IA si se lo preguntan. No simula ser una persona.',
            'Maneja los casos sensibles con cuidado — tono cuidadoso y prioridad alta.'
          ].map(item => (
            <li key={item} className={s.panelItem}><span className={s.panelDot} aria-hidden="true" />{item}</li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    id: 'resuelve', label: '3.2 Resuelve',
    content: (
      <div>
        <p className={s.bandBody} style={{ marginBottom: 24 }}>Con la información de Dax en su base, el agente resuelve sin intervención humana:</p>
        <ul className={s.panelList} style={{ padding: 0 }}>
          {['A qué plataforma corresponde cada producto (perfil personal, mascota, tienda, menú digital).',
            'Dónde se activa una tarjeta y dónde está la sección de soporte del sitio.',
            'Qué productos existen y qué hace cada uno.',
            'En qué países opera Dax y dónde se compra cada producto.',
            'Compatibilidad general de la aplicación wallet.',
            'Estado de un ticket ya abierto, consultando el sistema en vivo.'
          ].map(item => (
            <li key={item} className={s.panelItem}><span className={s.panelDot} aria-hidden="true" />{item}</li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    id: 'deriva', label: '3.3 Deriva',
    content: (
      <div>
        <p className={s.bandBody} style={{ marginBottom: 8 }}>Todo lo que requiere verificar algo real o tomar una decisión comercial se deriva a ticket. Es una decisión de diseño, no una carencia.</p>
        <p className={s.bandPull} style={{ marginBottom: 24 }}>Un dato inventado en soporte hace perder tiempo y plata al cliente, y desgasta la marca.</p>
        <ul className={s.panelList} style={{ padding: 0 }}>
          {['Tarjetas que no leen o que el celular no reconoce.',
            'Problemas de cuenta, acceso o edición de perfil.',
            'Reclamos de garantía, devoluciones y reembolsos.',
            'Pedidos demorados, envíos y direcciones.',
            'Cualquier consulta cuya respuesta no esté confirmada en su base.'
          ].map(item => (
            <li key={item} className={s.panelItem}><span className={s.panelDot} aria-hidden="true" />{item}</li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    id: 'ticket', label: '3.4 El ticket',
    content: (
      <div>
        <p className={s.bandBody} style={{ marginBottom: 24 }}>Cuando el agente abre un ticket, captura un registro completo y uniforme. El cliente se va con un número dictado y confirmado.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--linea)' }}>
          {[
            ['Nombre y contacto', 'Poder responder'],
            ['Canal preferido (correo / WhatsApp / tel.)', 'Avisar por donde el cliente quiere'],
            ['País', 'Derivar al equipo correcto'],
            ['Producto', 'Saber qué línea genera el caso'],
            ['Tipo de problema', 'Clasificar: activación, NFC, cuenta, pedido, garantía…'],
            ['Descripción del problema', 'El relato del cliente, sin interpretación'],
            ['Qué intentó la persona', 'Evitar que el equipo repita pasos ya hechos'],
            ['Número de pedido', 'Rastrear la compra'],
            ['Urgencia', 'Priorizar la cola'],
          ].map(([dato, para]) => (
            <div key={dato} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'var(--linea)' }}>
              <div style={{ background: '#050505', padding: '10px 16px' }}>
                <span style={{ fontFamily: 'var(--f-mono), monospace', fontSize: 11, color: 'var(--hueso)' }}>{dato}</span>
              </div>
              <div style={{ background: 'rgba(47,123,246,0.03)', padding: '10px 16px' }}>
                <span style={{ fontFamily: 'var(--f-texto), Spectral, serif', fontSize: 13, fontStyle: 'italic', color: '#B4B1AB' }}>{para}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'interfaz', label: '3.5 Interfaz',
    content: (
      <div>
        <p className={s.bandBody} style={{ marginBottom: 24 }}>Una interfaz simple y funcional, pensada para que el equipo de Dax trabaje rápido:</p>
        <ul className={s.panelList} style={{ padding: 0 }}>
          {['Cola de tickets con estado: abierto / en revisión / resuelto.',
            'Filtros por estado, producto, tipo de problema y urgencia.',
            'Detalle de cada caso con todos los datos capturados, la transcripción y la grabación.',
            'Cambio de estado y carga de una nota pública: lo que el cliente va a leer como respuesta.'
          ].map(item => (
            <li key={item} className={s.panelItem}><span className={s.panelDot} aria-hidden="true" />{item}</li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    id: 'aviso', label: '3.6 Aviso auto',
    content: (
      <div>
        <p className={s.bandBody} style={{ marginBottom: 16 }}>Cuando el equipo marca un ticket como resuelto, el sistema avisa automáticamente al cliente por el canal que eligió — con el número de ticket y la nota pública.</p>
        <p className={s.bandPull}>El círculo se cierra sin que nadie tenga que acordarse de escribirle.</p>
      </div>
    ),
  },
  {
    id: 'panel', label: '3.7 Panel',
    content: (
      <div>
        <p className={s.bandBody} style={{ marginBottom: 24 }}>Todo lo que el agente hace queda visible. Sirve para dos cosas: auditar qué dice el agente, y leer el negocio.</p>
        <ul className={s.panelList} style={{ padding: 0 }}>
          {['Listado de conversaciones con fecha, hora y duración.',
            'Transcripción completa de cada conversación.',
            'Grabación de audio de cada conversación.',
            'Datos capturados en cada contacto.',
            'Si derivó en ticket y en cuál.',
            'Qué producto genera más consultas y en qué horario.'
          ].map(item => (
            <li key={item} className={s.panelItem}><span className={s.panelDot} aria-hidden="true" />{item}</li>
          ))}
        </ul>
      </div>
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

// ── ElasticSolucion — horizontal elastic panels ────────────────────────────────
function ElasticSolucion({ items }: { items: typeof TABS_SOLUCION }) {
  const [activeId, setActiveId] = useState(items[0].id);

  return (
    <div style={{ display: 'flex', gap: 1, background: 'var(--linea)', minHeight: 440, alignItems: 'stretch' }}>
      {items.map(item => {
        const isActive = activeId === item.id;
        return (
          <div
            key={item.id}
            onMouseEnter={() => setActiveId(item.id)}
            onClick={() => setActiveId(item.id)}
            style={{
              flex: isActive ? 5 : 1,
              transition: 'flex 0.65s cubic-bezier(0.25,1,0.5,1), background 0.3s, border-color 0.3s',
              background: isActive ? 'rgba(47,123,246,0.05)' : '#050505',
              borderLeft: `2px solid ${isActive ? 'var(--azul)' : 'transparent'}`,
              cursor: 'pointer',
              overflow: 'hidden',
              position: 'relative',
              minWidth: 0,
            }}
          >
            {/* Collapsed: vertical label */}
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: isActive ? 0 : 1,
              transition: 'opacity 0.2s',
              pointerEvents: 'none',
            }}>
              <span style={{
                writingMode: 'vertical-rl',
                textOrientation: 'mixed',
                transform: 'rotate(180deg)',
                fontFamily: 'var(--f-mono), monospace',
                fontSize: 9,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'rgba(242,239,233,0.28)',
                whiteSpace: 'nowrap',
              }}>{item.label}</span>
            </div>

            {/* Expanded: content */}
            <div style={{
              padding: '36px 40px',
              opacity: isActive ? 1 : 0,
              transform: isActive ? 'translateX(0)' : 'translateX(10px)',
              transition: 'opacity 0.35s 0.18s, transform 0.35s 0.18s',
              minWidth: 0,
            }}>
              <p style={{
                fontFamily: 'var(--f-mono), monospace',
                fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase',
                color: 'var(--azul)', marginBottom: 20,
              }}>{item.label}</p>
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'var(--linea)', marginBottom: 1 }}>
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
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'var(--linea)', cursor: 'default' }}
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
    start(async () => { await notifyAcceptance(); setAccepted(true); setAccepting(false); });
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

      {/* ── Barra de secciones (bajo el CorpHeader) ── */}
      <nav style={{
        position: 'sticky', top: 68, zIndex: 100,
        display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap',
        padding: '0 32px', height: 44,
        background: 'rgba(5,5,5,0.96)',
        borderBottom: '1px solid var(--linea)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}>
        {NAV_ITEMS.map(({ id, label }) => (
          <button key={id} onClick={() => scrollTo(id)} style={{
            padding: '4px 14px', background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--f-mono), monospace', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
            color: activeNav === id ? 'var(--azul-luz)' : 'rgba(242,239,233,0.4)',
            transition: 'color 0.2s',
            borderBottom: activeNav === id ? '2px solid var(--azul)' : '2px solid transparent',
          }}>{label}</button>
        ))}
        <span style={{ marginLeft: 'auto', padding: '3px 10px', fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', fontFamily: 'var(--f-mono), monospace', color: 'var(--azul-luz)', border: '1px solid rgba(92,154,255,0.22)' }}>
          Confidencial
        </span>
      </nav>

      {/* ── Hero ── */}
      <section className={s.pageHero} style={{ paddingTop: 80, paddingBottom: 100, isolation: 'isolate' }}>
        <AnimatedGradient config={{ preset: 'Prism' }} />
        <div className={s.pageHeroInner} style={{ position: 'relative', zIndex: 1 }}>
          <div className={`${s.kicker} ${s.reveal}`} data-reveal="">
            <span className={s.kickerLine} />
            <span className={s.kickerLabel}>Dax Cards — daxcards.com · Septiembre 2026</span>
          </div>
          <h1 className={`${s.heroTitle} ${s.reveal} ${s.revealDelay1}`} data-reveal="">
            Soporte por voz,<br /><em>24 horas al día.</em>
          </h1>
          <p className={`${s.heroSub} ${s.reveal} ${s.revealDelay2}`} data-reveal="">
            Dax vende tarjetas NFC y perfiles digitales. Cada venta abre la puerta a una consulta posterior. Esta propuesta cubre un agente de IA que atiende por voz, resuelve en el momento lo que puede, y convierte todo lo demás en un ticket estructurado.
          </p>

          {/* Métricas + CTAs */}
          <div className={`${s.reveal} ${s.revealDelay3}`} data-reveal="" style={{ marginTop: 40 }}>
            {/* Métricas */}
            <div style={{ display: 'flex', gap: 1, background: 'var(--linea)', marginBottom: 24, flexWrap: 'wrap' }}>
              {[
                { val: 'USD 1.500', label: 'Desarrollo', sub: '50% al inicio · 50% al entregar' },
                { val: 'USD 150', label: 'Por mes', sub: 'Operación y mantenimiento' },
                { val: '1–2 sem.', label: 'Entrega', sub: 'Desde la confirmación' },
              ].map(({ val, label, sub }) => (
                <div key={label} style={{ padding: '20px 32px', background: 'rgba(5,5,5,0.88)', backdropFilter: 'blur(8px)', flex: '1 1 160px' }}>
                  <div style={{ fontFamily: 'var(--f-display), Montserrat, sans-serif', fontWeight: 900, fontSize: 'clamp(20px,2.5vw,28px)', letterSpacing: '-0.05em', color: 'var(--hueso)' }}>{val}</div>
                  <div style={{ fontFamily: 'var(--f-mono), monospace', fontSize: 9, letterSpacing: '0.26em', textTransform: 'uppercase', color: 'var(--azul-luz)', margin: '5px 0 3px' }}>{label}</div>
                  <div style={{ fontFamily: 'var(--f-mono), monospace', fontSize: 9, color: 'var(--ceniza)' }}>{sub}</div>
                </div>
              ))}
            </div>

            {/* Botones CTA */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <button onClick={() => scrollTo('inversion')} className={s.btnPrimary}>
                Ver inversión <ArrowRight size={13} />
              </button>
              <DemoButton />
            </div>
          </div>
        </div>
      </section>

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
      <section className={s.section} ref={setRef('seguridad')}>
        <div className={s.inner}>
          <div className={s.splitGrid}>
            <div className={`${s.sectionLockup} ${s.reveal}`} data-reveal="">
              <p className={s.kickerLabel} style={{ marginBottom: 14 }}>03 — Seguridad</p>
              <h2 className={s.sectionTitle}>Diseñado para<br /><em>no filtrar nada.</em></h2>
              <p className={s.sectionSub}>El agente no accede a cuentas ni a sistemas internos de Dax — con lo cual no abre ninguna superficie de riesgo sobre ellos.</p>
            </div>
            <div className={`${s.reveal} ${s.revealDelay1}`} data-reveal="">
              {SEGURIDAD_ITEMS.map(([titulo, desc]) => (
                <Accordion key={titulo} title={titulo}>
                  <p style={{ margin: 0, fontFamily: 'var(--f-texto), Spectral, serif', fontSize: 14, lineHeight: 1.75, color: '#B4B1AB', paddingLeft: 0 }}>{desc}</p>
                </Accordion>
              ))}
            </div>
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

          <div className={`${s.reveal}`} data-reveal="" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'var(--linea)', marginBottom: 32 }}>
            {/* Incluido */}
            <div style={{ padding: '40px', background: 'rgba(47,123,246,0.04)', borderTop: '2px solid var(--azul)' }}>
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
            <div style={{ padding: '40px', background: '#050505', borderTop: '2px solid var(--linea)' }}>
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
          <div className={`${s.reveal}`} data-reveal="" style={{ padding: '36px 40px', border: '1px solid var(--linea)', background: 'rgba(239,68,68,0.02)', borderTop: '2px solid rgba(239,68,68,0.2)' }}>
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

          <div className={`${s.reveal}`} data-reveal="" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'var(--linea)' }}>
            {/* Desarrollo */}
            <div style={{ padding: '52px 48px', background: '#050505', borderTop: '2px solid var(--linea)' }}>
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
            <div style={{ padding: '52px 48px', background: 'rgba(47,123,246,0.05)', borderTop: '2px solid var(--azul)', position: 'relative' }}>
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
          <div className={`${s.reveal}`} data-reveal="" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: 'var(--linea)', position: 'relative', marginBottom: 56 }}>
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
                <div style={{ padding: '22px 32px' }}>
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
      <section className={`${s.section} ${s.sectionAlt}`} style={{ textAlign: 'center' }}>
        <div className={s.inner} style={{ maxWidth: 680 }}>
          <div className={`${s.reveal}`} data-reveal="">
            <div style={{ width: 64, height: 64, margin: '0 auto 28px', border: '1px solid rgba(47,123,246,0.4)', background: 'rgba(47,123,246,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Mic size={22} color="var(--azul-luz)" />
            </div>
            <p className={s.kickerLabel} style={{ marginBottom: 16 }}>Demo en vivo</p>
            <h2 style={{ margin: '0 0 20px', fontFamily: 'var(--f-display), Montserrat, sans-serif', fontWeight: 900, fontSize: 'clamp(28px,4vw,44px)', letterSpacing: '-0.04em', color: 'var(--hueso)', lineHeight: 1.1 }}>
              Hablá con el agente<br /><em style={{ fontFamily: 'var(--f-texto), Spectral, serif', fontWeight: 400, fontStyle: 'italic', color: 'var(--azul-luz)' }}>ahora mismo.</em>
            </h2>
            <p style={{ margin: '0 0 36px', fontFamily: 'var(--f-texto), Spectral, serif', fontSize: 16, lineHeight: 1.7, color: 'rgba(242,239,233,0.6)' }}>
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
