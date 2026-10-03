-- =====================================================================
-- Migración 0077
-- Areté Fuera de Serie · Temporadas: inscriptos a las clases en vivo.
-- Landing pública en /fuera-de-serie/temporada-1, vista admin en
-- /admin/temporada-1 (desde ahí se envía el link de Zoom a todos).
-- Idempotente. Pegar en Supabase → SQL Editor → Run.
-- =====================================================================

create table if not exists public.fds_temporada_registros (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  temporada        text not null default 'temporada-1',
  nombre           text not null,
  apellido         text not null,
  edad             int,
  email            text not null,
  telefono         text not null,
  motivo           text not null,   -- qué espera de las clases / por qué quiere participar
  zoom_enviado_at  timestamptz       -- null = todavía no recibió el link de Zoom
);

-- Una inscripción por mail y temporada (re-registrarse actualiza los datos).
-- El API guarda el email ya normalizado (trim + lowercase).
create unique index if not exists fds_temporada_registros_email_uidx
  on public.fds_temporada_registros(temporada, email);
create index if not exists fds_temporada_registros_created_idx
  on public.fds_temporada_registros(created_at desc);

alter table public.fds_temporada_registros enable row level security;

-- Sin política de insert: el alta pública se hace solo vía el API route
-- con la service_role key (mismo criterio que reclutamiento_postulantes).
drop policy if exists "fds_temporada_registros_admin_all" on public.fds_temporada_registros;
create policy "fds_temporada_registros_admin_all"
on public.fds_temporada_registros for all
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));
