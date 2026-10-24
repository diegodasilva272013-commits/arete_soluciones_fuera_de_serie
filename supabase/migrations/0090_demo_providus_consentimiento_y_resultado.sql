-- =====================================================================
-- 0090 · DEMO PROVIDUS — consentimiento, resultado de la llamada y reenvío sin duplicados
--
--  · consentimiento / consentimiento_en: el cliente autoriza, en el stand, que lo contacten por teléfono
--    (incluida la llamada del asistente de voz) y por WhatsApp. Solo se llama a quien autorizó.
--  · llamada_segundos / llamada_resumen: cómo terminó la llamada del asistente (duración y resumen de lo conversado).
--  · clave_envio: la genera el celular de la promotora para cada alta; si la red falla y el envío se reintenta,
--    el servidor reconoce la clave y NO crea un registro duplicado.
--
-- PARA CORRER POR DIEGO (SQL Editor de Supabase), DESPUÉS de 0089. Es idempotente.
-- El sistema funciona igual antes de correrla (sin guardar esos datos), pero conviene correrla ya.
-- =====================================================================

alter table public.demo_providus_registros add column if not exists consentimiento    boolean not null default false;
alter table public.demo_providus_registros add column if not exists consentimiento_en timestamptz;
alter table public.demo_providus_registros add column if not exists llamada_segundos  integer;
alter table public.demo_providus_registros add column if not exists llamada_resumen   text;
alter table public.demo_providus_registros add column if not exists clave_envio       text;

create unique index if not exists demo_providus_registros_clave_envio_idx
  on public.demo_providus_registros (clave_envio) where clave_envio is not null;

-- Rollback (solo si hace falta):
-- drop index if exists public.demo_providus_registros_clave_envio_idx;
-- alter table public.demo_providus_registros drop column if exists consentimiento, drop column if exists consentimiento_en,
--   drop column if exists llamada_segundos, drop column if exists llamada_resumen, drop column if exists clave_envio;
