// Todo el contenido de la propuesta de bombas y motores de agua vive acá,
// tipado. Cambiar un precio o una frase es tocar solo este archivo — los
// componentes no tienen texto hardcodeado.

import type { Metric } from '@/components/propuesta/MetricStrip';
import type { ComparacionItem } from '@/components/propuesta/ElasticComparacion';
import type { NumberedItem } from '@/components/propuesta/NumberedList';
import type { NavItem } from '@/components/propuesta/SectionNav';

export const nombreCliente = 'Bombas y motores de agua';
export const kicker = 'Propuesta para Diego · Octubre 2026';

export const heroTitulo1 = 'Su catálogo completo, en una web propia.';
export const heroTitulo2Em = 'Y cada consulta, directo a su WhatsApp.';

// Plazo de entrega: todavía no está definido. Vacío = no se muestra.
export const plazo = '';

export const heroMetricas: Metric[] = [
  { val: 'USD 620', label: 'Inversión total', sub: '' },
  { val: '50% / 50%', label: 'Al confirmar y al terminar', sub: '' },
  { val: 'Tarjeta · Mercado Pago', label: 'En cuotas con Mercado Pago', sub: '' },
  ...(plazo ? [{ val: plazo, label: 'Entrega', sub: '' }] : []),
];

// ── Portada con scroll ──────────────────────────────────────────────────────
export type HeroEtapa = { desde: number; hasta: number; kicker: string; titulo: string; texto: string };
export type HeroContent = {
  marca: string;
  bajada: string;
  indicacion_scroll: string;
  etapas: HeroEtapa[];
  /** Punto del recorrido (0..1) que se muestra fijo con prefers-reduced-motion. */
  cuadro_estatico: number;
  /** Largo del recorrido en vh de scroll. */
  recorrido_vh: number;
};

export const hero: HeroContent = {
  marca: 'Propuesta de Areté Soluciones',
  bajada: 'Así va a ser la portada de su web.',
  indicacion_scroll: 'Deslizá para ver',
  cuadro_estatico: 0.9,
  recorrido_vh: 500,
  etapas: [
    { desde: 0.0, hasta: 0.2, kicker: 'Web y catálogo', titulo: 'Cada producto, en detalle.', texto: 'El cliente ve lo que compra antes de consultar.' },
    { desde: 0.2, hasta: 0.45, kicker: 'Portada con movimiento', titulo: 'La portada abre la bomba.', texto: 'A medida que baja por la página, la bomba se desarma pieza por pieza.' },
    { desde: 0.45, hasta: 0.7, kicker: 'Catálogo', titulo: 'Todo el catálogo, en una sola web.', texto: 'Bombas, motores y repuestos, con fotos y datos de cada uno.' },
    { desde: 0.7, hasta: 0.86, kicker: 'Panel propio', titulo: 'Ustedes cargan todo, sin depender de nadie.', texto: 'Productos y fotos, desde un panel simple.' },
    { desde: 0.86, hasta: 1.0, kicker: 'WhatsApp', titulo: 'Cada consulta llega a su WhatsApp.', texto: 'Un botón en cada producto y en toda la web.' },
  ],
};

export type SectionMeta = { eyebrow: string; titulo1: string; titulo2Em: string };
export const sections: Record<string, SectionMeta> = {
  situacion: { eyebrow: '01 — Antes y después de la web', titulo1: 'Antes y después', titulo2Em: 'de la web.' },
  web: { eyebrow: '02 — La web', titulo1: 'Todo lo que el cliente necesita,', titulo2Em: 'en un solo lugar.' },
  panel: { eyebrow: '03 — Panel propio', titulo1: 'Su catálogo, al día,', titulo2Em: 'sin depender de nadie.' },
  inversion: { eyebrow: '04 — Inversión', titulo1: 'Inversión total,', titulo2Em: 'USD 620.' },
  proceso: { eyebrow: '05 — Cómo lo hacemos', titulo1: 'Cómo lo hacemos,', titulo2Em: 'en tres etapas.' },
};
export const necesitamosEyebrow = 'Qué necesitamos de ustedes';
export const formaDePagoEyebrow = 'Forma de pago';
export const mediosDePagoEyebrow = 'Medios de pago';
export const cierreTitulo = 'Para avanzar.';
export const cierreBotonLabel = 'Aceptar propuesta';
export const footerText = 'Areté Soluciones — aretesoluciones.space';

export const navItems: NavItem[] = [
  { id: 'situacion', label: 'Antes y después' },
  { id: 'web', label: 'Web' },
  { id: 'panel', label: 'Panel' },
  { id: 'inversion', label: 'Inversión' },
  { id: 'proceso', label: 'Proceso' },
];

// ── 01 — Antes y después de la web ──────────────────────────────────────────
export const situacionLabelAntes = 'Hoy';
export const situacionLabelDespues = 'Con la web';
export const situacionComparacion: ComparacionItem[] = [
  { antes: 'El catálogo está en fotos sueltas y hay que mandarlo a mano a cada cliente', despues: 'Todo el catálogo en una sola web, siempre disponible' },
  { antes: 'Cada consulta arranca de cero por mensaje', despues: 'El cliente consulta desde el producto que le interesa' },
  { antes: 'Para mostrar un producto nuevo hay que avisar uno por uno', despues: 'Se carga en el panel y aparece en la web al instante' },
];

// ── 02 — La web ─────────────────────────────────────────────────────────────
// Las imágenes son cuadros de la propia portada (public/propuesta-bombas-de-agua/
// frames/desktop/): la misma bomba, no fotos de stock.
export type WebTabData = { id: string; label: string; intro: string; img?: string };
const FRAMES = '/propuesta-bombas-de-agua/frames/desktop';
export const webTabs: WebTabData[] = [
  { id: 'inicio', label: 'Inicio', intro: 'La portada con la bomba que se desarma con el scroll.', img: `${FRAMES}/f_0001.webp` },
  { id: 'empresa', label: 'Empresa / Quiénes somos', intro: 'La historia de la empresa, qué hacen y cómo trabajan.', img: `${FRAMES}/f_0040.webp` },
  { id: 'servicios', label: 'Servicios', intro: 'Los servicios que ofrecen, cada uno con su descripción.', img: `${FRAMES}/f_0080.webp` },
  { id: 'catalogo', label: 'Catálogo', intro: 'Bombas, motores y repuestos, ordenados por categoría, con buscador. Cada producto tiene su ficha, con fotos, descripción y datos técnicos.', img: `${FRAMES}/f_0120.webp` },
  { id: 'contacto', label: 'Contacto', intro: 'Dirección, teléfono, mail, horarios y ubicación.', img: `${FRAMES}/f_0160.webp` },
  { id: 'whatsapp', label: 'WhatsApp', intro: 'Un botón fijo en toda la web y otro en cada producto, que abre la conversación con el nombre del producto ya escrito.', img: `${FRAMES}/f_0192.webp` },
];
export const webNotaDiseno =
  'Hecho a medida, con animaciones y transiciones cuidadas. No es una plantilla. Funciona igual de bien en celular que en computadora.';

// ── 03 — El panel ───────────────────────────────────────────────────────────
export const panelItems: string[] = [
  'Carga, edición y baja de productos y fotos desde un panel simple.',
  'Las fotos se suben tal cual están: el sistema las optimiza solo, para que la web no pierda velocidad.',
  'Categorías del catálogo administradas por ustedes.',
  'Carga inicial del catálogo hecha por Areté, a partir de las fotos y datos que nos pasen.',
  'Acceso con usuario y contraseña.',
];

// ── 04 — Inversión ──────────────────────────────────────────────────────────
export const inversionConceptos: { concepto: string; monto: string }[] = [
  { concepto: 'Web completa: Inicio, Empresa, Servicios, Catálogo y Contacto', monto: 'Incluido' },
  { concepto: 'Botón de WhatsApp en toda la web y en cada producto', monto: 'Incluido' },
  { concepto: 'Panel propio para cargar productos y fotos', monto: 'Incluido' },
  { concepto: 'Carga inicial del catálogo', monto: 'Incluido' },
];
export const inversionTotal = { concepto: 'Total', monto: 'USD 620' };

export const formaDePago: { momento: string; porcentaje: string; monto: string }[] = [
  { momento: 'Al confirmar', porcentaje: '50%', monto: 'USD 310' },
  { momento: 'Al terminar', porcentaje: '50%', monto: 'USD 310' },
];
export const mediosDePago = 'Tarjeta de crédito, tarjeta de débito y Mercado Pago, con las cuotas que ofrezca Mercado Pago.';

// ── 05 — Cómo lo hacemos ────────────────────────────────────────────────────
export const procesoEtapas: NumberedItem[] = [
  { n: '01', t: 'Catálogo y panel', d: 'Estructura del catálogo, panel de carga y carga inicial de los productos.' },
  { n: '02', t: 'Web', d: 'Portada, Empresa, Servicios, Catálogo y Contacto.' },
  { n: '03', t: 'Puesta en marcha', d: 'Pruebas en celular y computadora, y capacitación en el uso del panel.' },
];

export const necesitamos: NumberedItem[] = [
  { n: '01', t: 'Fotos de los productos del catálogo.', d: '' },
  { n: '02', t: 'Datos de cada producto: nombre, categoría y datos técnicos (una planilla sirve).', d: '' },
  { n: '03', t: 'Textos o información de la empresa y de los servicios.', d: '' },
  { n: '04', t: 'Datos de contacto, dirección y horarios.', d: '' },
  { n: '05', t: 'Número de WhatsApp para las consultas.', d: '' },
  { n: '06', t: 'Logo y colores de la empresa.', d: '' },
];

// ── Cierre ──────────────────────────────────────────────────────────────────
export const cierreTexto = 'Confirmación por escrito de esta propuesta y el pago del 50% inicial. Con eso arrancamos.';
