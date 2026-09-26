'use client';

import { useState, useTransition, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowRight, ChevronDown, Check, X, Mic, Zap, Database, Radio, Volume2, VolumeX } from 'lucide-react';
import { checkPassword, notifyAcceptance } from './actions';
import AnimatedGradient from '@/components/ui/animated-gradient';
import { VolumetricStudio } from '@/components/ui/volumetric-studio';
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

// ── Estilos locales (calculadora + responsive) ────────────────────────────────
const LOCAL_CSS = `
@keyframes propShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}
.pvRange{-webkit-appearance:none;appearance:none;width:100%;height:2px;background:rgba(242,239,233,.16);outline:none;margin:14px 0 0}
.pvRange::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:16px;height:16px;background:#2F7BF6;cursor:pointer;border:none;clip-path:polygon(50% 0%,100% 50%,50% 100%,0% 50%)}
.pvRange::-moz-range-thumb{width:16px;height:16px;background:#2F7BF6;cursor:pointer;border:none;border-radius:0}
.pvCalcGrid{display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:start}
.pvGrid2{display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:start}
.pvSplitTight{display:grid;grid-template-columns:1fr 1fr;gap:2px}
.pvHoverRow{border-left:2px solid transparent;transition:border-color .2s,background .2s}
.pvHoverRow:hover{border-left-color:#2F7BF6;background:rgba(47,123,246,.03)}
.pv-hero-clear{padding-top:60px}
@media (max-width: 768px) {
  .pv-hero-clear { padding-top: 340px !important; }
  .p-nav { overflow-x: auto !important; flex-wrap: nowrap !important; -webkit-overflow-scrolling: touch; scrollbar-width: none; padding: 0 12px !important; }
  .p-nav::-webkit-scrollbar { display: none; }
  .p-nav-fade { display: block !important; }
  .p-grid2, .pvGrid2, .pvCalcGrid { grid-template-columns: 1fr !important; height: auto !important; gap: 20px !important; }
  .pvSplitTight { grid-template-columns: 1fr !important; gap: 1px !important; }
  .p-pad { padding: 28px 20px !important; }
  .p-inv-pad { padding: 36px 20px !important; }
  .p-grid5 { grid-template-columns: 1fr 1fr !important; }
  .p-cmp-row { grid-template-columns: 1fr !important; }
  .p-cmp-row > div:first-child { border-bottom: 1px solid var(--linea); }
  .p-cmp-head { grid-template-columns: 1fr !important; }
  .p-nec-pad { padding: 16px 14px !important; }
  .p-hero-metrics { max-width: 100% !important; margin-left: 0 !important; margin-right: 0 !important; }
}
`;

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
          <h1 style={{ margin: 0, fontFamily: 'var(--f-display), Montserrat, sans-serif', fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--hueso)' }}>Providus S.A.</h1>
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
const COMPARACION: { antes: string; despues: string }[] = [
  { antes: 'El voucher de papel viaja del evento a la oficina en un bolso o un auto', despues: 'El registro llega a la oficina en el momento en que la persona se inscribe' },
  { antes: 'Alguien transcribe los vouchers a mano, con errores de lectura', despues: 'No hay carga: el dato se validó al escribirse y ya está en el sistema' },
  { antes: 'Vouchers que se traspapelan, se mojan o nunca se llaman — y nadie se entera', despues: 'Ningún registro se pierde y se ve cuál sigue sin trabajar' },
  { antes: 'El reparto a vendedores es manual y sin criterio registrado', despues: 'Asignación automática por zona, provincia, región o reparto parejo' },
  { antes: 'Nadie sabe cuánto tarda un vendedor en llamar', despues: 'El tiempo se cronometra y, vencido el plazo, el contacto se reasigna solo' },
  { antes: 'No se puede responder qué evento rindió más ni por qué se pierde una venta', despues: 'Embudo completo por evento, promotora, agencia y vendedor, con motivos' },
  { antes: 'La conversación termina en el celular personal del vendedor', despues: 'La cartera y el historial quedan en la empresa, reasignables' },
  { antes: 'Hojas con nombre, dirección y teléfono circulando sin control', despues: 'Datos cifrados, acceso por rol y auditoría que nadie puede borrar' },
];

const CARAS = [
  { icon: Radio,    t: 'App móvil',    q: 'Promotoras en los eventos',          d: 'Carga sin señal, foto, consentimiento y envío automático.' },
  { icon: Database, t: 'Panel web',    q: 'Dirección, administración y ventas', d: 'Cada rol ve exclusivamente su alcance.' },
  { icon: Zap,      t: 'Agente de IA', q: 'Los interesados, 24 horas',          d: 'Atiende, califica, propone y cierra.' },
];

const TABS_M1 = [
  {
    id: 'nucleo', label: '3.1 Núcleo',
    intro: 'La base sobre la que se apoya todo lo demás. No se ve, pero es lo que hace que esto sea un sistema y no tres herramientas conectadas.',
    items: [
      'Base de datos única: una ficha por persona, con toda su historia en una sola línea de tiempo.',
      'Identidad y permisos: cada usuario tiene un rol, y el rol define qué puede ver y qué puede hacer.',
      'Auditoría inmutable: quién, qué, cuándo, desde qué IP y dispositivo, con el valor anterior y el nuevo.',
      'Motor de reglas: decide a qué vendedor va cada contacto y qué se dispara en cada momento.',
      'Capa de canales: correo, Instagram y WhatsApp enchufados al mismo sistema de mensajes.',
    ],
    tech: 'NestJS + PostgreSQL · TLS · cifrado en reposo y a nivel campo · control de acceso por roles (RBAC) · auditoría append-only encadenada · backups cifrados · monitoreo.',
  },
  {
    id: 'campo', label: '3.2 App de campo',
    intro: 'Aplicación instalada en las tablets y celulares que llevan las promotoras. Reemplaza el voucher de papel.',
    items: [
      'Login por promotora: cada registro queda asociado a una persona, un evento, un dispositivo y un horario.',
      'Formulario configurable: nombre, dirección, teléfono, correo e Instagram. Los campos los define Providus desde el panel.',
      'Validación al cargar: avisa en el momento si falta un campo o si un teléfono tiene formato incorrecto.',
      'Foto del participante con la promotora, con marco de marca de Providus.',
      'Consentimiento firmado con el dedo, para el uso de datos y de imagen.',
      'Funciona sin señal: guarda los registros cifrados y los envía solos al recuperar la conexión.',
      'Autoregistro por QR: el propio interesado se carga desde su celular cuando hay más gente de la que se puede atender de a una.',
    ],
    tech: 'React Native (Android e iOS) · base local cifrada AES-256 con SQLCipher · claves en Keystore y Keychain · cola de sincronización con reintentos · enrolamiento y revocación remota de dispositivos.',
  },
  {
    id: 'envios', label: '3.3 Envíos',
    intro: 'Al terminar la carga, la persona recibe su foto y el mensaje de bienvenida de Providus, con la información de la empresa.',
    items: [
      'Por correo: siempre y automático. Sale al tocar enviar, con la foto adjunta, sin que la persona haga nada.',
      'Por Instagram: la tablet muestra un código. Al escanearlo se abre el chat de Providus con el mensaje ya escrito.',
      'La persona toca enviar y recibe la foto al instante, a cualquier hora, sin nadie del otro lado.',
      'Beneficio adicional: para escribir, entra al perfil de Providus. La cuenta gana visibilidad en cada evento, sin pauta.',
    ],
    tech: 'Instagram no permite que una empresa inicie una conversación con quien nunca le escribió; sí permite responder con imágenes dentro de las 24 h posteriores a su mensaje. Por eso el circuito está diseñado para que sea la persona quien escribe primero, con un solo toque.',
  },
  {
    id: 'operaciones', label: '3.4 Operaciones',
    intro: 'El panel web desde donde la oficina administra todo el sistema.',
    items: [
      'Registros en tiempo real: la oficina ve entrar los datos mientras el evento ocurre.',
      'Bandeja central de interesados: todo lo que entró, asignado y sin asignar, en un solo lugar.',
      'Altas, bajas y modificaciones de interesados, eventos, usuarios, dispositivos y agencias.',
      'Detección de duplicados, para no llamar dos veces a la misma persona.',
      'Asignación automática por zona, provincia, región, agencia o reparto parejo.',
      'Exportaciones controladas: solo roles autorizados, y cada una queda registrada.',
      'Baja remota de dispositivos perdidos o robados, con un clic.',
    ],
    tech: 'Next.js · acceso con usuario, contraseña y segundo factor · actualización en tiempo real · sesiones con vencimiento automático.',
  },
  {
    id: 'vendedor', label: '3.5 Vendedor',
    intro: 'Cada vendedor trabaja su propia bandeja. No ve la cartera de los demás.',
    items: [
      'Bandeja personal con los contactos asignados y nada más.',
      'Notificación en el celular apenas se le asigna un contacto nuevo.',
      'Estados: nuevo, asignado, contactado, calificado, propuesta enviada, cerrado o perdido.',
      'Notas de cada conversación, para no perder el hilo entre llamadas.',
      'Contacto por WhatsApp desde el número oficial de Providus, con la conversación guardada y reasignable.',
    ],
    tech: '',
  },
  {
    id: 'performance', label: '3.6 Métricas',
    intro: 'La capa que convierte la operación en información para decidir. Permite ver no solo quién vende más, sino dónde falla cada uno.',
    items: [
      'Reloj de respuesta: el cronómetro arranca en la asignación. Vencido el plazo, el sistema reasigna solo.',
      'Motivos de pérdida tipificados: no contesta, precio, no le interesa, ya tiene otro plan, no califica.',
      'Por vendedor: tiempo hasta el primer intento, tasa de contacto, conversión por etapa y tiempo de ciclo.',
      'Por evento, promotora, agencia y zona: cuántos interesados dejó, cuántos se contactaron y cuántos cerraron.',
      'Tablero de dirección con el embudo completo y comparación entre períodos.',
    ],
    tech: 'Un vendedor puede contactar rápido a todos y no cerrar ninguno: tiene un problema de cierre. Otro puede cerrar bien lo que agarra pero responder a las cuatro horas: pierde por lento. Son dos problemas opuestos que en un ranking de ventas se ven igual.',
  },
];

const M1_IMAGES = ['/galeria1.png', '/galeria2.png', '/galeria3.png', '/galeria4.png', '/galeria5.png', '/galeria6.png'];

const AGENTE_HACE = [
  'Atiende las 24 horas por voz, WhatsApp y web. Un solo cerebro con tres enchufes, no tres bots distintos.',
  'Sabe con quién habla: si la persona ya está en el sistema, arranca con su historial. No vuelve a pedir lo que ya sabe.',
  'Califica y filtra antes de ocupar el tiempo de un vendedor.',
  'Informa los planes desde el catálogo cargado en el panel. No improvisa ni inventa.',
  'Arma la propuesta según lo que la persona puede pagar y se la envía por el canal donde conversa.',
  'Agenda con el vendedor cuando corresponde derivar.',
  'Cierra y cobra con link de pago. Cuando el pago entra, el estado de la ficha cambia solo.',
  'Deriva con contexto: le pasa al vendedor la conversación completa.',
];

const AGENTE_CONTROL: [string, string][] = [
  ['Base de conocimiento cerrada', 'El agente responde con información de Providus o no responde. No completa con conocimiento general de internet.'],
  ['Sin árbol de opciones', 'Conversa de verdad. No obliga a la persona a elegir entre menús.'],
  ['Declara que es una IA', 'Si se lo preguntan, lo dice. No simula ser una persona.'],
  ['Guion de pruebas ejecutado', 'No se aprueba hasta pasar todos los casos sin una cifra inventada ni una promesa fuera de lo cargado.'],
  ['Auditoría propia', 'Todo lo que registra queda igual que si lo hubiera cargado una persona: quién, cuándo y qué.'],
];

const SEGURIDAD: [string, string][] = [
  ['Cifrado en las tres etapas', 'La información está cifrada en el dispositivo, mientras viaja y cuando llega a la central. Los datos más sensibles tienen una capa adicional a nivel de campo.'],
  ['Si se pierde o roban un dispositivo', 'El equipo tiene bloqueo de pantalla; la app pide su propio acceso con PIN o huella; lo ya enviado fue borrado y lo pendiente está cifrado; la oficina da de baja el dispositivo desde el panel.'],
  ['Cada persona ve solo lo suyo', 'Superadministrador, administrador, supervisor de agencia, promotora y vendedor. La promotora carga pero no consulta la base. El vendedor ve únicamente sus contactos asignados.'],
  ['Auditoría que nadie puede borrar', 'Cada acción queda registrada con quién, qué, cuándo, desde qué conexión y desde qué dispositivo. No se puede modificar ni borrar, ni siquiera por un administrador.'],
  ['Doble verificación y sesiones que vencen', 'Para entrar al panel no alcanza la contraseña: se pide además un código. Si alguien deja el sistema abierto y se retira, la sesión se cierra sola.'],
  ['Exportaciones controladas', 'Sacar un listado es la vía más habitual de fuga de datos. Solo lo hacen roles autorizados y cada exportación queda registrada con quién y cuándo.'],
  ['Consentimiento registrado — Ley 25.326', 'Queda guardado que cada titular aceptó el uso de sus datos y de su imagen, con fecha, hora y dispositivo. El sistema acompaña el cumplimiento de la normativa argentina; las obligaciones propias de Providus corresponden a su área legal.'],
  ['Lo que no prometemos', 'Ningún sistema serio puede garantizar que es imposible de vulnerar. Lo que sí garantiza este diseño es que, aunque algo falle, los datos no queden legibles y todo quede registrado.'],
];

const INCLUIDO = [
  'Núcleo: base única, identidad y permisos, auditoría, motor de reglas y capa de canales.',
  'App de campo Android e iOS con funcionamiento sin señal, cifrado, foto, consentimiento y autoregistro por QR.',
  'Envío automático de la foto y el mensaje de bienvenida por correo e Instagram.',
  'Panel de operaciones con tiempo real, deduplicación y asignación automática.',
  'Espacio del vendedor con bandeja, estados, notas y WhatsApp desde el número oficial.',
  'Performance comercial: reloj de respuesta, reasignación, motivos de pérdida e indicadores.',
  'Agente de IA por voz, WhatsApp y web, con catálogo de planes, propuesta y cobros.',
  'Pruebas de seguridad, despliegue, capacitación y documentación.',
  '90 días de garantía y acompañamiento desde la puesta en producción.',
];

const NO_INCLUIDO = [
  'Dispositivos: las tablets y celulares los aporta Providus.',
  'Integración con el sistema con el que Providus administra hoy los planes.',
  'Migración de datos históricos de vouchers o planillas.',
  'Cuentas de Apple, Google, Meta, plataforma de voz y pasarela de pagos, a nombre de Providus.',
  'Costos de consumo: mensajes, minutos de voz, comisiones y servidores.',
  'Servicio mensual de monitoreo, más allá de los 90 días de garantía.',
];

const COSTOS_APARTE: [string, string][] = [
  ['Apple Developer', 'USD 99 por año'],
  ['Google Play', 'USD 25, pago único'],
  ['Servidores e infraestructura', 'Según volumen de uso'],
  ['Mensajes de WhatsApp', 'Tarifa de Meta por conversación'],
  ['Minutos de voz del agente', 'Tarifa de la plataforma por minuto'],
  ['Pasarela de pagos', 'Comisión por transacción'],
];

const ETAPAS_IMPL = [
  { n: '01', t: 'Definiciones', d: 'Se acuerdan los campos del formulario, las reglas de asignación, los roles y las agencias. Providus inicia los trámites de las cuentas.' },
  { n: '02', t: 'Construcción', d: 'Areté desarrolla el módulo completo, con avances visibles durante el proceso.' },
  { n: '03', t: 'Entorno de pruebas', d: 'Providus prueba el sistema con datos de prueba y solicita ajustes antes de que toque un dato real.' },
  { n: '04', t: 'Piloto', d: 'Uso en una situación real con un grupo reducido, antes de abrirlo a toda la red.' },
  { n: '05', t: 'Producción', d: 'Alta de todos los usuarios y dispositivos, capacitación y puesta en marcha completa.' },
];

const NECESITAMOS = [
  { n: '01', t: 'Definiciones del sistema', d: 'Campos del formulario, reglas de asignación, roles, agencias y plazo de respuesta exigido a los vendedores.' },
  { n: '02', t: 'Cuenta Apple Developer', d: 'Requiere número D-U-N-S y verificación de Apple: es el trámite más lento, conviene iniciarlo primero.' },
  { n: '03', t: 'Cuenta Google Play', d: 'Para distribuir la app en los dispositivos Android.' },
  { n: '04', t: 'Cuenta de Meta', d: 'WhatsApp Business e Instagram profesional vinculados, para los envíos automáticos.' },
  { n: '05', t: 'Material de marca', d: 'Logo y colores para el marco de las fotos y las piezas del sistema.' },
  { n: '06', t: 'Dispositivos', d: 'Tablets o celulares para las promotoras.' },
  { n: '07', t: 'Un responsable del proyecto', d: 'Una persona de Providus que coordine, valide y destrabe.' },
  { n: '08', t: 'Un evento real', d: 'Para el piloto, antes de la puesta en marcha completa.' },
];

const EVOLUCION = [
  { n: '01', t: 'Club de beneficios', d: 'La misma app con otro modo: el cliente con plan vigente ve su plan, los comercios adheridos y un monedero con el ahorro acumulado.' },
  { n: '02', t: 'Facturación a comercios', d: 'Emisión y cobranza desde la plataforma. Los datos que esa etapa necesita ya se guardan desde el primer día.' },
  { n: '03', t: 'Integración con el sistema de planes', d: 'Para que el estado del cliente y la imputación de beneficios a la cuota funcionen en tiempo real.' },
  { n: '04', t: 'Nuevas agencias y franquicias', d: 'Se suman creando usuarios y permisos. La plataforma nace preparada para crecer sin rehacerse.' },
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

// ── ElasticSolucion — desktop: elastic horizontal / mobile: elastic vertical ──
// Panel mobile que mide su propio contenido en vez de adivinar un maxHeight
// fijo — antes cortaba el texto de las pestañas más largas (ej. "Envíos"
// con la nota técnica de Instagram) porque el contenido real superaba el
// valor fijo que se usaba para animar la expansión.
function MobilePanelContent({ isActive, children }: { isActive: boolean; children: React.ReactNode }) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(2000);

  useEffect(() => {
    if (innerRef.current) setHeight(innerRef.current.scrollHeight);
  }, [isActive, children]);

  return (
    <div style={{ overflow: 'hidden', maxHeight: isActive ? height : 0, transition: 'max-height 0.5s cubic-bezier(0.25,1,0.5,1)' }}>
      <div ref={innerRef} style={{ padding: '14px 18px 20px', borderTop: '1px solid var(--linea)' }}>
        {children}
      </div>
    </div>
  );
}

function ElasticSolucion({ items }: { items: { id: string; label: string; content: React.ReactNode }[] }) {
  const [activeId, setActiveId] = useState(items[0].id);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--linea)' }}>
        {items.map((item, idx) => {
          const isActive = activeId === item.id;
          const img = M1_IMAGES[idx] ?? '/galeria1.png';
          return (
            <div key={item.id} style={{ background: '#050505' }}>
              <div onClick={() => setActiveId(item.id)} style={{ position: 'relative', height: isActive ? 180 : 48, transition: 'height 0.6s cubic-bezier(0.25,1,0.5,1)', overflow: 'hidden', cursor: 'pointer' }}>
                <Image src={img} alt={item.label} fill sizes="100vw" style={{ objectFit: 'cover', transform: isActive ? 'scale(1.02)' : 'scale(1.1)', transition: 'transform 1s cubic-bezier(0.25,1,0.5,1), filter 0.5s', filter: isActive ? 'brightness(0.65) saturate(0.8)' : 'brightness(0.32) saturate(0.4)' }} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 18, paddingRight: 14, background: isActive ? 'none' : 'rgba(5,5,5,0.2)' }}>
                  <span style={{ fontFamily: 'var(--f-mono), monospace', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: isActive ? 'rgba(242,239,233,0.9)' : 'rgba(242,239,233,0.75)', whiteSpace: 'nowrap' }}>{item.label}</span>
                  <ChevronDown size={11} color="rgba(242,239,233,0.6)" style={{ transform: isActive ? 'rotate(180deg)' : 'none', transition: 'transform 0.4s', flexShrink: 0 }} />
                </div>
              </div>
              <MobilePanelContent isActive={isActive}>
                <span style={{ display: 'inline-block', marginBottom: 8, padding: '2px 8px', border: '1px solid rgba(92,154,255,0.4)', background: 'rgba(47,123,246,0.12)', fontFamily: 'var(--f-mono), monospace', fontSize: 8, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--azul-luz)' }}>{item.label}</span>
                {item.content}
              </MobilePanelContent>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 1, background: 'var(--linea)', minHeight: 480, alignItems: 'stretch' }}>
      {items.map((item, idx) => {
        const isActive = activeId === item.id;
        const img = M1_IMAGES[idx] ?? '/galeria1.png';
        return (
          <div key={item.id} onMouseEnter={() => setActiveId(item.id)} onClick={() => setActiveId(item.id)} style={{ flex: isActive ? 5 : 1, transition: 'flex 0.7s cubic-bezier(0.25,1,0.5,1)', cursor: 'pointer', overflow: 'hidden', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'relative', height: 160, flexShrink: 0, overflow: 'hidden' }}>
              <Image src={img} alt={item.label} fill sizes="20vw" style={{ objectFit: 'cover', transform: isActive ? 'scale(1.03)' : 'scale(1.1)', transition: 'transform 1s cubic-bezier(0.25,1,0.5,1), filter 0.5s', filter: isActive ? 'brightness(0.75) saturate(0.8)' : 'brightness(0.38) saturate(0.45)' }} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isActive ? 0 : 1, transition: 'opacity 0.2s', pointerEvents: 'none' }}>
                <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontFamily: 'var(--f-mono), monospace', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(242,239,233,0.9)', whiteSpace: 'nowrap' }}>{item.label}</span>
              </div>
            </div>
            <div style={{ flex: 1, padding: '18px 20px', background: '#050505', borderTop: '1px solid var(--linea)', opacity: isActive ? 1 : 0, transform: isActive ? 'translateY(0)' : 'translateY(6px)', transition: 'opacity 0.35s 0.12s, transform 0.35s 0.12s', overflowY: 'auto' }}>
              <span style={{ display: 'inline-block', marginBottom: 10, padding: '2px 8px', border: '1px solid rgba(92,154,255,0.4)', background: 'rgba(47,123,246,0.12)', fontFamily: 'var(--f-mono), monospace', fontSize: 8, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--azul-luz)' }}>{item.label}</span>
              {item.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── ElasticComparacion ────────────────────────────────────────────────────────
function ElasticComparacion({ items }: { items: typeof COMPARACION }) {
  const [hovered, setHovered] = useState<number | null>(null);
  return (
    <div>
      <div className="p-cmp-head" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'var(--linea)', marginBottom: 1 }}>
        <div style={{ padding: '12px 28px', background: '#050505', borderBottom: '2px solid rgba(239,68,68,0.3)' }}>
          <span style={{ fontFamily: 'var(--f-mono), monospace', fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(239,68,68,0.55)', display: 'flex', alignItems: 'center', gap: 8 }}><X size={9} /> Hoy, con vouchers</span>
        </div>
        <div style={{ padding: '12px 28px', background: 'rgba(47,123,246,0.04)', borderBottom: '2px solid var(--azul)' }}>
          <span style={{ fontFamily: 'var(--f-mono), monospace', fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--azul-luz)', display: 'flex', alignItems: 'center', gap: 8 }}><Check size={9} /> Con la plataforma</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--linea)' }}>
        {items.map((row, i) => {
          const isHov = hovered === i;
          return (
            <div key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} className="p-cmp-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'var(--linea)' }}>
              <div style={{ padding: isHov ? '28px 28px' : '20px 28px', background: isHov ? 'rgba(239,68,68,0.05)' : '#050505', transition: 'padding 0.3s, background 0.3s', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(239,68,68,0.45)', flexShrink: 0, marginTop: 10 }} />
                <p style={{ margin: 0, fontFamily: 'var(--f-texto), Spectral, serif', fontSize: 14, lineHeight: 1.78, color: isHov ? 'rgba(242,239,233,0.45)' : 'rgba(242,239,233,0.3)', fontStyle: 'italic', transition: 'color 0.3s' }}>{row.antes}</p>
              </div>
              <div style={{ padding: isHov ? '28px 28px' : '20px 28px', background: isHov ? 'rgba(47,123,246,0.08)' : 'rgba(47,123,246,0.02)', transition: 'padding 0.3s, background 0.3s', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <Check size={12} color={isHov ? 'var(--azul-luz)' : 'var(--azul)'} style={{ flexShrink: 0, marginTop: 5, transition: 'color 0.3s' }} />
                <p style={{ margin: 0, fontFamily: 'var(--f-texto), Spectral, serif', fontSize: 14, lineHeight: 1.78, color: isHov ? 'var(--hueso)' : 'rgba(242,239,233,0.6)', transition: 'color 0.3s' }}>{row.despues}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── VideoConSonido — autoplay muteado + botón para activar audio ─────────────
function VideoConSonido() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  const toggleSonido = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', pointerEvents: 'auto' }}>
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/video_provirus-poster.jpg"
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      >
        <source src="/video_provirus.mp4" type="video/mp4" />
      </video>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(5,5,5,0.55) 0%, transparent 30%)' }} />
      <div style={{ position: 'absolute', bottom: 16, left: 20, right: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'var(--f-mono), monospace', fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(92,154,255,0.65)', border: '1px solid rgba(92,154,255,0.2)', padding: '3px 10px', backdropFilter: 'blur(8px)' }}>Areté Soluciones</span>
        <span style={{ fontFamily: 'var(--f-mono), monospace', fontSize: 9, letterSpacing: '0.2em', color: 'rgba(242,239,233,0.3)' }}>aretesoluciones.space</span>
      </div>
      <button
        onClick={toggleSonido}
        aria-label={muted ? 'Activar sonido' : 'Silenciar'}
        style={{
          position: 'absolute', top: 16, right: 16,
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '9px 16px', borderRadius: 999,
          background: muted ? 'rgba(47,123,246,0.9)' : 'rgba(5,5,5,0.75)',
          border: `1px solid ${muted ? 'rgba(47,123,246,1)' : 'rgba(255,255,255,0.2)'}`,
          color: '#fff', cursor: 'pointer', backdropFilter: 'blur(8px)',
          fontFamily: 'var(--f-mono), monospace', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase',
          transition: 'all 0.2s',
        }}
      >
        {muted ? <Volume2 size={13} /> : <VolumeX size={13} />}
        {muted ? 'Activar sonido' : 'Silenciar'}
      </button>
    </div>
  );
}

// ── DemoButton — dispara el ElevenLabsWidget global del layout de empresa ─────
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
    <button onClick={handleClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
      display: 'inline-flex', alignItems: 'center', gap: 10, padding: '15px 32px',
      background: active ? 'rgba(239,68,68,0.08)' : hov ? 'rgba(47,123,246,0.1)' : 'transparent',
      border: `1.5px solid ${active ? 'rgba(239,68,68,0.5)' : hov ? 'var(--azul)' : 'rgba(92,154,255,0.3)'}`,
      color: active ? 'rgba(239,68,68,0.9)' : hov ? 'var(--azul-luz)' : 'rgba(92,154,255,0.65)',
      fontFamily: 'var(--f-mono), monospace', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
      cursor: 'pointer', transition: 'all 0.25s',
    }}>
      <Mic size={13} />
      {active ? 'Colgar' : 'Probar el agente'}
    </button>
  );
}

// ── ElasticRoadmap ─────────────────────────────────────────────────────────────
function ElasticRoadmap({ items }: { items: typeof EVOLUCION }) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--linea)' }}>
      {items.map((item, i) => {
        const isActive = activeIdx === i;
        return (
          <div key={item.n} onMouseEnter={() => setActiveIdx(i)} onMouseLeave={() => setActiveIdx(null)} style={{ display: 'grid', gridTemplateColumns: '56px 1fr', background: isActive ? 'rgba(47,123,246,0.05)' : '#050505', borderLeft: `2px solid ${isActive ? 'var(--azul)' : 'transparent'}`, transition: 'background 0.25s, border-color 0.25s', cursor: 'default' }}>
            <div style={{ padding: '24px 16px', borderRight: '1px solid var(--linea)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'var(--f-mono), monospace', fontSize: 11, letterSpacing: '0.18em', color: isActive ? 'var(--azul-luz)' : 'var(--azul)', transition: 'color 0.25s' }}>{item.n}</span>
            </div>
            <div style={{ padding: '24px 32px' }}>
              <p style={{ margin: '0 0 8px', fontFamily: 'var(--f-display), Montserrat, sans-serif', fontWeight: 700, fontSize: 15, color: isActive ? 'var(--hueso)' : 'rgba(242,239,233,0.7)', letterSpacing: '-0.01em', transition: 'color 0.25s' }}>{item.t}</p>
              <p style={{ margin: 0, fontFamily: 'var(--f-texto), Spectral, serif', fontSize: 14, lineHeight: 1.7, color: 'var(--ceniza)', maxHeight: isActive ? 120 : 0, overflow: 'hidden', transition: 'max-height 0.4s cubic-bezier(0.16,0.84,0.28,1)' }}>{item.d}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Slider + Calculadora de retorno ────────────────────────────────────────────
function Slider({ label, value, setValue, min, max, step, format }: {
  label: string; value: number; setValue: (n: number) => void;
  min: number; max: number; step: number; format: (n: number) => string;
}) {
  return (
    <div style={{ marginBottom: 26 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
        <label style={{ fontFamily: 'var(--f-mono), monospace', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ceniza)' }}>{label}</label>
        <span style={{ fontFamily: 'var(--f-display), Montserrat, sans-serif', fontWeight: 800, fontSize: 17, color: 'var(--hueso)', letterSpacing: '-0.02em' }}>{format(value)}</span>
      </div>
      <input className="pvRange" type="range" min={min} max={max} step={step} value={value} onChange={e => setValue(Number(e.target.value))} aria-label={label} />
    </div>
  );
}

function Calculadora() {
  const [eventos, setEventos]     = useState(6);
  const [registros, setRegistros] = useState(60);
  const [perdido, setPerdido]     = useState(20);
  const [cierre, setCierre]       = useState(6);
  const [valor, setValor]         = useState(600);

  const r = useMemo(() => {
    const recuperados = eventos * registros * (perdido / 100);
    const ventas      = recuperados * (cierre / 100);
    const mensual     = ventas * valor;
    const meses       = mensual > 0 ? 22000 / mensual : Infinity;
    return { recuperados, ventas, mensual, meses };
  }, [eventos, registros, perdido, cierre, valor]);

  const n0 = (x: number) => Math.round(x).toLocaleString('es-AR');
  const n1 = (x: number) => x.toFixed(1).replace('.', ',');

  return (
    <div className="pvCalcGrid">
      <div>
        <Slider label="Eventos por mes"              value={eventos}   setValue={setEventos}   min={1}   max={30}   step={1}  format={n => `${n}`} />
        <Slider label="Registros por evento"          value={registros} setValue={setRegistros} min={10}  max={300}  step={5}  format={n => `${n}`} />
        <Slider label="Que hoy se enfrían o pierden"  value={perdido}   setValue={setPerdido}    min={0}   max={60}   step={1}  format={n => `${n}%`} />
        <Slider label="Cierre sobre los recuperados"  value={cierre}    setValue={setCierre}     min={1}   max={30}   step={1}  format={n => `${n}%`} />
        <Slider label="Valor de una suscripción"      value={valor}     setValue={setValor}      min={100} max={5000} step={50} format={n => `USD ${n.toLocaleString('es-AR')}`} />
        <p style={{ margin: '8px 0 0', fontFamily: 'var(--f-texto), Spectral, serif', fontStyle: 'italic', fontSize: 13, lineHeight: 1.6, color: 'var(--ceniza)' }}>
          Los números los pone Providus. Areté no estima ninguno de estos valores: esta calculadora solo hace la cuenta con los datos que ustedes conocen.
        </p>
      </div>
      <div style={{ border: '1px solid rgba(47,123,246,0.25)', background: 'rgba(47,123,246,0.04)', padding: '36px 34px', clipPath: 'polygon(16px 0,100% 0,100% calc(100% - 16px),calc(100% - 16px) 100%,0 100%,0 16px)' }}>
        <p className={s.bandNum} style={{ color: 'var(--azul)', marginBottom: 24 }}>Resultado con esos números</p>
        {[
          ['Contactos recuperados por mes', n0(r.recuperados)],
          ['Suscripciones adicionales por mes', n1(r.ventas)],
        ].map(([k, v]) => (
          <div key={k} style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16, padding: '14px 0', borderBottom: '1px solid var(--linea)' }}>
            <span style={{ fontFamily: 'var(--f-texto), Spectral, serif', fontSize: 14, color: 'rgba(242,239,233,0.6)' }}>{k}</span>
            <span style={{ fontFamily: 'var(--f-display), Montserrat, sans-serif', fontWeight: 800, fontSize: 20, color: 'var(--hueso)', letterSpacing: '-0.03em' }}>{v}</span>
          </div>
        ))}
        <div style={{ margin: '28px 0 0' }}>
          <p style={{ margin: 0, fontFamily: 'var(--f-mono), monospace', fontSize: 9, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--azul-luz)' }}>Ingreso adicional por mes</p>
          <div style={{ fontFamily: 'var(--f-display), Montserrat, sans-serif', fontWeight: 900, fontSize: 'clamp(32px,4.6vw,48px)', letterSpacing: '-0.05em', color: 'var(--hueso)', lineHeight: 1.05, marginTop: 4 }}>USD {n0(r.mensual)}</div>
        </div>
        <div style={{ marginTop: 26, padding: '18px 20px', background: 'rgba(47,123,246,0.07)', border: '1px solid rgba(47,123,246,0.18)' }}>
          <p style={{ margin: 0, fontFamily: 'var(--f-texto), Spectral, serif', fontSize: 14, lineHeight: 1.65, color: 'rgba(242,239,233,0.78)' }}>
            {Number.isFinite(r.meses) && r.meses > 0 ? (
              <>La inversión de <b style={{ color: 'var(--hueso)' }}>USD 22.000</b> queda cubierta en{' '}<b style={{ color: 'var(--azul-luz)' }}>{r.meses < 1 ? 'menos de un mes' : `${n1(r.meses)} meses`}</b>.</>
            ) : (<>Movés los valores de arriba y la cuenta se actualiza sola.</>)}
          </p>
        </div>
        <p style={{ margin: '20px 0 0', fontFamily: 'var(--f-texto), Spectral, serif', fontStyle: 'italic', fontSize: 13, lineHeight: 1.6, color: 'var(--ceniza)' }}>
          Y esto cuenta solo lo que hoy se pierde entre el evento y el primer llamado. No cuenta las horas de carga manual que se eliminan, ni las ventas que agrega el agente atendiendo fuera de horario.
        </p>
      </div>
    </div>
  );
}

// ── ProposalContent ───────────────────────────────────────────────────────────
function ProposalContent() {
  const [activeTab, setActiveTab] = useState('nucleo');
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

  const scrollTo = (id: string) => sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const setRef   = (id: string) => (el: HTMLElement | null) => { sectionRefs.current[id] = el; };

  const handleAccept = () => {
    setAccepting(true);
    start(async () => { await notifyAcceptance(); setAccepted(true); setAccepting(false); });
  };

  const NAV_ITEMS = [
    { id: 'situacion',  label: 'Situación' },
    { id: 'plataforma', label: 'Plataforma' },
    { id: 'modulo1',    label: 'Módulo 1' },
    { id: 'modulo2',    label: 'Módulo 2' },
    { id: 'seguridad',  label: 'Seguridad' },
    { id: 'retorno',    label: 'Retorno' },
    { id: 'inversion',  label: 'Inversión' },
    { id: 'proceso',    label: 'Proceso' },
  ];

  const tabsContent = TABS_M1.map(t => ({
    id: t.id,
    label: t.label,
    content: (
      <>
        <p className={s.bandBody} style={{ margin: '0 0 10px', fontSize: 13 }}>{t.intro}</p>
        <ul className={s.panelList} style={{ padding: 0, margin: 0 }}>
          {t.items.map(item => <li key={item} className={s.panelItem}><span className={s.panelDot} aria-hidden="true" />{item}</li>)}
        </ul>
        {t.tech && (
          <p style={{ margin: '16px 0 0', paddingLeft: 14, borderLeft: '2px solid rgba(242,239,233,0.14)', fontFamily: 'var(--f-mono), monospace', fontSize: 11, lineHeight: 1.7, color: 'rgba(242,239,233,0.42)' }}>{t.tech}</p>
        )}
      </>
    ),
  }));

  return (
    <>
      <RevealObserver />
      <style>{LOCAL_CSS}</style>

      {/* ── Barra de secciones (bajo el CorpHeader) ── */}
      <div style={{ position: 'sticky', top: 68, zIndex: 100 }}>
        <nav className="p-nav" style={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'nowrap', padding: '0 32px', height: 44, background: 'rgba(5,5,5,0.96)', borderBottom: '1px solid var(--linea)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {NAV_ITEMS.map(({ id, label }) => (
            <button key={id} onClick={() => scrollTo(id)} style={{ padding: '4px 14px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--f-mono), monospace', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: activeNav === id ? 'var(--azul-luz)' : 'rgba(242,239,233,0.4)', transition: 'color 0.2s', flexShrink: 0, borderBottom: activeNav === id ? '2px solid var(--azul)' : '2px solid transparent' }}>{label}</button>
          ))}
          <span style={{ marginLeft: 'auto', padding: '3px 10px', fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', fontFamily: 'var(--f-mono), monospace', color: 'var(--azul-luz)', border: '1px solid rgba(92,154,255,0.22)', flexShrink: 0 }}>Confidencial</span>
        </nav>
        <div className="p-nav-fade" style={{ display: 'none', position: 'absolute', top: 0, right: 0, width: 64, height: '100%', background: 'linear-gradient(to right, transparent, rgba(5,5,5,0.96))', pointerEvents: 'none' }} />
      </div>

      {/* ── Hero (VolumetricStudio + ContainerScroll + video) ── */}
      <VolumetricStudio>
        <div style={{ pointerEvents: 'auto' }}>
          <ContainerScroll
            titleComponent={
              <div className="pv-hero-clear" style={{ paddingLeft: 16, paddingRight: 16 }}>
                <div className={s.kicker} style={{ marginBottom: 20, justifyContent: 'center' }}>
                  <span className={s.kickerLine} />
                  <span className={s.kickerLabel}>Providus S.A. de Capitalización y Renta · Córdoba · Septiembre 2026</span>
                </div>
                <h1 className={s.heroTitle} style={{ marginBottom: 20 }}>
                  Del voucher de papel<br /><em>al dato en tiempo real.</em>
                </h1>
                <p className={s.heroSub} style={{ maxWidth: 640, margin: '0 auto 36px' }}>
                  Una sola plataforma donde el interesado se registra en el evento, llega a la oficina en el momento, se asigna solo a un vendedor y todo lo que pasa después queda medido. Con la seguridad que exige una empresa que administra el ahorro de terceros.
                </p>
                <div className="p-hero-metrics" style={{ display: 'flex', gap: 1, background: 'var(--linea)', marginBottom: 28, flexWrap: 'wrap', maxWidth: 640, margin: '0 auto 28px' }}>
                  {[
                    { val: 'USD 22.000', label: 'Inversión total', sub: 'En dos módulos' },
                    { val: '2 módulos',   label: 'Entrega',         sub: '50% al inicio · 50% al entregar' },
                    { val: '1 mes',       label: 'Por módulo',      sub: 'Desde las definiciones' },
                  ].map(({ val, label, sub }) => (
                    <div key={label} style={{ padding: '20px 28px', background: 'rgba(5,5,5,0.92)', backdropFilter: 'blur(8px)', flex: '1 1 140px' }}>
                      <div style={{ fontFamily: 'var(--f-display), Montserrat, sans-serif', fontWeight: 900, fontSize: 'clamp(18px,2vw,24px)', letterSpacing: '-0.05em', color: 'var(--hueso)' }}>{val}</div>
                      <div style={{ fontFamily: 'var(--f-mono), monospace', fontSize: 9, letterSpacing: '0.26em', textTransform: 'uppercase', color: 'var(--azul-luz)', margin: '5px 0 3px' }}>{label}</div>
                      <div style={{ fontFamily: 'var(--f-mono), monospace', fontSize: 9, color: 'var(--ceniza)' }}>{sub}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <DemoButton />
                </div>
              </div>
            }
          >
            <VideoConSonido />
          </ContainerScroll>
        </div>
      </VolumetricStudio>

      {/* ── 01 Situación ── */}
      <section className={s.section} ref={setRef('situacion')}>
        <div className={s.inner}>
          <div className={`${s.sectionLockup} ${s.reveal}`} data-reveal="" style={{ marginBottom: 48 }}>
            <p className={s.kickerLabel} style={{ marginBottom: 14 }}>01 — La situación que resuelve</p>
            <h2 className={s.sectionTitle}>Antes y después<br /><em>de la plataforma.</em></h2>
            <p className={s.sectionSub}>El problema no es el papel. Es que hoy no existe forma de saber qué pasa entre el evento y la venta.</p>
          </div>
          <div className={s.reveal} data-reveal=""><ElasticComparacion items={COMPARACION} /></div>
        </div>
      </section>

      {/* ── 02 La plataforma ── */}
      <section className={`${s.section} ${s.sectionAlt}`} ref={setRef('plataforma')}>
        <div className={s.inner}>
          <div className={`${s.sectionLockup} ${s.reveal}`} data-reveal="" style={{ marginBottom: 48 }}>
            <p className={s.kickerLabel} style={{ marginBottom: 14 }}>02 — La decisión de arquitectura</p>
            <h2 className={s.sectionTitle}>Una plataforma,<br /><em>no herramientas sueltas.</em></h2>
            <p className={s.sectionSub}>Tres caras de acceso sobre un mismo núcleo. La persona que se registra en el evento, la que habla con el agente y la que atiende el vendedor son el mismo registro.</p>
          </div>
          <div className={`${s.reveal} p-grid5`} data-reveal="" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: 'var(--linea)', marginBottom: 1 }}>
            {CARAS.map(({ icon: Icon, t, q, d }) => (
              <div key={t} style={{ background: '#050505', padding: '32px 28px' }}>
                <Icon size={18} color="var(--azul)" style={{ marginBottom: 16 }} />
                <h3 style={{ margin: '0 0 6px', fontFamily: 'var(--f-display), Montserrat, sans-serif', fontWeight: 700, fontSize: 17, color: 'var(--hueso)', letterSpacing: '-0.02em' }}>{t}</h3>
                <p style={{ margin: '0 0 10px', fontFamily: 'var(--f-mono), monospace', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--azul-luz)' }}>{q}</p>
                <p style={{ margin: 0, fontFamily: 'var(--f-texto), Spectral, serif', fontWeight: 300, fontSize: 14, lineHeight: 1.65, color: '#B4B1AB' }}>{d}</p>
              </div>
            ))}
          </div>
          <div className={s.reveal} data-reveal="" style={{ background: '#050505', border: '1px solid rgba(47,123,246,0.2)', padding: '32px 34px', marginTop: 1 }}>
            <p className={s.bandNum} style={{ color: 'var(--azul)', marginBottom: 14 }}>Núcleo compartido</p>
            <p className={s.bandBody} style={{ marginBottom: 20 }}>Base de datos única, identidad y permisos, motor de reglas, auditoría y capa de canales. Eso habilita cosas que con herramientas separadas no existen:</p>
            <ul className={s.panelList} style={{ padding: 0 }}>
              {['El agente atiende y ya sabe de qué evento vino la persona, con qué promotora y hace cuántos días. No arranca de cero.',
                'El vendedor, antes de llamar, lee lo que la persona ya conversó con el agente. No repite preguntas ni la desgasta.',
                'La dirección ve el embudo completo: evento, registro, agente, vendedor, suscripción. Hoy eso no lo puede ver nadie.',
                'Los planes, los textos, los campos y las reglas son datos cargados desde el panel, no código. Actualizar es cargar, no reprogramar.',
              ].map(item => <li key={item} className={s.panelItem}><span className={s.panelDot} aria-hidden="true" />{item}</li>)}
            </ul>
          </div>
        </div>
      </section>

      {/* ── 03 Módulo 1 ── */}
      <section className={s.section} ref={setRef('modulo1')}>
        <div className={s.inner}>
          <div className={`${s.sectionLockup} ${s.reveal}`} data-reveal="" style={{ marginBottom: 52 }}>
            <p className={s.kickerLabel} style={{ marginBottom: 14 }}>03 — Módulo 1 · USD 15.000 · 1 mes</p>
            <h2 className={s.sectionTitle}>Captación, reparto<br /><em>y métricas.</em></h2>
            <p className={s.sectionSub}>Pasá el cursor por cada panel para explorar cada componente.</p>
          </div>
          <div className={s.reveal} data-reveal=""><ElasticSolucion items={tabsContent} /></div>
        </div>
      </section>

      {/* ── 04 Módulo 2 ── */}
      <section className={`${s.section} ${s.sectionAlt}`} ref={setRef('modulo2')}>
        <div className={s.inner}>
          <div className={`${s.sectionLockup} ${s.reveal}`} data-reveal="" style={{ marginBottom: 48 }}>
            <p className={s.kickerLabel} style={{ marginBottom: 14 }}>04 — Módulo 2 · USD 7.000 · 1 mes</p>
            <h2 className={s.sectionTitle}>Un agente que atiende<br /><em>y que cierra.</em></h2>
            <p className={s.sectionSub}>Por voz, WhatsApp y web, las 24 horas. Escribe en la misma ficha que los vendedores.</p>
          </div>
          <div className={`${s.reveal} pvGrid2`} data-reveal="">
            <div>
              <p className={s.bandNum} style={{ color: 'var(--azul)', marginBottom: 18 }}>Qué hace</p>
              <ul className={s.panelList} style={{ padding: 0 }}>
                {AGENTE_HACE.map(item => <li key={item} className={s.panelItem}><span className={s.panelDot} aria-hidden="true" />{item}</li>)}
              </ul>
            </div>
            <div>
              <p className={s.bandNum} style={{ marginBottom: 6 }}>Cómo se controla lo que dice</p>
              {AGENTE_CONTROL.map(([t, d]) => (
                <Accordion key={t} title={t}><p style={{ margin: 0, fontFamily: 'var(--f-texto), Spectral, serif', fontSize: 14, lineHeight: 1.7, color: '#B4B1AB' }}>{d}</p></Accordion>
              ))}
              <div style={{ marginTop: 24, padding: '18px 20px', border: '1px solid var(--linea)' }}>
                <p style={{ margin: 0, fontFamily: 'var(--f-texto), Spectral, serif', fontStyle: 'italic', fontSize: 13, lineHeight: 1.65, color: 'var(--ceniza)' }}>
                  Hasta dónde cierra el agente por sí solo lo define Providus. Comercialmente puede llegar hasta el cobro; la formalización del contrato sigue el circuito que ustedes determinen.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 05 Seguridad ── */}
      <section className={s.section} ref={setRef('seguridad')}>
        <div className={s.inner}>
          <div className={s.splitGrid}>
            <div className={`${s.sectionLockup} ${s.reveal}`} data-reveal="">
              <p className={s.kickerLabel} style={{ marginBottom: 14 }}>05 — Seguridad y cumplimiento</p>
              <h2 className={s.sectionTitle}>Diseñado desde<br /><em>la seguridad.</em></h2>
              <p className={s.sectionSub}>Los datos que maneja este sistema son de personas que pueden terminar confiándole su ahorro a Providus. La seguridad no se agrega al final.</p>
              <p className={s.bandPull} style={{ marginTop: 28 }}>Una filtración de datos de interesados no sería un problema técnico: sería un problema de reputación y un problema legal.</p>
            </div>
            <div className={`${s.reveal} ${s.revealDelay1}`} data-reveal="">
              {SEGURIDAD.map(([t, d]) => (
                <Accordion key={t} title={t}><p style={{ margin: 0, fontFamily: 'var(--f-texto), Spectral, serif', fontSize: 14, lineHeight: 1.7, color: '#B4B1AB' }}>{d}</p></Accordion>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 06 Retorno ── */}
      <section className={`${s.section} ${s.sectionAlt}`} ref={setRef('retorno')}>
        <div className={s.inner}>
          <div className={`${s.sectionLockup} ${s.reveal}`} data-reveal="" style={{ marginBottom: 48 }}>
            <p className={s.kickerLabel} style={{ marginBottom: 14 }}>06 — Retorno de la inversión</p>
            <h2 className={s.sectionTitle}>Hagan la cuenta<br /><em>con sus números.</em></h2>
            <p className={s.sectionSub}>Mové los valores y la cuenta se actualiza sola. Nadie tiene que creernos: la aritmética la hacen ustedes.</p>
          </div>
          <div className={s.reveal} data-reveal=""><Calculadora /></div>
        </div>
      </section>

      {/* ── 07 Inversión ── */}
      <section className={s.section} ref={setRef('inversion')}>
        <div className={s.inner}>
          <div className={`${s.sectionLockup} ${s.reveal}`} data-reveal="" style={{ marginBottom: 48 }}>
            <p className={s.kickerLabel} style={{ marginBottom: 14 }}>07 — Inversión</p>
            <h2 className={s.sectionTitle}>Dos módulos,<br /><em>sin sorpresas.</em></h2>
            <p className={s.sectionSub}>Cada módulo se entrega funcionando y aporta valor por sí mismo. Providus paga el segundo con el primero ya operando.</p>
          </div>

          <div className="pvSplitTight">
            <div className={s.reveal} data-reveal="" style={{ padding: '48px 40px', border: '1px solid var(--linea)' }}>
              <p className={s.bandNum} style={{ marginBottom: 24 }}>Módulo 1 · Captación, reparto y métricas</p>
              <div style={{ fontFamily: 'var(--f-display), Montserrat, sans-serif', fontWeight: 900, fontSize: 'clamp(38px,5vw,54px)', letterSpacing: '-0.05em', color: 'var(--hueso)', marginBottom: 4 }}>USD 15.000</div>
              <p style={{ margin: '0 0 32px', fontFamily: 'var(--f-mono), monospace', fontSize: 11, letterSpacing: '0.12em', color: 'var(--ceniza)' }}>1 mes · 50% al confirmar · 50% contra entrega</p>
              <ul className={s.panelList} style={{ padding: 0 }}>
                {['Núcleo, permisos y auditoría.', 'App de campo con foto, consentimiento y sin señal.', 'Envíos automáticos por correo e Instagram.', 'Panel de operaciones y asignación automática.', 'Espacio del vendedor con WhatsApp oficial.', 'Métricas de performance comercial.'].map(item => (
                  <li key={item} className={s.panelItem}><span className={s.panelDot} aria-hidden="true" />{item}</li>
                ))}
              </ul>
            </div>
            <div className={`${s.reveal} ${s.revealDelay1}`} data-reveal="" style={{ padding: '48px 40px', border: '1px solid rgba(47,123,246,0.3)', background: 'rgba(47,123,246,0.04)' }}>
              <p className={s.bandNum} style={{ color: 'var(--azul)', marginBottom: 24 }}>Módulo 2 · Agente de inteligencia artificial</p>
              <div style={{ fontFamily: 'var(--f-display), Montserrat, sans-serif', fontWeight: 900, fontSize: 'clamp(38px,5vw,54px)', letterSpacing: '-0.05em', color: 'var(--hueso)', marginBottom: 4 }}>USD 7.000</div>
              <p style={{ margin: '0 0 32px', fontFamily: 'var(--f-mono), monospace', fontSize: 11, letterSpacing: '0.12em', color: 'var(--ceniza)' }}>1 mes · 50% al iniciar · 50% contra entrega</p>
              <ul className={s.panelList} style={{ padding: 0 }}>
                {['Agente por voz, WhatsApp y web, 24/7.', 'Catálogo de planes editable desde el panel.', 'Simulador y propuesta comercial automática.', 'Links de pago y conciliación.', 'Derivación al vendedor con la conversación cargada.'].map(item => (
                  <li key={item} className={s.panelItem}><span className={s.panelDot} aria-hidden="true" />{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className={s.reveal} data-reveal="" style={{ marginTop: 2, border: '1px solid var(--linea)', padding: '40px' }}>
            <div className="pvGrid2">
              <div>
                <p className={s.bandNum} style={{ marginBottom: 12 }}>Inversión total del proyecto</p>
                <div style={{ fontFamily: 'var(--f-display), Montserrat, sans-serif', fontWeight: 900, fontSize: 'clamp(44px,6vw,66px)', letterSpacing: '-0.05em', color: 'var(--hueso)', lineHeight: 1 }}>USD 22.000</div>
                <p style={{ margin: '14px 0 0', fontFamily: 'var(--f-texto), Spectral, serif', fontStyle: 'italic', fontSize: 15, lineHeight: 1.65, color: 'rgba(242,239,233,0.55)' }}>Sin abono mensual obligatorio. Los 90 días posteriores a la puesta en producción están cubiertos por la garantía.</p>
              </div>
              <div>
                <p className={s.bandNum} style={{ marginBottom: 12 }}>Cronograma de pagos</p>
                {[
                  ['Módulo 1 — al confirmar el proyecto', 'USD 7.500'],
                  ['Módulo 1 — contra entrega funcionando', 'USD 7.500'],
                  ['Módulo 2 — al iniciar el módulo', 'USD 3.500'],
                  ['Módulo 2 — contra entrega funcionando', 'USD 3.500'],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16, padding: '13px 0', borderBottom: '1px solid var(--linea)' }}>
                    <span style={{ fontFamily: 'var(--f-texto), Spectral, serif', fontSize: 14, color: 'rgba(242,239,233,0.6)' }}>{k}</span>
                    <span style={{ fontFamily: 'var(--f-mono), monospace', fontSize: 13, color: 'var(--hueso)', whiteSpace: 'nowrap' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={s.reveal} data-reveal="" style={{ marginTop: 40 }}>
            <p className={s.bandNum} style={{ marginBottom: 8 }}>Costos que no forman parte de esta inversión</p>
            <p className={s.sectionSub} style={{ marginBottom: 24, maxWidth: 680 }}>Se contratan a nombre de Providus y se facturan directamente a la empresa, sin intermediación de Areté. Si mañana Providus cambia de proveedor tecnológico, las cuentas, los números y los datos siguen siendo suyos.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--linea)' }}>
              {COSTOS_APARTE.map(([k, v]) => (
                <div key={k} className="pvHoverRow" style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16, padding: '16px 24px', background: '#050505' }}>
                  <span style={{ fontFamily: 'var(--f-display), Montserrat, sans-serif', fontWeight: 600, fontSize: 14, color: 'var(--hueso)' }}>{k}</span>
                  <span style={{ fontFamily: 'var(--f-mono), monospace', fontSize: 12, color: 'var(--ceniza)', whiteSpace: 'nowrap' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 08 Alcance ── */}
      <section className={`${s.section} ${s.sectionAlt}`}>
        <div className={s.inner}>
          <div className={`${s.sectionLockup} ${s.reveal}`} data-reveal="" style={{ marginBottom: 48 }}>
            <p className={s.kickerLabel} style={{ marginBottom: 14 }}>08 — Alcance</p>
            <h2 className={s.sectionTitle}>Qué entra<br /><em>y qué no.</em></h2>
            <p className={s.sectionSub}>Tener claro el límite evita malentendidos y promesas que después no se pueden cumplir.</p>
          </div>
          <div className={`${s.reveal} p-grid2`} data-reveal="" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'var(--linea)' }}>
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
            <div className="p-pad" style={{ padding: '40px', background: '#050505', borderTop: '2px solid var(--linea)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
                <span style={{ width: 8, height: 8, background: 'var(--ceniza)', borderRadius: 1 }} />
                <p style={{ margin: 0, fontFamily: 'var(--f-mono), monospace', fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--ceniza)' }}>Fuera de esta etapa</p>
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {NO_INCLUIDO.map(item => (
                  <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <span style={{ width: 12, height: 12, flexShrink: 0, marginTop: 4, border: '1px solid rgba(138,138,138,0.3)', borderRadius: 2 }} />
                    <span style={{ fontFamily: 'var(--f-texto), Spectral, serif', fontSize: 14, lineHeight: 1.65, color: 'rgba(242,239,233,0.3)' }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── 09 Proceso ── */}
      <section className={s.section} ref={setRef('proceso')}>
        <div className={s.inner}>
          <div className={`${s.sectionLockup} ${s.reveal}`} data-reveal="" style={{ marginBottom: 64 }}>
            <p className={s.kickerLabel} style={{ marginBottom: 14 }}>09 — Proceso de implementación</p>
            <h2 className={s.sectionTitle}>Cinco etapas,<br /><em>un mes por módulo.</em></h2>
            <p className={s.sectionSub}>Cada etapa cierra con algo concreto que Providus puede ver y probar. El plazo corre desde que están las definiciones y las cuentas.</p>
          </div>

          <div className={`${s.reveal}`} data-reveal="" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: 1, background: 'var(--linea)', marginBottom: 56 }}>
            {ETAPAS_IMPL.map(e => (
              <div key={e.n} style={{ background: '#050505', padding: '36px 28px' }}>
                <div style={{ width: 44, height: 44, border: '1px solid var(--azul)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, background: 'rgba(47,123,246,0.06)' }}>
                  <span style={{ fontFamily: 'var(--f-mono), monospace', fontSize: 11, color: 'var(--azul-luz)', letterSpacing: '0.1em' }}>{e.n}</span>
                </div>
                <h3 style={{ margin: '0 0 12px', fontFamily: 'var(--f-display), Montserrat, sans-serif', fontWeight: 700, fontSize: 15, color: 'var(--hueso)', letterSpacing: '-0.02em' }}>{e.t}</h3>
                <p style={{ margin: 0, fontFamily: 'var(--f-texto), Spectral, serif', fontWeight: 300, fontSize: 13, lineHeight: 1.75, color: 'var(--ceniza)' }}>{e.d}</p>
              </div>
            ))}
          </div>

          <div className={`${s.sectionLockup} ${s.reveal}`} data-reveal="" style={{ marginBottom: 32 }}>
            <p className={s.kickerLabel} style={{ marginBottom: 14 }}>Qué necesitamos de Providus para ejecutar</p>
            <p className={s.sectionSub}>Son trámites y definiciones que dependen de Providus. Conviene iniciarlos apenas se confirme el proyecto: los tiempos de verificación de Apple, Google y Meta no se computan dentro del mes de desarrollo.</p>
          </div>
          <div className={`${s.reveal}`} data-reveal="" style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--linea)' }}>
            {NECESITAMOS.map(item => (
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

      {/* ── 10 Evolución ── */}
      <section className={`${s.section} ${s.sectionAlt}`}>
        <div className={s.inner}>
          <div className={`${s.sectionLockup} ${s.reveal}`} data-reveal="" style={{ marginBottom: 48 }}>
            <p className={s.kickerLabel} style={{ marginBottom: 14 }}>10 — Evolución posterior</p>
            <h2 className={s.sectionTitle}>Lo que la plataforma<br /><em>habilita después.</em></h2>
            <p className={s.sectionSub}>No forma parte de esta inversión. Las decisiones de arquitectura que tomamos ahora son las que hacen que cada una de estas etapas sea después un agregado y no un sistema nuevo.</p>
          </div>
          <div className={s.reveal} data-reveal=""><ElasticRoadmap items={EVOLUCION} /></div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={s.ctaBand}>
        <div className={s.inner}>
          {accepted ? (
            <div className={`${s.reveal}`} data-reveal="" style={{ maxWidth: 560, margin: '0 auto', padding: '48px 40px', background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.22)', clipPath: 'polygon(16px 0,100% 0,100% calc(100% - 16px),calc(100% - 16px) 100%,0 100%,0 16px)' }}>
              <div style={{ width: 56, height: 56, margin: '0 auto 24px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', clipPath: 'polygon(10px 0,100% 0,100% calc(100% - 10px),calc(100% - 10px) 100%,0 100%,0 10px)' }}>
                <Check size={22} color="#22c55e" />
              </div>
              <h2 className={s.ctaTitle} style={{ fontSize: 'clamp(26px,4vw,42px)' }}>Propuesta aceptada</h2>
              <p className={s.ctaSub}>El equipo de Areté fue notificado. Los contactamos en las próximas horas para coordinar inicio, primer pago y arranque de las definiciones.</p>
            </div>
          ) : (
            <div className={s.reveal} data-reveal="">
              <h2 className={s.ctaTitle}>¿Arrancamos?</h2>
              <p className={s.ctaSub}>Confirmación por escrito y el primer tramo del Módulo 1. Con eso arranca la etapa de definiciones y corre el plazo.</p>
              <div className={s.ctaRow}>
                <button onClick={handleAccept} disabled={accepting || pending} className={s.btnPrimary} style={{ fontSize: 12, padding: '18px 40px', cursor: accepting || pending ? 'wait' : 'pointer', opacity: accepting || pending ? 0.6 : 1 }}>
                  {accepting || pending ? 'Enviando…' : 'Acepto la propuesta'}{!accepting && !pending && <ArrowRight size={14} />}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export function ProvidusClient({ unlocked }: { unlocked: boolean }) {
  if (!unlocked) return <PasswordGate />;
  return <ProposalContent />;
}
