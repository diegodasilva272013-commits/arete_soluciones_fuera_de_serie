#!/usr/bin/env node
// Crea el bucket 'frecuencia-imagenes' vía Storage API — nunca por SQL
// directo, porque storage.buckets está protegido en producción contra
// INSERT (trigger protect_bucket_control_insert). Correr DESPUÉS de la
// migración 0078 (que ya no toca storage.buckets).
//
// Uso:
//   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
//     node scripts/frecuencia-bucket.mjs

import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY en el entorno.');
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey);

const BUCKET = 'frecuencia-imagenes';

const { data: creado, error: errorCrear } = await supabase.storage.createBucket(BUCKET, {
  public: false,
  fileSizeLimit: 5242880,
  allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
});

if (errorCrear) {
  console.error('Error al crear el bucket:', errorCrear);
  process.exit(1);
}

console.log('createBucket():', creado);

const { data: info, error: errorInfo } = await supabase.storage.getBucket(BUCKET);

if (errorInfo) {
  console.error('Error al leer la configuración del bucket:', errorInfo);
  process.exit(1);
}

console.log('getBucket():', info);
