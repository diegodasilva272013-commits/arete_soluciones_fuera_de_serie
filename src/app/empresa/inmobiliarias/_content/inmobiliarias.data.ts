// Todo el contenido de /empresa/inmobiliarias vive acá. Los componentes no
// tienen texto. Fuente: oferta definida por Diego el 26/10/2026.

import { Bot, Globe, Database, BarChart3, GraduationCap, UserCheck } from 'lucide-react';
import type { Metric } from '@/components/propuesta/MetricStrip';
import type { ComparacionItem } from '@/components/propuesta/ElasticComparacion';
import type { FeatureItem } from '@/components/propuesta/FeatureGrid';
import type { NumberedItem } from '@/components/propuesta/NumberedList';
import type { NavItem } from '@/components/propuesta/SectionNav';

export const kicker = 'Areté Soluciones · Para inmobiliarias';
export const heroTitulo1 = 'No adaptamos tu inmobiliaria a un sistema.';
export const heroTitulo2Em = 'Construimos el sistema sobre cómo trabaja tu inmobiliaria.';
export const heroSub =
  'Inmobiliarias hay miles, pero no todas trabajan igual. Adaptamos el software a tu operativa diaria para que, con números reales, puedas cuantificar y escalar.';

export const heroMetricas: Metric[] = [
  { val: 'A medida', label: 'No es un SaaS', sub: 'El sistema se adapta a tu operativa' },
  { val: '24 horas', label: 'Atención', sub: 'WhatsApp, web y teléfono' },
  { val: '50% + 50%', label: 'Forma de pago', sub: 'El segundo pago, cuando está al 100%' },
];

export type SectionMeta = { eyebrow: string; titulo1: string; titulo2Em: string; sub?: string };
export const sections: Record<string, SectionMeta> = {
  problema: { eyebrow: '01 — Lo que pasa hoy', titulo1: 'El problema no es la demanda.', titulo2Em: 'Es lo que pasa después de la consulta.' },
  sistema: { eyebrow: '02 — Lo que construimos', titulo1: 'Un solo sistema,', titulo2Em: 'hecho para tu inmobiliaria.' },
  entrada: { eyebrow: '03 — Por dónde se empieza', titulo1: 'Primero, el agente', titulo2Em: 'que atiende y agenda.' },
  diferencia: { eyebrow: '04 — Por qué es distinto', titulo1: 'Software a medida,', titulo2Em: 'no un sistema más.' },
  noHacemos: { eyebrow: '05 — Lo que no hacemos', titulo1: 'También nos define', titulo2Em: 'lo que no hacemos.' },
  inversion: {
    eyebrow: '06 — Inversión',
    titulo1: 'Desde el corredor que empieza',
    titulo2Em: 'hasta la inmobiliaria que quiere escalar.',
    sub: 'Son referencias, no planes cerrados: el valor final depende de lo que necesite cada inmobiliaria y de la tecnología que haga falta.',
  },
  garantia: { eyebrow: '07 — Garantía', titulo1: 'No está terminado', titulo2Em: 'hasta que vos digas que está al 100%.' },
  proceso: { eyebrow: '08 — Cómo trabajamos', titulo1: 'Primero entendemos,', titulo2Em: 'después construimos.' },
};

export const navItems: NavItem[] = [
  { id: 'problema', label: 'Problema' },
  { id: 'sistema', label: 'Sistema' },
  { id: 'entrada', label: 'Entrada' },
  { id: 'diferencia', label: 'Diferencia' },
  { id: 'inversion', label: 'Inversión' },
  { id: 'garantia', label: 'Garantía' },
  { id: 'proceso', label: 'Proceso' },
];

// ── 01 — Lo que pasa hoy ───────────────────────────────────────────────────
export const problemaComparacion: ComparacionItem[] = [
  { antes: 'Las consultas de la noche y del fin de semana se responden tarde o no se responden', despues: 'El agente atiende en el momento, las 24 horas, y deja la visita agendada' },
  { antes: 'Llamadas que nadie atiende', despues: 'El agente atiende el teléfono también' },
  { antes: 'Los datos están repartidos entre WhatsApp, planillas, portales y la memoria de cada vendedor', despues: 'Todo queda en una sola base de datos, en tu propio sistema' },
  { antes: 'Unos vendedores venden y otros no, y nadie sabe bien por qué', despues: 'Estadísticas de cada vendedor: cómo vende, qué vende y por qué' },
  { antes: 'Se contrata vendedores, no rinden y se los descarta', despues: 'Evaluación de perfiles y formación con Areté Fuera de Serie' },
  { antes: 'Una web igual a la de todas, con otro logo', despues: 'Una web institucional propia, distinta de cualquier otra' },
];

// ── 02 — Lo que construimos ────────────────────────────────────────────────
export const servicios: FeatureItem[] = [
  { icon: Bot, t: 'Agentes de IA', q: 'WhatsApp, web y teléfono', d: 'Atienden, responden consultas, califican y agendan, las 24 horas.' },
  { icon: Globe, t: 'Web institucional', q: 'Identidad propia', d: 'Distintiva, hecha para tu inmobiliaria. No una plantilla con otro logo.' },
  { icon: Database, t: 'ERP y datos centralizados', q: 'Una sola base', d: 'Web, agentes y gestión trabajan sobre la misma información.' },
  { icon: BarChart3, t: 'Estadísticas de vendedores', q: 'Para nivelar al equipo', d: 'Cómo vende cada uno, qué vende y por qué.' },
  { icon: GraduationCap, t: 'Formación de vendedores', q: 'Areté Fuera de Serie', d: 'Entrenamiento comercial dentro del mismo sistema.' },
  { icon: UserCheck, t: 'Recursos humanos', q: 'Perfiles más preparados', d: 'Evaluación estandarizada para incorporar mejores vendedores.' },
];
export const serviciosCierre = 'Y lo que tu operativa necesite. El único límite es la creatividad.';

// ── 03 — Por dónde se empieza ──────────────────────────────────────────────
export const entradaBody = [
  'La mayoría de las inmobiliarias empieza por el agente de IA que atiende y agenda: es lo que resuelve el día a día desde la primera semana.',
  'Sobre esa base se suma lo que haga falta, cuando haga falta: la web, el ERP, las estadísticas del equipo o la formación de vendedores.',
];
export const entradaItems = [
  'Atiende clientes por WhatsApp, web y teléfono.',
  'Responde consultas con la información real de tu inmobiliaria.',
  'Califica y filtra a cada interesado.',
  'Agenda la visita.',
  'Deja todo registrado y medido en tu panel.',
];

// ── 04 — Por qué es distinto ───────────────────────────────────────────────
export const diferencias: NumberedItem[] = [
  { n: '01', t: 'Software hecho a medida', d: 'No es una plataforma enlatada a la que tu inmobiliaria se tiene que adaptar.' },
  { n: '02', t: 'Agentes entrenados en ventas', d: 'No es una IA genérica: los agentes trabajan con método comercial.' },
  { n: '03', t: 'Nada es estándar', d: 'Todo se construye en base a tu negocio y a cómo trabaja tu equipo.' },
  { n: '04', t: 'Paneles propios', d: 'Ves y trabajás tus datos en tu propio sistema.' },
  { n: '05', t: 'Cualquier canal', d: 'Se adapta a los canales donde están tus clientes.' },
];

// ── 05 — Lo que no hacemos ─────────────────────────────────────────────────
export const noHacemos: string[] = [
  'No implementamos por implementar.',
  'No metemos tecnología ni inteligencia artificial si no hace falta.',
  'No automatizamos el desorden: primero ordenamos, después sistematizamos.',
  'No adaptamos tu empresa a la tecnología: la tecnología se adapta a tu empresa.',
  'No vendemos plantillas ni soluciones enlatadas.',
  'No ponemos IA genérica.',
  'No inventamos respuestas: el agente trabaja solo con la información real de tu inmobiliaria.',
  'No te dejamos atado a nosotros: tus datos y tu panel son tuyos.',
  'No damos por terminado un trabajo al 99%.',
  'No le decimos que sí a todo: si algo no le sirve a tu negocio, te lo decimos.',
];

// ── 06 — Inversión ─────────────────────────────────────────────────────────
export type Nivel = { nombre: string; rango: string; para: string; incluye: string };
export const niveles: Nivel[] = [
  { nombre: 'Entrada', rango: 'USD 1.200 a 2.000', para: 'El corredor o la inmobiliaria que está empezando.', incluye: 'Agente de IA que atiende y agenda.' },
  { nombre: 'Intermedio', rango: 'USD 2.000 a 5.000', para: 'La inmobiliaria que quiere atender mejor y verse distinta.', incluye: 'Agentes de IA y web institucional.' },
  { nombre: 'Completo', rango: 'USD 5.000 a 10.000', para: 'La inmobiliaria con equipo, volumen e intención de escalar.', incluye: 'Agentes, web, ERP, estadísticas de vendedores, formación y recursos humanos, según la infraestructura y la tecnología que implementemos.' },
];

// ── 07 — Garantía ──────────────────────────────────────────────────────────
export const garantiaItems: string[] = [
  'Pagás el 50% para arrancar. El otro 50%, recién cuando está entregado.',
  'La entrega no termina hasta que vos digas que está al 100%. No al 99%: al 100%.',
  'Si algo no funciona como lo necesitás, lo ajustamos hasta que quede, sin costo extra y sin cobrarte el segundo pago antes.',
];
export const garantiaPull = '50% para arrancar, 50% cuando vos digas que está al 100%. No antes.';

// ── 08 — Cómo trabajamos (las seis etapas de Areté) ────────────────────────
export const proceso: NumberedItem[] = [
  { n: '01', t: 'Inmersión', d: 'Entendemos cómo trabaja tu inmobiliaria en el día a día.' },
  { n: '02', t: 'Auditoría', d: 'Vemos dónde se pierden consultas, tiempo y ventas.' },
  { n: '03', t: 'Priorización', d: 'Elegimos primero lo que más impacto tiene.' },
  { n: '04', t: 'Arquitectura', d: 'Diseñamos el sistema sobre tu operativa.' },
  { n: '05', t: 'Implementación', d: 'Lo construimos y lo probamos caso por caso.' },
  { n: '06', t: 'Evolución', d: 'Lo hacemos crecer junto con tu inmobiliaria.' },
];

// ── Cierre ─────────────────────────────────────────────────────────────────
export const cierreTitulo = 'Contanos cómo trabaja tu inmobiliaria.';
export const cierreTexto = 'Con eso te mostramos qué se puede construir para vos.';
export const cierreBoton = 'Hablar por WhatsApp';
export const cierreBotonSecundario = 'Ir a contacto';
