-- =====================================================================
-- 0091 · DEMO PROVIDUS — plantilla de WhatsApp al cliente
--
-- Guarda la configuración de la demo (la plantilla de WhatsApp: texto, si se envía solo y desde qué número)
-- y deja registrado, en cada lead, si el mensaje se envió.
--
-- SEGURIDAD: RLS activado y sin políticas: solo el servidor (service role) toca estas tablas.
-- PARA CORRER POR DIEGO (SQL Editor de Supabase), DESPUÉS de 0090. Es idempotente.
-- =====================================================================

create table if not exists public.demo_providus_config (
  clave          text primary key,
  valor          jsonb not null default '{}'::jsonb,
  actualizado_en timestamptz not null default now()
);
alter table public.demo_providus_config enable row level security;

alter table public.demo_providus_registros add column if not exists whatsapp_estado text;        -- enviado | fallido | omitido
alter table public.demo_providus_registros add column if not exists whatsapp_en     timestamptz;
alter table public.demo_providus_registros add column if not exists whatsapp_error  text;

-- Rollback (solo si hace falta):
-- alter table public.demo_providus_registros drop column if exists whatsapp_estado, drop column if exists whatsapp_en, drop column if exists whatsapp_error;
-- drop table if exists public.demo_providus_config;
