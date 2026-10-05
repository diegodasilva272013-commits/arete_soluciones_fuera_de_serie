#!/usr/bin/env node
// Revierte el bucket 'frecuencia-imagenes' vía Storage API — nunca por
// SQL directo, porque storage.objects/storage.buckets están protegidos
// en producción contra DELETE (triggers protect_objects_delete /
// protect_buckets_delete). Correr ANTES del rollback SQL de la
// migración 0078 (ver 0078_frecuencia_modelo_ROLLBACK.sql).
//
// Uso:
//   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
//     node scripts/frecuencia-bucket-rollback.mjs

import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY en el entorno.');
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey);

const BUCKET = 'frecuencia-imagenes';

const { data: archivos, error: errorListar } = await supabase.storage.from(BUCKET).list();
if (errorListar) {
  console.error('Error al listar el bucket:', errorListar);
  process.exit(1);
}

// list() solo devuelve el primer nivel — cada entrada de primer nivel
// acá es una carpeta de usuario (user_id). Hay que bajar una carpeta
// más para juntar las rutas completas antes de vaciar.
const rutas = [];
for (const carpeta of archivos ?? []) {
  const { data: enCarpeta, error: errorSub } = await supabase.storage.from(BUCKET).list(carpeta.name);
  if (errorSub) {
    console.error(`Error al listar la carpeta ${carpeta.name}:`, errorSub);
    process.exit(1);
  }
  for (const archivo of enCarpeta ?? []) {
    rutas.push(`${carpeta.name}/${archivo.name}`);
  }
}

if (rutas.length > 0) {
  const { data: borrados, error: errorBorrar } = await supabase.storage.from(BUCKET).remove(rutas);
  if (errorBorrar) {
    console.error('Error al vaciar el bucket:', errorBorrar);
    process.exit(1);
  }
  console.log(`Vaciado: ${borrados?.length ?? 0} archivo(s) borrados.`, borrados);
} else {
  console.log('El bucket ya estaba vacío.');
}

const { data: eliminado, error: errorEliminar } = await supabase.storage.deleteBucket(BUCKET);
if (errorEliminar) {
  console.error('Error al eliminar el bucket:', errorEliminar);
  process.exit(1);
}

console.log('deleteBucket():', eliminado);
