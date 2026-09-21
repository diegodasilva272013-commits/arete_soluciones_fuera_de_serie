/**
 * Fuente única de verdad para copy y datos de contacto de la web pública.
 * Importar desde acá; no hardcodear los mismos strings en varios componentes.
 */

// ── CONTACTO ────────────────────────────────────────────────────────────────

// TODO(Diego): reemplazar con el número real de WhatsApp de Areté antes de
// publicar en producción. El número anterior (5491143215678) era un
// placeholder secuencial (4321-5678). El actual (5491158280808) fue usado
// para contacto de prueba. Confirmar el número definitivo.
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
// Alternativa para área 4: 'Entrega y operaciones'
// TODO(Diego): confirmar nombre final del área 4 ('Logística y fulfillment'
// suena a producto físico; clientes de servicios profesionales usan 'Entrega').
export const AREAS_LABELS = [
  'Marketing',
  'Ventas',
  'Administración',
  'Logística y fulfillment',
] as const;

export type AreaLabel = (typeof AREAS_LABELS)[number];
