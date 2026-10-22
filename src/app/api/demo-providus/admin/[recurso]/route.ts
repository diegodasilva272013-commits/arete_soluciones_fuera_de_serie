/**
 * DEMO PROVIDUS — ABM de promotoras, eventos y sucursales. Solo administración.
 * No se borra nada: la baja es "activa = false" (los registros ya cargados conservan
 * su copia de los datos de la promotora, el evento y la sucursal).
 *  GET    /api/demo-providus/admin/{promotoras|eventos|sucursales}   → listado con cantidad de cargas
 *  POST   …                                                          → alta (promotoras: multipart con foto)
 *  PATCH  …                                                          → edición / activar / desactivar / nueva clave
 */

import { NextResponse } from 'next/server';
import { esAdmin, hashearClave, sesionActual } from '@/lib/demo-providus/sesion';
import { normalizarTelefono } from '@/lib/demo-providus/telefono';
import { COLS_PROMOTORA, COLS_VENDEDOR, db, errorDeFoto, FALTA_SQL, FALTA_SQL_VENDEDORES, falla, PROVINCIAS_AR, publica, subirFoto, tablaFaltante, USUARIO_OK, vendedorPublico } from '@/lib/demo-providus/datos';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const RECURSOS = ['promotoras', 'eventos', 'sucursales', 'vendedores'] as const;
type Recurso = (typeof RECURSOS)[number];
const TABLA: Record<Recurso, string> = { promotoras: 'demo_providus_promotoras', eventos: 'demo_providus_eventos', sucursales: 'demo_providus_sucursales', vendedores: 'demo_providus_vendedores' };
const COLUMNA_REGISTRO: Record<Recurso, string> = { promotoras: 'promotora_id', eventos: 'evento_id', sucursales: 'sucursal_id', vendedores: 'vendedor_id' };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const guardia = (recurso: string): { recurso: Recurso } | { error: Response } => {
  if (!esAdmin(sesionActual())) return { error: falla('sesion', 401, 'Ingresá con la clave de administración.') };
  if (!(RECURSOS as readonly string[]).includes(recurso)) return { error: falla('recurso', 404, 'Ese recurso no existe.') };
  return { recurso: recurso as Recurso };
};

const txt = (v: unknown, max = 120): string => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/** Lista de provincias válida (sin repetidas) o null si trae alguna que no existe. */
function zonasValidas(v: unknown): string[] | null {
  if (!Array.isArray(v)) return [];
  const lista = Array.from(new Set(v.filter((x): x is string => typeof x === 'string')));
  return lista.every((p) => (PROVINCIAS_AR as readonly string[]).includes(p)) ? lista : null;
}

function errorBase(e: { code?: string; message?: string }, vendedores = false) {
  if (tablaFaltante(e)) return falla('tabla', 503, vendedores ? FALTA_SQL_VENDEDORES : FALTA_SQL);
  if (e.code === '23505') return falla('duplicado', 409, 'Ya existe uno con ese nombre o usuario.');
  if (e.code === '23514') return falla('valor', 422, 'Hay un valor fuera de rango (por ejemplo la edad).');
  console.error('[demo-providus] admin', e.code, e.message);
  return falla('base', 502, `No se pudo guardar: ${e.message}`);
}

export async function GET(_req: Request, { params }: { params: { recurso: string } }) {
  const g = guardia(params.recurso);
  if ('error' in g) return g.error;
  const r = g.recurso;
  const admin = db();
  const cols = r === 'promotoras' ? COLS_PROMOTORA : r === 'vendedores' ? COLS_VENDEDOR : '*';
  const [lista, regs] = await Promise.all([
    admin.from(TABLA[r]).select(cols).order('creado_en', { ascending: false }),
    admin.from('demo_providus_registros').select(COLUMNA_REGISTRO[r]).eq('eliminado', false).limit(10000),
  ]);
  if (lista.error) return errorBase(lista.error, r === 'vendedores');
  const cuenta = new Map<string, number>();
  for (const x of (regs.data ?? []) as Record<string, string | null>[]) {
    const k = x[COLUMNA_REGISTRO[r]];
    if (k) cuenta.set(k, (cuenta.get(k) ?? 0) + 1);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filas = (lista.data as any[]).map((f) => ({ ...(r === 'promotoras' ? publica(f) : r === 'vendedores' ? vendedorPublico(f) : f), cargas: cuenta.get(f.id) ?? 0 }));
  return NextResponse.json({ ok: true, filas }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(req: Request, { params }: { params: { recurso: string } }) {
  const g = guardia(params.recurso);
  if ('error' in g) return g.error;
  const admin = db();

  if (g.recurso === 'promotoras') {
    let f: FormData;
    try { f = await req.formData(); } catch { return falla('pedido_invalido', 400, 'El envío llegó incompleto.'); }
    const usuario = txt(f.get('usuario'), 30).toLowerCase();
    const clave = String(f.get('clave') ?? '');
    const nombre = txt(f.get('nombre'), 80);
    const apellido = txt(f.get('apellido'), 80);
    const edad = Number(f.get('edad'));
    const sucursalId = txt(f.get('sucursal_id'), 60);
    if (!USUARIO_OK.test(usuario)) return falla('usuario', 422, 'El usuario va en minúsculas, de 3 a 30 caracteres (letras, números, punto, guion).');
    if (clave.length < 6) return falla('clave', 422, 'La clave tiene que tener al menos 6 caracteres.');
    if (nombre.length < 2 || apellido.length < 2) return falla('nombre', 422, 'Faltan el nombre y el apellido.');
    if (!Number.isInteger(edad) || edad < 16 || edad > 99) return falla('edad', 422, 'La edad tiene que estar entre 16 y 99.');
    if (!UUID.test(sucursalId)) return falla('sucursal', 422, 'Elegí la sucursal.');
    const eFoto = errorDeFoto(f.get('foto'));
    if (eFoto) return falla('foto', 422, eFoto);
    let fotoUrl: string;
    try { fotoUrl = await subirFoto(f.get('foto') as File, 'promotoras/'); } catch (e) { return falla('storage', 502, e instanceof Error ? e.message : 'No se pudo subir la foto.'); }
    const { data, error } = await admin
      .from('demo_providus_promotoras')
      .insert({ usuario, clave_hash: await hashearClave(clave), nombre, apellido, edad, foto_url: fotoUrl, sucursal_id: sucursalId })
      .select(COLS_PROMOTORA)
      .single();
    if (error) return errorBase(error);
    return NextResponse.json({ ok: true, fila: publica(data) });
  }

  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return falla('pedido_invalido', 400, 'El envío llegó incompleto.'); }
  if (g.recurso === 'vendedores') {
    const usuario = txt(b.usuario, 30).toLowerCase();
    const clave = typeof b.clave === 'string' ? b.clave : '';
    const nombreV = txt(b.nombre, 80);
    const apellidoV = txt(b.apellido, 80);
    const celular = normalizarTelefono(txt(b.telefono, 40));
    const provincias = zonasValidas(b.provincias);
    if (!USUARIO_OK.test(usuario)) return falla('usuario', 422, 'El usuario va en minúsculas, de 3 a 30 caracteres (letras, números, punto, guion).');
    if (clave.length < 6) return falla('clave', 422, 'La clave tiene que tener al menos 6 caracteres.');
    if (nombreV.length < 2 || apellidoV.length < 2) return falla('nombre', 422, 'Faltan el nombre y el apellido.');
    if (!celular) return falla('telefono', 422, 'El celular no es válido. Escribilo con código de área, por ejemplo 345 4100816.');
    if (!provincias) return falla('provincias', 422, 'Hay una provincia que no está en la lista.');
    if (!provincias.length && b.recibe_resto !== true) return falla('zona', 422, 'Elegí al menos una provincia, o marcá que recibe los leads de las zonas sin vendedor.');
    const { data, error } = await admin
      .from('demo_providus_vendedores')
      .insert({ usuario, clave_hash: await hashearClave(clave), nombre: nombreV, apellido: apellidoV, telefono_e164: celular, provincias, recibe_resto: b.recibe_resto === true, llamar_ia: b.llamar_ia !== false })
      .select(COLS_VENDEDOR)
      .single();
    if (error) return errorBase(error, true);
    return NextResponse.json({ ok: true, fila: vendedorPublico(data) });
  }
  const nombre = txt(b.nombre, 80);
  if (nombre.length < 2) return falla('nombre', 422, 'Falta el nombre (mínimo 2 letras).');
  const fila = g.recurso === 'eventos'
    ? { nombre, lugar: txt(b.lugar) || null, fecha: /^\d{4}-\d{2}-\d{2}$/.test(txt(b.fecha, 10)) ? txt(b.fecha, 10) : null }
    : { nombre, ciudad: txt(b.ciudad) || null };
  const { data, error } = await admin.from(TABLA[g.recurso]).insert(fila).select('*').single();
  if (error) return errorBase(error);
  return NextResponse.json({ ok: true, fila: data });
}

export async function PATCH(req: Request, { params }: { params: { recurso: string } }) {
  const g = guardia(params.recurso);
  if ('error' in g) return g.error;
  const admin = db();

  if (g.recurso === 'promotoras') {
    let f: FormData;
    try { f = await req.formData(); } catch { return falla('pedido_invalido', 400, 'El envío llegó incompleto.'); }
    const id = txt(f.get('id'), 60);
    if (!UUID.test(id)) return falla('id_invalido', 400, 'El identificador no es válido.');
    const cambios: Record<string, unknown> = {};
    if (f.has('nombre')) { const v = txt(f.get('nombre'), 80); if (v.length < 2) return falla('nombre', 422, 'Falta el nombre.'); cambios.nombre = v; }
    if (f.has('apellido')) { const v = txt(f.get('apellido'), 80); if (v.length < 2) return falla('apellido', 422, 'Falta el apellido.'); cambios.apellido = v; }
    if (f.has('edad')) { const v = Number(f.get('edad')); if (!Number.isInteger(v) || v < 16 || v > 99) return falla('edad', 422, 'La edad tiene que estar entre 16 y 99.'); cambios.edad = v; }
    if (f.has('sucursal_id')) { const v = txt(f.get('sucursal_id'), 60); if (!UUID.test(v)) return falla('sucursal', 422, 'Elegí la sucursal.'); cambios.sucursal_id = v; }
    if (f.has('activa')) cambios.activa = String(f.get('activa')) === 'true';
    if (f.has('clave') && String(f.get('clave')) !== '') {
      const c = String(f.get('clave'));
      if (c.length < 6) return falla('clave', 422, 'La clave tiene que tener al menos 6 caracteres.');
      cambios.clave_hash = await hashearClave(c);
    }
    const foto = f.get('foto');
    if (foto instanceof File && foto.size > 0) {
      const e = errorDeFoto(foto);
      if (e) return falla('foto', 422, e);
      try { cambios.foto_url = await subirFoto(foto, 'promotoras/'); } catch (err) { return falla('storage', 502, err instanceof Error ? err.message : 'No se pudo subir la foto.'); }
    }
    if (!Object.keys(cambios).length) return falla('sin_cambios', 422, 'No hay nada para cambiar.');
    const { data, error } = await admin.from('demo_providus_promotoras').update(cambios).eq('id', id).select(COLS_PROMOTORA).maybeSingle();
    if (error) return errorBase(error);
    if (!data) return falla('no_existe', 404, 'Esa promotora no existe.');
    return NextResponse.json({ ok: true, fila: publica(data) });
  }

  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return falla('pedido_invalido', 400, 'El envío llegó incompleto.'); }
  const id = txt(b.id, 60);
  if (!UUID.test(id)) return falla('id_invalido', 400, 'El identificador no es válido.');
  const cambios: Record<string, unknown> = {};
  if (g.recurso === 'vendedores') {
    if ('nombre' in b) { const v = txt(b.nombre, 80); if (v.length < 2) return falla('nombre', 422, 'Falta el nombre.'); cambios.nombre = v; }
    if ('apellido' in b) { const v = txt(b.apellido, 80); if (v.length < 2) return falla('apellido', 422, 'Falta el apellido.'); cambios.apellido = v; }
    if ('telefono' in b) { const v = normalizarTelefono(txt(b.telefono, 40)); if (!v) return falla('telefono', 422, 'El celular no es válido.'); cambios.telefono_e164 = v; }
    if ('provincias' in b) { const v = zonasValidas(b.provincias); if (!v) return falla('provincias', 422, 'Hay una provincia que no está en la lista.'); cambios.provincias = v; }
    if ('recibe_resto' in b) cambios.recibe_resto = b.recibe_resto === true;
    if ('llamar_ia' in b) cambios.llamar_ia = b.llamar_ia === true;
    if ('activo' in b) cambios.activo = b.activo === true;
    if (typeof b.clave === 'string' && b.clave !== '') {
      if (b.clave.length < 6) return falla('clave', 422, 'La clave tiene que tener al menos 6 caracteres.');
      cambios.clave_hash = await hashearClave(b.clave);
    }
    if (!Object.keys(cambios).length) return falla('sin_cambios', 422, 'No hay nada para cambiar.');
    const { data, error } = await admin.from('demo_providus_vendedores').update(cambios).eq('id', id).select(COLS_VENDEDOR).maybeSingle();
    if (error) return errorBase(error, true);
    if (!data) return falla('no_existe', 404, 'Ese vendedor no existe.');
    return NextResponse.json({ ok: true, fila: vendedorPublico(data) });
  }
  if ('nombre' in b) { const v = txt(b.nombre, 80); if (v.length < 2) return falla('nombre', 422, 'Falta el nombre.'); cambios.nombre = v; }
  if (g.recurso === 'eventos') {
    if ('lugar' in b) cambios.lugar = txt(b.lugar) || null;
    if ('fecha' in b) cambios.fecha = /^\d{4}-\d{2}-\d{2}$/.test(txt(b.fecha, 10)) ? txt(b.fecha, 10) : null;
    if ('activo' in b) cambios.activo = b.activo === true;
  } else {
    if ('ciudad' in b) cambios.ciudad = txt(b.ciudad) || null;
    if ('activa' in b) cambios.activa = b.activa === true;
  }
  if (!Object.keys(cambios).length) return falla('sin_cambios', 422, 'No hay nada para cambiar.');
  const { data, error } = await admin.from(TABLA[g.recurso]).update(cambios).eq('id', id).select('*').maybeSingle();
  if (error) return errorBase(error);
  if (!data) return falla('no_existe', 404, 'No existe.');
  return NextResponse.json({ ok: true, fila: data });
}
