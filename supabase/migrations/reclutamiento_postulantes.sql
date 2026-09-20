-- ============================================================
-- Reclutamiento: tabla de postulantes + storage buckets
-- Correr en: Supabase → SQL Editor → New query → Run
-- ============================================================

-- 1. Tabla principal
create table if not exists public.reclutamiento_postulantes (
  id            uuid        primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),

  -- Datos del postulante
  nombre        text        not null,
  apellido      text        not null,
  email         text        not null,
  edad          integer     not null check (edad between 16 and 90),
  experiencia   text,
  motivo        text        not null,
  motivacion    text        not null,

  -- Archivos (se llenan después del insert vía upload-url)
  foto_path     text,
  video_path    text,

  -- Revisión por admin
  estado        text        not null default 'nuevo'
                            check (estado in ('nuevo','revisando','entrevista','aceptado','rechazado')),
  notas_admin   text,
  reviewed_by   uuid        references auth.users(id) on delete set null,
  reviewed_at   timestamptz
);

-- 2. Índices útiles para la vista admin
create index if not exists reclutamiento_postulantes_created_at_idx
  on public.reclutamiento_postulantes (created_at desc);

create index if not exists reclutamiento_postulantes_estado_idx
  on public.reclutamiento_postulantes (estado);

-- 3. RLS — la API usa service_role (bypassa RLS por diseño de Supabase).
--    Nadie anónimo puede leer ni escribir directamente.
alter table public.reclutamiento_postulantes enable row level security;

-- Sin policies públicas intencionalmente: toda escritura/lectura
-- pasa por la service_role key en las API routes de Next.js.

-- 4. Storage buckets (privados)
--    Nota: si ya existen no falla gracias al insert ... on conflict do nothing.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('reclutamiento-fotos',  'reclutamiento-fotos',  false, 5242880,
   array['image/jpeg','image/png','image/webp']),
  ('reclutamiento-videos', 'reclutamiento-videos', false, 524288000,
   array['video/mp4','video/webm','video/quicktime'])
on conflict (id) do nothing;

-- ============================================================
-- Verificación rápida — debería devolver la tabla vacía:
-- select * from public.reclutamiento_postulantes limit 1;
-- ============================================================
