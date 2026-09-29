// Todo el contenido de la propuesta de Payma vive acá, tipado. Cambiar un
// precio o una frase es tocar solo este archivo — los componentes no tienen
// texto hardcodeado. Fuente: 07_PROPUESTA_COMERCIAL_payma.md (ver
// content/propuesta.md). No se agrega nada que no esté en ese documento.

import { Home, LayoutDashboard, Bot, Wrench, type LucideIcon } from 'lucide-react';
import type { Metric } from '@/components/propuesta/MetricStrip';
import type { ComparacionItem } from '@/components/propuesta/ElasticComparacion';
import type { FeatureItem } from '@/components/propuesta/FeatureGrid';
import type { NumberedItem } from '@/components/propuesta/NumberedList';
import type { NavItem } from '@/components/propuesta/SectionNav';
import type { AgentData } from '@/components/propuesta/AgentCard';

export const nombreCliente = 'Organización Payma';
export const kicker = 'Organización Payma · San Vicente, Misiones · Septiembre 2026';

export const heroTitulo1 = 'Toda su cartera en una web.';
export const heroTitulo2Em = 'Y alguien que atiende a las 3 de la mañana.';
export const heroSub =
  'Esta propuesta cubre un sistema único para Payma, con una sola base de datos central que alimenta todo.';

export const heroMetricas: Metric[] = [
  { val: 'USD 5.200', label: 'Inversión total', sub: 'Pago único' },
  { val: '5 a 6 semanas', label: 'Entrega', sub: 'Desde el material' },
  { val: 'Sin abono', label: 'Mensual con Areté', sub: 'El sistema es de Payma' },
];

export type SectionMeta = { eyebrow: string; titulo1: string; titulo2Em: string };
export const sections: Record<string, SectionMeta> = {
  situacion: { eyebrow: '01 — La situación que resuelve', titulo1: 'Antes y después', titulo2Em: 'de la plataforma.' },
  sistema: { eyebrow: '02 — La decisión de arquitectura', titulo1: 'Un solo sistema,', titulo2Em: 'no herramientas sueltas.' },
  web: { eyebrow: '03 — La web de propiedades', titulo1: 'Cada propiedad,', titulo2Em: 'antes de visitarla.' },
  panel: { eyebrow: '04 — El panel de Payma', titulo1: 'Su cartera, al día,', titulo2Em: 'sin depender de nadie.' },
  agentes: { eyebrow: '05 — Los tres agentes', titulo1: 'Tres agentes,', titulo2Em: 'conectados entre sí.' },
  emergencias: { eyebrow: '06 — Emergencias 24/7', titulo1: 'A las 3 de la mañana,', titulo2Em: 'alguien atiende.' },
  ficha: { eyebrow: 'Incluido sin cargo', titulo1: 'La ficha', titulo2Em: 'compartible.' },
  libertad: { eyebrow: '08 — El sistema es de Payma', titulo1: 'Libertad total,', titulo2Em: 'sin abono mensual.' },
  inversion: { eyebrow: '09 — Inversión', titulo1: 'Inversión,', titulo2Em: 'pago único.' },
  proceso: { eyebrow: '10 — Proceso de implementación', titulo1: 'Cómo lo hacemos,', titulo2Em: 'en 5 a 6 semanas.' },
};
export const necesitamosEyebrow = 'Qué necesitamos de Payma para ejecutar';
export const agentesComoSeControla = 'Cómo se controla lo que dicen';
export const nucleoEyebrow = 'Núcleo compartido';
export const formaDePagoEyebrow = 'Forma de pago';
export const cierreTitulo = 'Para avanzar.';
export const cierreBotonLabel = 'Aceptar propuesta';
export const agentePruebaEyebrow = 'Pruébenlo ustedes';
export const fichaDemoEyebrow = 'Así se ve la ficha de cada propiedad (ejemplo)';
export const footerText = 'Areté Soluciones — aretesoluciones.space';

export const navItems: NavItem[] = [
  { id: 'situacion', label: 'Situación' },
  { id: 'sistema', label: 'Sistema' },
  { id: 'web', label: 'Web' },
  { id: 'panel', label: 'Panel' },
  { id: 'agentes', label: 'Agentes' },
  { id: 'emergencias', label: 'Emergencias' },
  { id: 'inversion', label: 'Inversión' },
  { id: 'proceso', label: 'Proceso' },
];

// ── 01 — La situación que resuelve (punto 2 del .md) ────────────────────────
export const situacionComparacion: ComparacionItem[] = [
  { antes: 'Las propiedades están repartidas entre redes, portales y catálogos', despues: 'Una sola web, siempre actualizada, con toda la cartera' },
  { antes: 'Una propiedad vendida o alquilada puede seguir apareciendo publicada', despues: 'Se marca como vendida en el panel y desaparece de la web y del agente al instante' },
  { antes: 'Las consultas dependen del horario de la oficina', despues: 'Ventas y Alquileres atienden las 24 horas, todos los días' },
  { antes: 'Una emergencia a las 3 de la mañana depende de que alguien atienda el teléfono', despues: 'El agente de Emergencias toma el caso, avisa al proveedor y deja todo registrado' },
  { antes: 'No queda claro quién paga cada arreglo', despues: 'Cada reclamo queda con el responsable del cargo: dueño o inquilino, según el contrato' },
  { antes: 'El interesado que escribe de noche se enfría hasta el día siguiente', despues: 'Se lo atiende en el momento y queda cargado como contacto para el equipo' },
];

// ── 02 — La decisión de arquitectura (puntos 1 y 11 del .md) ────────────────
export const arquitecturaCaras: FeatureItem[] = [
  { icon: Home, t: 'Web de propiedades', q: 'Los clientes', d: 'Catálogo con buscador, ficha completa y video de cada propiedad.' },
  { icon: LayoutDashboard, t: 'Panel', q: 'El equipo de Payma', d: 'Carga, edición y baja de propiedades, fotos y videos, sin depender de nadie.' },
  { icon: Bot, t: 'Agentes de IA', q: 'Las 24 horas', d: 'Ventas, Alquileres y Emergencias, conectados entre sí, por la web y WhatsApp.' },
  { icon: Wrench, t: 'Emergencias', q: 'Inquilinos y proveedores', d: 'Toma el reclamo, avisa al proveedor y deja registrado quién paga.' },
];

export const nucleoBody = 'Una sola base de datos central alimenta la web, el panel y los tres agentes.';
export const nucleoItems: string[] = [
  'Un solo sistema. Web, panel y agentes leen la misma base. Lo que se actualiza en un lugar se actualiza en todos.',
  'Los agentes no inventan. Responden con la información de Payma o derivan a una persona.',
  'Nada se entrega sin probar. Cada agente se entrega con sus pruebas hechas, caso por caso.',
];

// ── 03 — La web de propiedades (punto 3.1 del .md) ──────────────────────────
// Las fotos son cuadros del propio recorrido del hero (public/propuesta-payma/
// frames/desktop/) — la misma casa, no son fotos de stock ni inventadas.
export type WebTabData = { id: string; label: string; intro?: string; items?: string[]; img?: string };
const FRAMES = '/propuesta-payma/frames/desktop';
export const webTabs: WebTabData[] = [
  {
    id: 'portada',
    label: 'Portada con recorrido',
    intro: 'A medida que la persona baja por la página, la cámara avanza: fachada, puerta de entrada, living, cocina, patio. Es el tipo de portada que hoy usan las inmobiliarias y marcas de primer nivel en el mundo. El recorrido se produce con Inteligencia Artificial, con una casa de estética propia de la región, sin necesidad de filmar.',
    img: `${FRAMES}/f_0001.webp`,
  },
  {
    id: 'catalogo',
    label: 'Catálogo con buscador',
    intro: 'Filtros por operación (venta o alquiler), tipo de propiedad, barrio, precio, dormitorios y servicios.',
    img: `${FRAMES}/f_0025.webp`,
  },
  {
    id: 'ficha',
    label: 'Ficha de cada propiedad',
    items: [
      'Galería de fotos en alta calidad.',
      'Descripción completa y características.',
      'Ubicación en el mapa.',
      'Video recorrido de la propiedad, cargado por Payma desde el panel.',
      'Botón "Consultar esta propiedad", que abre la conversación con el agente ya ubicado en esa propiedad.',
    ],
    img: `${FRAMES}/f_0150.webp`,
  },
  {
    id: 'diseno',
    label: 'Diseño',
    intro: 'Hecho a medida, con animaciones y transiciones cuidadas. No es una plantilla. Funciona igual de bien en celular que en computadora.',
    img: `${FRAMES}/f_0270.webp`,
  },
];

// ── 04 — El panel de Payma (punto 3.2 del .md) ──────────────────────────────
export const panelPull = 'La regla de diseño es una sola: Payma no depende de nadie para mantener su cartera al día.';
export const panelItems: string[] = [
  'Carga, edición y baja de propiedades, fotos y videos desde un panel simple.',
  'El video se sube tal cual está: el sistema lo optimiza solo para que la web no pierda velocidad.',
  'Estados de cada propiedad: disponible, reservada, vendida, alquilada.',
  'Importación inicial de toda la cartera. Las propiedades actuales se traen de una sola vez desde el catálogo existente o desde una planilla. Nadie las carga una por una.',
  'Usuarios con contraseña, por persona.',
];

// ── 05 — Los tres agentes (puntos 3.3 y 5 del .md) ──────────────────────────
export type AgenteColumna = { titulo: string; items: string[] };
export const agentesColumnas: AgenteColumna[] = [
  {
    titulo: 'Ventas',
    items: [
      'Ofrece solamente propiedades reales y disponibles de la base de Payma.',
      'Entiende qué busca la persona, filtra y presenta las opciones que corresponden.',
      'Toma los datos del interesado y agenda la visita.',
    ],
  },
  {
    titulo: 'Alquileres',
    items: [
      'Ofrece las propiedades en alquiler disponibles.',
      'Explica condiciones y requisitos cargados por Payma.',
      'Toma los datos del interesado y agenda la visita.',
    ],
  },
  {
    titulo: 'Emergencias 24/7',
    items: [
      'Atiende cerrajería, plomería, vidriería, electricidad y gas.',
      'Identifica la propiedad y al inquilino, y entiende qué pasó.',
      'Arma el reclamo y avisa por WhatsApp al proveedor que corresponde.',
      'Le confirma al inquilino que el caso está tomado.',
    ],
  },
];

export const agentesTraspaso =
  'Los tres están conectados: si alguien consulta en Alquileres y cuenta que se le rompió un caño, el agente lo pasa a Emergencias sin cortar la conversación. Nadie queda hablando con el agente equivocado.';

export const agentesLimites: string[] = [
  'No ofrecen propiedades que no estén cargadas como disponibles.',
  'No inventan precios, medidas, condiciones ni estados de documentación.',
  'No cierran operaciones ni reciben pagos o señas.',
  'No prometen horarios de llegada de un proveedor que no estén confirmados.',
  'No convocan proveedores que no estén en la lista de Payma.',
  'Si les preguntan si son una persona, aclaran que son un asistente de Payma.',
];

// Sección "Pruébenlo ustedes": mismo agente real que ya está en producción
// en /empresa/agentes-ia (no se inventa nada, es el mismo agent_id y la
// misma descripción que ahí).
export const agentePrueba: AgentData = {
  id: 'agent_3301m2r6j4vdehetg6346v5njx37',
  nombre: 'Payma',
  tipo: 'Inmobiliaria',
  tagline: 'Consulta de propiedades · Disponibilidad · Logística',
  emoji: '🏢',
  desc: 'Agente inmobiliario de voz. Qualifica prospectos, consulta el catálogo de propiedades, informa disponibilidad, coordina visitas y registra cada interacción automáticamente.',
  caps: [
    'Consulta de propiedades disponibles',
    'Filtro por zona, precio y tipo',
    'Coordinación de visitas',
    'Registro y seguimiento del prospecto',
  ],
  video: { src: '/payma_logo_video.mp4', poster: '/payma_logo_video-poster.jpg' },
  accentColor: 'rgba(99,102,241,1)',
  accentBg: 'rgba(99,102,241,0.07)',
  accentBorder: 'rgba(99,102,241,0.2)',
  label: 'Payma',
};

// ── 06 — Emergencias 24/7 (punto 3.4 del .md) ───────────────────────────────
export const emergenciasPasos: string[] = [
  'Llama el inquilino',
  'El agente identifica la propiedad y el problema',
  'Arma el reclamo',
  'Avisa al proveedor por WhatsApp',
  'Queda registrado quién paga',
];

export const emergenciasItems: string[] = [
  'Registro de proveedores por rubro, con la gente de confianza y capacitada que elige Payma. El agente solo convoca a proveedores de esa lista.',
  'Reglas de despacho definidas por Payma desde el panel: qué casos el agente manda directo y cuáles necesitan aprobación de alguien de la inmobiliaria antes de convocar al proveedor.',
  'Quién paga. Cada contrato de alquiler guarda si los arreglos corren por cuenta del dueño o del inquilino. Cada reclamo queda registrado con su responsable del cargo, listo para cobrar.',
  'Historial completo por propiedad: qué se rompió, cuándo, quién lo arregló y quién lo pagó.',
];

// ── 07 — Incluido sin cargo: la ficha compartible (punto 4 del .md) ─────────
export const fichaBody: string[] = [
  'Cada propiedad genera, con un clic, una ficha lista para compartir: link y PDF con fotos, datos principales y botón de contacto. Se manda por WhatsApp a un interesado o se publica en redes en segundos.',
  'Para una inmobiliaria con cientos de propiedades, esto ahorra horas de trabajo por semana.',
];

// ── 08 — El sistema es de Payma (punto 6 del .md) ───────────────────────────
export const libertadBody = 'Areté entrega el sistema funcionando y Payma queda libre. No hay abono mensual con Areté.';
export const libertadItems: string[] = [
  'Todas las cuentas de servicios se crean a nombre de Payma: alojamiento de la web, base de datos, videos, agentes de voz y WhatsApp.',
  'Payma paga cada servicio directamente a su proveedor, sin intermediarios ni recargos.',
];
export const libertadCosto = 'Costo estimado de esos servicios: entre USD 80 y 200 por mes. Si el uso es bajo, es menos.';
export const libertadPull = 'Si más adelante Payma quiere cambios, funcionalidades nuevas o acompañamiento, se cotiza puntualmente, solo cuando lo pida.';

// ── 09 — Inversión (punto 10 del .md) ───────────────────────────────────────
export const inversionConceptos: { concepto: string; monto: string }[] = [
  { concepto: 'Web con portada de recorrido, catálogo y fichas con video', monto: 'Incluido' },
  { concepto: 'Base central, panel de carga e importación de la cartera', monto: 'Incluido' },
  { concepto: 'Agentes de Ventas y Alquileres (web y WhatsApp)', monto: 'Incluido' },
  { concepto: 'Agente de Emergencias 24/7 y módulo de proveedores y reclamos', monto: 'Incluido' },
  { concepto: 'Ficha compartible por propiedad', monto: 'Sin cargo' },
];
export const inversionTotal = { concepto: 'Total, pago único', monto: 'USD 5.200' };

export const formaDePago: { momento: string; porcentaje: string; monto: string }[] = [
  { momento: 'Al confirmar', porcentaje: '40%', monto: 'USD 2.080' },
  { momento: 'Entrega de la web y el panel', porcentaje: '30%', monto: 'USD 1.560' },
  { momento: 'Agentes funcionando y traspaso de cuentas', porcentaje: '30%', monto: 'USD 1.560' },
];

// ── 10 — Proceso (puntos 7 y 8 del .md) ─────────────────────────────────────
export const procesoEtapas: NumberedItem[] = [
  { n: '01', t: 'Base central y panel', d: 'Estructura de datos, panel de carga e importación de la cartera actual.' },
  { n: '02', t: 'Web', d: 'Portada con recorrido, catálogo, fichas y ficha compartible.' },
  { n: '03', t: 'Agentes', d: 'Ventas, Alquileres y Emergencias, conectados a la base, en la web y en WhatsApp.' },
  { n: '04', t: 'Pruebas y puesta en marcha', d: 'Cada agente se prueba con casos reales: búsqueda de casa, consulta por un alquiler, puerta trabada de madrugada, caño roto, vidrio roto. Capacitación del equipo de Payma en el uso del panel y traspaso de todas las cuentas.' },
];

export const necesitamos: NumberedItem[] = [
  { n: '01', t: 'Acceso a la cartera actual: el catálogo existente o una planilla con las propiedades.', d: '' },
  { n: '02', t: 'Fotos y videos de las propiedades que ya tengan.', d: '' },
  { n: '03', t: 'Condiciones y requisitos de alquiler y de venta.', d: '' },
  { n: '04', t: 'Lista de proveedores de emergencia por rubro, con sus contactos.', d: '' },
  { n: '05', t: 'Para cada contrato de alquiler: quién se hace cargo de los arreglos.', d: '' },
  { n: '06', t: 'Una línea nueva para el WhatsApp de los agentes.', d: '' },
  { n: '07', t: 'Logo y colores de Payma.', d: '' },
  { n: '08', t: 'Una persona de referencia para resolver dudas durante la implementación.', d: '' },
];

// ── Cierre (punto 12 del .md) ───────────────────────────────────────────────
export const cierreTexto = 'Confirmación por escrito de esta propuesta y el pago del 40% inicial. Con eso arranca la Etapa 1 y corre el plazo de entrega.';
