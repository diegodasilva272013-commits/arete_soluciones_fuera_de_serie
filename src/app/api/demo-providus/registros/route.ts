/**
 * DEMO PROVIDUS — Sprint 1. Alta de un registro desde el celular del stand.
 *
 * La demo no tiene login, pero el navegador nunca toca la base: este endpoint
 * valida y normaliza todo (también el teléfono, no confía en el cliente), sube
 * la foto al bucket público y recién después inserta la fila con la service
 * role. Evento, promotora y dispositivo los fija el servidor.
 */

import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-server';
import { caracteresValidos, normalizarTelefono } from '@/lib/demo-providus/telefono';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const BUCKET = 'demo-providus-fotos';
const MAX_FOTO = 2 * 1024 * 1024; // el navegador la achica a ~200 KB; esto es solo un tope
const PROVINCIAS = new Set([
  'Ciudad Autónoma de Buenos Aires', 'Buenos Aires', 'Catamarca', 'Chaco', 'Chubut',
  'Córdoba', 'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja',
  'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan', 'San Luis',
  'Santa Cruz', 'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucumán',
]);

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

function falla(error: string, status: number, detalle?: string) {
  return NextResponse.json({ ok: false, error, detalle }, { status });
}

const texto = (f: FormData, k: string, max: number): string => String(f.get(k) ?? '').trim().slice(0, max);

export async function POST(req: Request) {
  const ip = (req.headers.get('x-forwarded-for') ?? 'sin-ip').split(',')[0].trim();
  if (!permitido(ip)) return falla('limite', 429, 'Demasiados envíos seguidos. Esperá un minuto.');

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

  if (nombre.length < 2) return falla('nombre', 422, 'Falta el nombre (mínimo 2 letras).');
  if (apellido.length < 2) return falla('apellido', 422, 'Falta el apellido (mínimo 2 letras).');
  if (!telefono || !caracteresValidos(telefono)) return falla('telefono', 422, 'El teléfono solo puede tener números, espacios, guiones y paréntesis.');
  const e164 = normalizarTelefono(telefono);
  if (!e164) return falla('telefono', 422, 'No pudimos armar el número para llamar. Revisá el código de área.');
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return falla('email', 422, 'El correo no parece válido.');
  if (!PROVINCIAS.has(provincia)) return falla('provincia', 422, 'Elegí una provincia de la lista.');

  const foto = f.get('foto');
  if (!(foto instanceof File) || foto.size === 0) return falla('foto', 422, 'Falta la foto.');
  if (foto.size > MAX_FOTO) return falla('foto', 413, 'La foto es demasiado pesada.');
  if (!/^image\/(jpeg|png|webp)$/.test(foto.type)) return falla('foto', 415, 'La foto tiene que ser JPG, PNG o WebP.');

  let admin: ReturnType<typeof createSupabaseAdminClient>;
  try {
    admin = createSupabaseAdminClient();
  } catch (e) {
    console.error('[demo-providus] sin cliente admin', e instanceof Error ? e.message : e);
    return falla('servidor', 503, 'El servidor no tiene acceso a la base (falta la clave de servicio).');
  }

  // Bucket: se crea una sola vez si no existe (la migración 0087 también lo crea).
  const { error: errBucket } = await admin.storage.getBucket(BUCKET);
  if (errBucket) {
    const { error: errCrear } = await admin.storage.createBucket(BUCKET, { public: true });
    if (errCrear && !/already exists|duplicate/i.test(errCrear.message)) {
      console.error('[demo-providus] no se pudo crear el bucket', errCrear.message);
      return falla('storage', 503, `No se pudo preparar el almacenamiento de fotos: ${errCrear.message}`);
    }
  }

  const ext = foto.type === 'image/png' ? 'png' : foto.type === 'image/webp' ? 'webp' : 'jpg';
  const archivo = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error: errSubida } = await admin.storage.from(BUCKET).upload(archivo, Buffer.from(await foto.arrayBuffer()), { contentType: foto.type, upsert: false });
  if (errSubida) {
    console.error('[demo-providus] no se pudo subir la foto', errSubida.message);
    return falla('storage', 502, `No se pudo subir la foto: ${errSubida.message}`);
  }
  const fotoUrl = admin.storage.from(BUCKET).getPublicUrl(archivo).data.publicUrl;

  const { data, error } = await (admin as any)
    .from('demo_providus_registros')
    .insert({
      nombre,
      apellido,
      telefono,
      telefono_e164: e164,
      email: email || null,
      instagram: instagram || null,
      provincia,
      localidad: localidad || null,
      foto_url: fotoUrl,
      evento: 'Demo Providus',
      promotora: 'Stand 1',
      dispositivo: (req.headers.get('user-agent') ?? '').slice(0, 120),
    })
    .select('id')
    .single();

  if (error || !data) {
    console.error('[demo-providus] no se pudo guardar el registro', error?.code, error?.message);
    // 42P01 = la tabla no existe: falta correr la migración 0087.
    if (error?.code === '42P01' || /does not exist|schema cache/i.test(error?.message ?? '')) {
      return falla('tabla', 503, 'Falta crear la tabla de la demo en Supabase (correr 0087_demo_providus.sql).');
    }
    return falla('base', 502, `No se pudo guardar: ${error?.message ?? 'sin detalle'}`);
  }

  return NextResponse.json({ ok: true, id: data.id as string, foto_url: fotoUrl, telefono_e164: e164 });
}
