-- =====================================================================
-- 0089 · DEMO PROVIDUS — vendedores por zona, asignación automática y llamada del agente de IA
--
-- Cada lead que carga una promotora se asigna solo a un vendedor de su zona (provincia) y,
-- si el vendedor tiene activada la llamada de IA, el agente le llama al celular para avisarle.
-- Dentro de cada zona se rota: recibe el que hace más tiempo que no recibe uno.
--
-- SEGURIDAD: igual que 0087/0088, RLS activado y sin políticas: solo el servidor (service role)
-- toca estas tablas. Las claves se guardan con hash (scrypt).
--
-- PARA CORRER POR DIEGO (SQL Editor de Supabase), DESPUÉS de 0088. Es idempotente.
-- =====================================================================

create table if not exists public.demo_providus_vendedores (
  id                uuid primary key default gen_random_uuid(),
  creado_en         timestamptz not null default now(),
  usuario           text not null unique,
  clave_hash        text not null,
  nombre            text not null,
  apellido          text not null,
  telefono_e164     text not null,                 -- celular al que llama el agente de IA
  provincias        text[] not null default '{}',  -- zona: provincias que atiende
  recibe_resto      boolean not null default false, -- recibe los leads de zonas sin vendedor
  llamar_ia         boolean not null default true,
  activo            boolean not null default true,
  ultimo_ingreso    timestamptz,
  ultima_asignacion timestamptz
);

alter table public.demo_providus_vendedores enable row level security;

-- El registro guarda a quién se asignó (copia del nombre) y cómo va el contacto.
alter table public.demo_providus_registros add column if not exists vendedor_nombre text;
alter table public.demo_providus_registros add column if not exists contacto_estado text not null default 'nuevo';
alter table public.demo_providus_registros add column if not exists contacto_en     timestamptz;
alter table public.demo_providus_registros add column if not exists llamada_error   text;

create index if not exists demo_providus_registros_vendedor_idx
  on public.demo_providus_registros (vendedor_id, creado_en desc);

-- Rollback (solo si hace falta):
-- alter table public.demo_providus_registros drop column if exists vendedor_nombre, drop column if exists contacto_estado,
--   drop column if exists contacto_en, drop column if exists llamada_error;
-- drop table if exists public.demo_providus_vendedores;
