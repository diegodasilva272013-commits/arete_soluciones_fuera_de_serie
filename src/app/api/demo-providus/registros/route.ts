/**
 * DEMO PROVIDUS — registros del stand.
 *
 * POST: alta de un registro. Exige sesión de promotora. El servidor valida y normaliza todo
 * (también el teléfono), y "estampa" en el registro quién lo cargó (promotora con foto, nombre,
 * apellido y edad), su sucursal y el evento: esos datos NO vienen del navegador, vienen de la
 * sesión y de la base, y se copian dentro del registro para que el historial no cambie si
 * después se edita a la promotora.
 * GET: lectura para la central. Exige sesión de administración.
 * El navegador nunca toca la base: todo pasa por acá con la service role.
 */

import { NextResponse } from 'next/server';
import { caracteresValidos, normalizarTelefono } from '@/lib/demo-providus/telefono';
import { esAdmin, sesionActual } from '@/lib/demo-providus/sesion';
import { db, errorDeFoto, FALTA_SQL, falla, ipDe, subirFoto, tablaFaltante } from '@/lib/demo-providus/datos';
import { asignarYAvisar } from '@/lib/demo-providus/flujo';
import { PROVINCIAS_AR } from '@/lib/demo-providus/provincias';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const PROVINCIAS = new Set<string>(PROVINCIAS_AR);

// Tope simple por IP (mejor esfuerzo por instancia): frena un bucle, no un ataque.
const ventana = new Map<string, number[]>();
function permitido(ip: string, max = 40): boolean {
  const ahora = Date.now();
  const recientes = (ventana.get(ip) ?? []).filter((t) => ahora - t < 60_000);
  if (recientes.length >= max) {
    ventana.set(ip, recientes);
    return false;
  }
  recientes.push(ahora);
  ventana.set(ip, recientes);
  return true;
}

const texto = (f: FormData, k: string, max: number): string => String(f.get(k) ?? '').trim().slice(0, max);

export async function POST(req: Request) {
  const sesion = sesionActual();
  if (!sesion || sesion.t !== 'p') return falla('sesion', 401, 'Tu sesión venció. Volvé a ingresar.');
  if (!permitido(ipDe(req))) return falla('limite', 429, 'Demasiados envíos seguidos. Esperá un minuto.');

  let f: FormData;
  try {
    f = await req.formData();
  } catch {
    return falla('pedido_invalido', 400, 'El envío llegó incompleto.');
  }

  const nombre = texto(f, 'nombre', 80);
  const apellido = texto(f, 'apellido', 80);
  const telefono = texto(f, 'telefono', 40);
  const email = texto(f, 'email', 120);
  const instagram = texto(f, 'instagram', 60).replace(/^@+/, '');
  const provincia = texto(f, 'provincia', 60);
  const localidad = texto(f, 'localidad', 80);
  const eventoId = texto(f, 'evento_id', 60);

  if (nombre.length < 2) return falla('nombre', 422, 'Falta el nombre (mínimo 2 letras).');
  if (apellido.length < 2) return falla('apellido', 422, 'Falta el apellido (mínimo 2 letras).');
  if (!telefono || !caracteresValidos(telefono)) return falla('telefono', 422, 'El teléfono solo puede tener números, espacios, guiones y paréntesis.');
  const e164 = normalizarTelefono(telefono);
  if (!e164) return falla('telefono', 422, 'No pudimos armar el número para llamar. Revisá el código de área.');
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return falla('email', 422, 'El correo no parece válido.');
  if (!PROVINCIAS.has(provincia)) return falla('provincia', 422, 'Elegí una provincia de la lista.');
  if (!eventoId) return falla('evento', 422, 'Elegí el evento.');
  const f1 = f.get('foto');
  const eFoto = errorDeFoto(f1);
  if (eFoto) return falla('foto', 422, eFoto);

  let admin: ReturnType<typeof db>;
  try {
    admin = db();
  } catch {
    return falla('servidor', 503, 'El servidor no tiene acceso a la base (falta la clave de servicio).');
  }

  // Quién carga y en qué evento: se leen de la base, no del navegador.
  const [{ data: prom, error: ep }, { data: ev, error: ee }] = await Promise.all([
    admin.from('demo_providus_promotoras').select('id, nombre, apellido, edad, foto_url, activa, sucursal_id, sucursal:demo_providus_sucursales(nombre)').eq('id', sesion.id).maybeSingle(),
    admin.from('demo_providus_eventos').select('id, nombre, activo').eq('id', eventoId).maybeSingle(),
  ]);
  const eb = ep ?? ee;
  if (eb) return tablaFaltante(eb) ? falla('tabla', 503, FALTA_SQL) : falla('base', 502, `No se pudo leer la base: ${eb.message}`);
  if (!prom || !prom.activa) return falla('sesion', 401, 'Tu usuario ya no está activo. Avisale a quien administra.');
  if (!ev || !ev.activo) return falla('evento', 422, 'Ese evento ya no está activo. Elegí otro.');

  let fotoUrl: string;
  try {
    fotoUrl = await subirFoto(f1 as File, '');
  } catch (e) {
    console.error('[demo-providus] foto', e instanceof Error ? e.message : e);
    return falla('storage', 502, e instanceof Error ? e.message : 'No se pudo subir la foto.');
  }

  const { data, error } = await admin
    .from('demo_providus_registros')
    .insert({
      nombre, apellido, telefono, telefono_e164: e164,
      email: email || null, instagram: instagram || null, provincia, localidad: localidad || null, foto_url: fotoUrl,
      // quién, dónde y cuándo
      evento: ev.nombre, evento_id: ev.id,
      promotora: `${prom.nombre} ${prom.apellido}`.trim(), promotora_id: prom.id,
      promotora_nombre: prom.nombre, promotora_apellido: prom.apellido, promotora_edad: prom.edad, promotora_foto_url: prom.foto_url,
      sucursal_id: prom.sucursal_id, sucursal: prom.sucursal?.nombre ?? null,
      dispositivo: (req.headers.get('user-agent') ?? '').slice(0, 120),
    })
    .select('id')
    .single();

  if (error || !data) {
    console.error('[demo-providus] no se pudo guardar el registro', error?.code, error?.message);
    if (tablaFaltante(error)) return falla('tabla', 503, FALTA_SQL);
    return falla('base', 502, `No se pudo guardar: ${error?.message ?? 'sin detalle'}`);
  }

  // Ya está guardado. Ahora se asigna al vendedor de la zona y, si corresponde, el agente de IA le llama.
  // Nunca rompe el alta: si algo falla, el lead queda guardado igual (sin asignar o sin llamada).
  const aviso = await asignarYAvisar(admin, {
    id: data.id as string, nombre, apellido, telefono_e164: e164, provincia, localidad: localidad || null,
    promotora: `${prom.nombre} ${prom.apellido}`.trim(), evento: ev.nombre,
  });

  return NextResponse.json({ ok: true, id: data.id as string, foto_url: fotoUrl, telefono_e164: e164, asignado: aviso.vendedor !== null, llamada: aviso.llamada });
}

/**
 * Lectura para la pantalla central (/demo_providus/central): los últimos 50 registros vivos
 * con todos sus datos (cliente, promotora, sucursal y evento) y los ids dados de baja
 * recientemente. Solo administración. La central consulta esto cada ~1,5 s.
 */
export async function GET() {
  if (!esAdmin(sesionActual())) return falla('sesion', 401, 'Ingresá con la clave de administración.');
  let admin: ReturnType<typeof db>;
  try {
    admin = db();
  } catch {
    return falla('servidor', 503, 'El servidor no tiene acceso a la base (falta la clave de servicio).');
  }
  const colsBase = 'id, creado_en, nombre, apellido, telefono, telefono_e164, provincia, localidad, foto_url, evento, evento_id, promotora, promotora_id, promotora_nombre, promotora_apellido, promotora_edad, promotora_foto_url, sucursal, vendedor_id';
  const leer = (cols: string) => admin.from('demo_providus_registros').select(cols).eq('eliminado', false).order('creado_en', { ascending: false }).limit(50);
  // Con vendedor y estado de la llamada. Si todavía no se corrió la migración 0089 esas columnas no existen: se lee sin ellas.
  let vivos = await leer(`${colsBase}, vendedor_nombre, contacto_estado, llamada_estado`);
  if (vivos.error && (vivos.error.code === '42703' || /column .* does not exist/i.test(vivos.error.message ?? ''))) vivos = await leer(colsBase);
  const bajas = await admin.from('demo_providus_registros').select('id').eq('eliminado', true).order('creado_en', { ascending: false }).limit(50);
  const error = vivos.error ?? bajas.error;
  if (error) {
    console.error('[demo-providus] no se pudo listar', error.code, error.message);
    if (tablaFaltante(error)) return falla('tabla', 503, FALTA_SQL);
    return falla('base', 502, `No se pudo leer la base: ${error.message}`);
  }
  return NextResponse.json(
    { ok: true, registros: vivos.data ?? [], bajas: (bajas.data ?? []).map((x: { id: string }) => x.id), servidor: new Date().toISOString() },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
