-- =====================================================================
-- Camino al Closing — Migración 0065
-- Reclutamiento: tabla de postulantes + buckets de storage (foto/video).
-- Landing pública en /reclutamiento, vista admin en /admin/reclutamiento.
-- Idempotente. Pegar en Supabase → SQL Editor → Run.
-- =====================================================================

-- =====================================================================
-- 1. Tabla de postulantes
-- =====================================================================
create table if not exists public.reclutamiento_postulantes (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  nombre         text not null,
  apellido       text not null,
  email          text not null,
  edad           int,
  experiencia    text,
  motivo         text,   -- por qué querés ser parte del equipo
  motivacion     text,   -- qué te motiva a tomar este puesto
  foto_path      text,   -- path dentro del bucket reclutamiento-fotos
  video_path     text,   -- path dentro del bucket reclutamiento-videos
  estado         text not null default 'nuevo'
                 check (estado in ('nuevo', 'revisando', 'entrevista', 'aceptado', 'rechazado')),
  notas_admin    text,
  reviewed_by    uuid references public.profiles(id) on delete set null,
  reviewed_at    timestamptz
);

create index if not exists reclutamiento_postulantes_created_idx
  on public.reclutamiento_postulantes(created_at desc);
create index if not exists reclutamiento_postulantes_estado_idx
  on public.reclutamiento_postulantes(estado);

alter table public.reclutamiento_postulantes enable row level security;

-- Sin política de insert: el alta pública se hace únicamente vía el
-- API route del servidor con la service_role key (saltea RLS a
-- propósito), nunca directo desde el browser con la anon key. Así el
-- formulario público no necesita ningún permiso de escritura sobre la
-- tabla, y no hay superficie de RLS que un desconocido pueda explotar
-- para leer o alterar postulaciones ajenas.
drop policy if exists "reclutamiento_postulantes_admin_all" on public.reclutamiento_postulantes;
create policy "reclutamiento_postulantes_admin_all"
on public.reclutamiento_postulantes for all
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- =====================================================================
-- 2. Storage buckets — privados (son datos personales de postulantes,
--    no contenido público). Foto y video se leen vía URL firmada
--    generada por el admin, y se suben vía URL firmada generada por
--    el API route público al crear la postulación.
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('reclutamiento-fotos', 'reclutamiento-fotos', false)
on conflict (id) do update set public = false;

insert into storage.buckets (id, name, public)
values ('reclutamiento-videos', 'reclutamiento-videos', false)
on conflict (id) do update set public = false;

-- Lectura y escritura solo admin vía RLS de storage.objects — el alta
-- pública y la subida de archivos usan la service_role key (que
-- saltea estas políticas), así que esto es solo para bloquear el
-- acceso directo de cualquier usuario logueado no-admin.
do $$
declare
  bucket_name text;
begin
  for bucket_name in select unnest(array['reclutamiento-fotos', 'reclutamiento-videos']) loop
    execute format('drop policy if exists "%s_admin_read" on storage.objects', bucket_name);
    execute format('drop policy if exists "%s_admin_write" on storage.objects', bucket_name);

    execute format(
      'create policy "%s_admin_read" on storage.objects for select using (bucket_id = %L and public.is_admin(auth.uid()))',
      bucket_name, bucket_name
    );
    execute format(
      'create policy "%s_admin_write" on storage.objects for all using (bucket_id = %L and public.is_admin(auth.uid())) with check (bucket_id = %L and public.is_admin(auth.uid()))',
      bucket_name, bucket_name, bucket_name
    );
  end loop;
end $$;
