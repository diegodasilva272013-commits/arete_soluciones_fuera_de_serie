-- =====================================================================
-- 0087 · DEMO PROVIDUS — Sprint 1 (captura móvil)
--
-- Tabla y bucket de la demo en vivo de Providus (/demo_providus). Está
-- aislada de la plataforma: tabla propia (prefijo demo_providus_) y bucket
-- propio. Las columnas de los sprints 3 y 4 (asignación y llamada) ya están
-- para no migrar después.
--
-- SEGURIDAD: la tabla tiene RLS activado y NINGUNA política para anon/auth.
-- Las escrituras las hace solo el servidor (rutas /api/demo-providus/*) con
-- la service role, que valida y normaliza todo. Así el navegador nunca toca
-- la base directo, aunque la demo no tenga login.
-- El Sprint 2 (pantalla central en vivo) va a necesitar una política de lectura
-- o una ruta del servidor: se decide ahí.
--
-- PARA CORRER POR DIEGO: pegar entero en el SQL Editor de Supabase. Es idempotente.
-- Rollback: al final, comentado.
-- =====================================================================

create extension if not exists "pgcrypto";

create table if not exists public.demo_providus_registros (
  id             uuid primary key default gen_random_uuid(),
  creado_en      timestamptz not null default now(),

  -- datos de la persona
  nombre         text not null,
  apellido       text not null,
  telefono       text not null,          -- tal cual lo escribió la persona (para mostrar)
  telefono_e164  text not null,          -- normalizado para llamar (+549...)
  email          text,
  instagram      text,
  provincia      text not null,
  localidad      text,
  foto_url       text,

  -- contexto de la carga
  evento         text not null default 'Demo Providus',
  promotora      text not null default 'Stand 1',
  dispositivo    text,

  -- sprint 3
  vendedor_id    text,
  asignado_en    timestamptz,

  -- sprint 4
  llamada_estado text not null default 'pendiente',
  llamada_en     timestamptz,
  llamada_ref    text,

  -- baja lógica (la B del ABM)
  eliminado      boolean not null default false
);

create index if not exists demo_providus_registros_creado_idx on public.demo_providus_registros (creado_en desc);
create index if not exists demo_providus_registros_telefono_idx on public.demo_providus_registros (telefono_e164);

alter table public.demo_providus_registros enable row level security;

-- Bucket público de lectura (las fotos se abren por URL). La subida la hace el servidor.
insert into storage.buckets (id, name, public)
values ('demo-providus-fotos', 'demo-providus-fotos', true)
on conflict (id) do update set public = true;

-- Rollback (solo si hace falta):
-- drop table if exists public.demo_providus_registros;
-- delete from storage.buckets where id = 'demo-providus-fotos';
