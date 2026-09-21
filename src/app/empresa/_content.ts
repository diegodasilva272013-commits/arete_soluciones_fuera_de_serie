/**
 * Fuente única de verdad para copy y datos de contacto de la web pública.
 * Importar desde acá; no hardcodear los mismos strings en varios componentes.
 */

// ── CONTACTO ────────────────────────────────────────────────────────────────

// Número real de Marcos (confirmado 21/09/2026). El anterior (5491143215678) era un placeholder.
export const WA_PHONE         = '5491158280808'; // E.164 sin el +
export const WA_PHONE_DISPLAY = '+54 9 11 5828-0808';

export const WA_MSG_GENERAL  = encodeURIComponent('Hola, quiero saber más sobre Areté Soluciones');
export const WA_MSG_METODO   = encodeURIComponent('Hola, me interesa saber más sobre Areté Soluciones');
export const WA_MSG_SERVICIO = encodeURIComponent('Hola, me interesa el diagnóstico operativo de Areté Soluciones');
export const WA_MSG_DIAGNOSTICO = encodeURIComponent('Hola, quiero saber más sobre el diagnóstico de Areté Soluciones');

export function waUrl(msg: string = WA_MSG_GENERAL): string {
  return `https://wa.me/${WA_PHONE}?text=${msg}`;
}

// ── ÁREAS ───────────────────────────────────────────────────────────────────
// Orden: Demanda → Conversión → Control → Entrega (pedido Marcos 21/09/2026)
export const AREAS_LABELS = [
  'Marketing',
  'Ventas',
  'Administración',
  'Entrega y operaciones',
] as const;

export type AreaLabel = (typeof AREAS_LABELS)[number];
