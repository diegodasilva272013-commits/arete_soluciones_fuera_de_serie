// Todo el texto de /propuesta-flota vive acá. Los componentes no tienen texto.

import type { NavItem } from '@/components/propuesta/SectionNav';

export const kicker = 'Propuesta · Panamericano de Jujuy S.A.';
export const portadaTitulo = 'Plataforma integral Panamericano';
export const portadaBajada = 'Web, atención con IA y control de flota en una sola plataforma propia. Con equipos GPS que quedan de ustedes.';
export const marcaAreteLabel = 'Areté Soluciones';

export type SectionMeta = { eyebrow: string; titulo1: string; titulo2Em: string; sub?: string };
export const sections: Record<string, SectionMeta> = {
  situacion: { eyebrow: '01 — La situación', titulo1: 'Termina el contrato de la Secretaría', titulo2Em: 'y hay que decidir.' },
  incluye: { eyebrow: '02 — Qué incluye', titulo1: 'Todo en una', titulo2Em: 'sola plataforma.' },
  inversion: { eyebrow: '03 — Equipos e inversión', titulo1: 'Los equipos', titulo2Em: 'quedan de ustedes.' },
  comparacion: { eyebrow: '04 — Comparación mensual · 20 unidades, con IVA', titulo1: 'Ahorran', titulo2Em: 'y los equipos son suyos.' },
};

export const navItems: NavItem[] = [
  { id: 'situacion', label: 'Situación' },
  { id: 'incluye', label: 'Qué incluye' },
  { id: 'inversion', label: 'Inversión' },
  { id: 'comparacion', label: 'Comparación' },
];

// ── La situación ───────────────────────────────────────────────────────────
export const situacionEyebrow = 'Lo que ofrece TrailingSat para continuar';
export const situacionTarjetas = [
  { t: '$30.000 + IVA por unidad por mes', d: 'Con ajuste por IPC cada 4 meses.' },
  { t: 'Equipos en comodato', d: 'No son de Panamericano y se devuelven al terminar.' },
  { t: 'App del pasajero aparte', d: 'No está incluida en el abono.' },
];

// ── Qué incluye ────────────────────────────────────────────────────────────
export const webTitulo = 'Web y atención (ya acordado)';
export const webItems = [
  'Web con horarios, destinos y reservas.',
  'Agente de IA en la web y en WhatsApp.',
  'Panel de gestión.',
];
export const flotaTitulo = 'Plataforma de flota';
export const flotaItems = [
  'Mapa en vivo de todas las unidades.',
  'Historial de velocidad, recorrido y ubicación (12 meses).',
  'Alertas de exceso de velocidad y de desvío de recorrido, en el panel y por WhatsApp.',
  'Reportes por unidad y por chofer.',
  'App del pasajero "¿Dónde está mi colectivo?" en Google Play.',
  'Ubicación en vivo dentro del agente de WhatsApp.',
];

// ── Equipos e inversión ────────────────────────────────────────────────────
export const equiposTitulo = 'Equipos GPS';
export const equiposItems = [
  'Panamericano los compra de una lista compatible y quedan suyos.',
  'Los coloca un instalador local; nosotros los conectamos a la plataforma.',
  'Primero se prueba un equipo, después se compra el resto.',
];
export const equiposReferencias = 'Referencias: equipo 4G $48.600 a $68.000; chip de datos $2.000/mes por unidad; instalación a cotizar en Jujuy.';

export const inversionTitulo = 'Inversión';
export const inversionWeb = { concepto: 'Web + agentes de IA', monto: 'USD 3.000' };
export const inversionFlota = { concepto: 'Plataforma de flota + app', montoTachado: 'USD 6.000', monto: 'USD 4.500', etiqueta: 'precio por paquete' };
export const inversionTotal = { concepto: 'Total', monto: 'USD 7.500' };
export const inversionPagos = [
  { porcentaje: '50%', momento: 'al iniciar' },
  { porcentaje: '50%', momento: 'al entregar' },
];
export const inversionAbono = 'Abono de la plataforma de flota: $15.000 + IVA por unidad por mes, con ajuste semestral. Incluye servidor, historial, alertas, app y soporte.';
export const inversionLetraChica =
  'El precio por paquete aplica contratando todo junto. App Store de Apple opcional, se cotiza aparte. Costos mensuales de los agentes de IA según los canales activos.';

// ── Comparación mensual ────────────────────────────────────────────────────
export const comparacionColumnas = ['', 'TrailingSat', 'Areté'];
export const comparacionFilas: { concepto: string; trailingsat: string; arete: string; destacada?: boolean }[] = [
  { concepto: 'Abono', trailingsat: '$726.000', arete: '$363.000' },
  { concepto: 'Chips de datos', trailingsat: 'Incluidos', arete: '$40.000' },
  { concepto: 'Total por mes', trailingsat: '$726.000', arete: '$403.000', destacada: true },
  { concepto: 'Ajuste', trailingsat: 'Cada 4 meses por IPC', arete: 'Semestral' },
  { concepto: 'Equipos', trailingsat: 'En comodato', arete: 'Propios' },
  { concepto: 'App del pasajero', trailingsat: 'Aparte', arete: 'Incluida' },
  { concepto: 'Web y agente con ubicación', trailingsat: 'No', arete: 'Sí' },
];
export const comparacionDestacado = 'Ahorro: unos $323.000 por mes. Los equipos (≈ $2.000.000 para 20 unidades) se recuperan en ~6 meses.';

// ── Cierre ─────────────────────────────────────────────────────────────────
export const cierreTexto = '¿Avanzamos? Avísenle a Rodri y coordinamos la prueba del primer equipo.';
