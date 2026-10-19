/**
 * DEMO PROVIDUS — acceso a datos del servidor (service role) y reglas compartidas.
 * Nada de esto llega al navegador: las tablas no tienen políticas públicas.
 */

import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-server';

export const BUCKET = 'demo-providus-fotos';
export const MAX_FOTO = 2 * 1024 * 1024;

export function db() {
  return createSupabaseAdminClient() as any;
}

export function falla(error: string, status: number, detalle?: string) {
  return NextResponse.json({ ok: false, error, detalle }, { status });
}

/** Postgres 42P01 / "schema cache": falta correr la migración. */
export function tablaFaltante(e: { code?: string; message?: string } | null | undefined): boolean {
  return !!e && (e.code === '42P01' || e.code === 'PGRST205' || /does not exist|schema cache|Could not find the/i.test(e.message ?? ''));
}
export const FALTA_SQL = 'Falta correr 0088_demo_providus_promotoras.sql en Supabase.';

export const ipDe = (req: Request) => (req.headers.get('x-forwarded-for') ?? 'sin-ip').split(',')[0].trim();

/** Lo que se muestra de una promotora (nunca el hash de la clave). */
export interface PromotoraPublica {
  id: string;
  usuario: string;
  nombre: string;
  apellido: string;
  edad: number | null;
  foto_url: string | null;
  sucursal_id: string | null;
  sucursal: string | null;
  activa: boolean;
  ultimo_ingreso?: string | null;
  creado_en?: string;
}
export const COLS_PROMOTORA = 'id, usuario, nombre, apellido, edad, foto_url, sucursal_id, activa, ultimo_ingreso, creado_en, sucursal:demo_providus_sucursales(nombre)';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function publica(f: any): PromotoraPublica {
  return {
    id: f.id, usuario: f.usuario, nombre: f.nombre, apellido: f.apellido, edad: f.edad ?? null, foto_url: f.foto_url ?? null,
    sucursal_id: f.sucursal_id ?? null, sucursal: f.sucursal?.nombre ?? null, activa: !!f.activa, ultimo_ingreso: f.ultimo_ingreso ?? null, creado_en: f.creado_en,
  };
}

export async function eventosActivos() {
  const { data, error } = await db().from('demo_providus_eventos').select('id, nombre, lugar, fecha').eq('activo', true).order('creado_en', { ascending: false });
  return { data: (data ?? []) as { id: string; nombre: string; lugar: string | null; fecha: string | null }[], error };
}

export const USUARIO_OK = /^[a-z0-9._-]{3,30}$/;

/** Sube una foto al bucket (crea el bucket si hace falta) y devuelve su URL pública. */
export async function subirFoto(foto: File, carpeta: string): Promise<string> {
  const admin = db();
  const { error: eb } = await admin.storage.getBucket(BUCKET);
  if (eb) {
    const { error: ec } = await admin.storage.createBucket(BUCKET, { public: true });
    if (ec && !/already exists|duplicate/i.test(ec.message)) throw new Error(`No se pudo preparar el almacenamiento de fotos: ${ec.message}`);
  }
  const ext = foto.type === 'image/png' ? 'png' : foto.type === 'image/webp' ? 'webp' : 'jpg';
  const nombre = `${carpeta}${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await admin.storage.from(BUCKET).upload(nombre, Buffer.from(await foto.arrayBuffer()), { contentType: foto.type, upsert: false });
  if (error) throw new Error(`No se pudo subir la foto: ${error.message}`);
  return admin.storage.from(BUCKET).getPublicUrl(nombre).data.publicUrl as string;
}

/** Valida un archivo de foto; devuelve el mensaje de error o null si está bien. */
export function errorDeFoto(f: unknown): string | null {
  if (!(f instanceof File) || f.size === 0) return 'Falta la foto.';
  if (f.size > MAX_FOTO) return 'La foto es demasiado pesada.';
  if (!/^image\/(jpeg|png|webp)$/.test(f.type)) return 'La foto tiene que ser JPG, PNG o WebP.';
  return null;
}
