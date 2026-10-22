/**
 * DEMO PROVIDUS — a qué vendedor va cada lead.
 *
 * Regla: se mira la provincia del lead. Entre los vendedores activos que atienden esa
 * provincia se elige al que hace más tiempo que no recibe un lead (rotación pareja). Si
 * ninguno la atiende, va a los marcados "recibe el resto" con la misma rotación. Si tampoco
 * hay, el lead queda sin asignar y se ve así en la central.
 */

export interface VendedorZona {
  id: string;
  nombre: string;
  apellido: string;
  telefono_e164: string;
  provincias: string[];
  recibe_resto: boolean;
  llamar_ia: boolean;
  activo: boolean;
  ultima_asignacion: string | null;
}

const cuando = (v: VendedorZona) => (v.ultima_asignacion ? Date.parse(v.ultima_asignacion) : 0);

export function elegirVendedor(vendedores: VendedorZona[], provincia: string): VendedorZona | null {
  const activos = vendedores.filter((v) => v.activo);
  const deLaZona = activos.filter((v) => v.provincias.includes(provincia));
  const candidatos = deLaZona.length ? deLaZona : activos.filter((v) => v.recibe_resto);
  if (!candidatos.length) return null;
  // El que lleva más tiempo sin recibir (nunca recibió = primero); el empate se resuelve por id para que sea estable.
  return [...candidatos].sort((a, b) => cuando(a) - cuando(b) || a.id.localeCompare(b.id))[0];
}
