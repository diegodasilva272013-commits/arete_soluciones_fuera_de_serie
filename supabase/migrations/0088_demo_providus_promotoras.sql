-- =====================================================================
-- 0088 · DEMO PROVIDUS — promotoras, eventos y sucursales
--
-- Cada carga del stand queda identificada: quién la hizo (promotora, con foto, nombre,
-- apellido y edad), en qué sucursal y en qué evento. Esos datos se COPIAN dentro del
-- registro (snapshot) para que el historial no cambie si después se edita a la promotora,
-- y viajan a la pantalla central junto con los datos del cliente.
--
-- SEGURIDAD: igual que 0087, las tablas tienen RLS activado y ninguna política: solo el
-- servidor (service role) las toca. Las claves de las promotoras se guardan con hash
-- (scrypt), nunca en texto plano.
--
-- PARA CORRER POR DIEGO (SQL Editor de Supabase), DESPUÉS de 0087. Es idempotente.
-- =====================================================================

create table if not exists public.demo_providus_sucursales (
  id         uuid primary key default gen_random_uuid(),
  creado_en  timestamptz not null default now(),
  nombre     text not null unique,
  ciudad     text,
  activa     boolean not null default true
);

create table if not exists public.demo_providus_eventos (
  id         uuid primary key default gen_random_uuid(),
  creado_en  timestamptz not null default now(),
  nombre     text not null unique,
  lugar      text,
  fecha      date,
  activo     boolean not null default true
);

create table if not exists public.demo_providus_promotoras (
  id             uuid primary key default gen_random_uuid(),
  creado_en      timestamptz not null default now(),
  usuario        text not null unique,
  clave_hash     text not null,
  nombre         text not null,
  apellido       text not null,
  edad           integer check (edad between 16 and 99),
  foto_url       text,
  sucursal_id    uuid references public.demo_providus_sucursales(id) on delete set null,
  activa         boolean not null default true,
  ultimo_ingreso timestamptz
);

-- Cada registro lleva quién lo cargó, en qué sucursal y en qué evento.
alter table public.demo_providus_registros add column if not exists promotora_id        uuid references public.demo_providus_promotoras(id) on delete set null;
alter table public.demo_providus_registros add column if not exists promotora_nombre    text;
alter table public.demo_providus_registros add column if not exists promotora_apellido  text;
alter table public.demo_providus_registros add column if not exists promotora_edad      integer;
alter table public.demo_providus_registros add column if not exists promotora_foto_url  text;
alter table public.demo_providus_registros add column if not exists sucursal_id         uuid references public.demo_providus_sucursales(id) on delete set null;
alter table public.demo_providus_registros add column if not exists sucursal            text;
alter table public.demo_providus_registros add column if not exists evento_id           uuid references public.demo_providus_eventos(id) on delete set null;

create index if not exists demo_providus_registros_promotora_idx on public.demo_providus_registros (promotora_id);
create index if not exists demo_providus_registros_evento_idx on public.demo_providus_registros (evento_id);

alter table public.demo_providus_sucursales enable row level security;
alter table public.demo_providus_eventos    enable row level security;
alter table public.demo_providus_promotoras enable row level security;

-- Evento inicial (el que ya figuraba en las cargas de prueba).
insert into public.demo_providus_eventos (nombre) values ('Demo Providus') on conflict (nombre) do nothing;

-- Rollback (solo si hace falta):
-- alter table public.demo_providus_registros drop column if exists promotora_id, drop column if exists promotora_nombre,
--   drop column if exists promotora_apellido, drop column if exists promotora_edad, drop column if exists promotora_foto_url,
--   drop column if exists sucursal_id, drop column if exists sucursal, drop column if exists evento_id;
-- drop table if exists public.demo_providus_promotoras, public.demo_providus_eventos, public.demo_providus_sucursales;
