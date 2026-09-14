-- =====================================================================
-- 0066 · Calendario IA — webhooks del agente de voz ElevenLabs
--
-- Tablas:
--   • slots_publicos    — franjas horarias disponibles para prospectos
--   • reuniones_externas — reuniones agendadas por el agente de voz
--   • contactos_ia      — log de llamadas del agente de voz
-- =====================================================================

-- ── 1. slots_publicos ────────────────────────────────────────────────
-- El admin crea aquí los slots disponibles para que el agente de voz los ofrezca.
CREATE TABLE IF NOT EXISTS public.slots_publicos (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  inicio       timestamptz NOT NULL,
  duracion_min integer     NOT NULL DEFAULT 30,
  disponible   boolean     NOT NULL DEFAULT true,
  etiqueta     text,                          -- e.g. "Diagnóstico inicial"
  closer_id    uuid        REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_slots_inicio      ON public.slots_publicos (inicio);
CREATE INDEX IF NOT EXISTS idx_slots_disponible  ON public.slots_publicos (disponible, inicio);

ALTER TABLE public.slots_publicos ENABLE ROW LEVEL SECURITY;

-- Admins: control total
DROP POLICY IF EXISTS slots_admin ON public.slots_publicos;
CREATE POLICY slots_admin ON public.slots_publicos FOR ALL
  USING  (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Service role (webhooks): bypasa RLS automáticamente

-- ── 2. reuniones_externas ─────────────────────────────────────────────
-- Reuniones agendadas por un prospecto mediante el agente de voz.
CREATE TABLE IF NOT EXISTS public.reuniones_externas (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id      uuid        REFERENCES public.slots_publicos(id) ON DELETE SET NULL,
  nombre       text        NOT NULL,
  email        text,
  telefono     text,
  empresa      text,
  motivo       text        NOT NULL DEFAULT '',
  inicio       timestamptz NOT NULL,
  duracion_min integer     NOT NULL DEFAULT 30,
  closer_id    uuid        REFERENCES public.profiles(id) ON DELETE SET NULL,
  estado       text        NOT NULL DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente', 'confirmada', 'completada', 'cancelada', 'no_show')),
  origen       text        NOT NULL DEFAULT 'ia_voz',
  lead_id      uuid        REFERENCES public.leads(id) ON DELETE SET NULL,
  notas_ia     text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_re_estado   ON public.reuniones_externas (estado, inicio);
CREATE INDEX IF NOT EXISTS idx_re_closer   ON public.reuniones_externas (closer_id, inicio);

ALTER TABLE public.reuniones_externas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS re_admin ON public.reuniones_externas;
CREATE POLICY re_admin ON public.reuniones_externas FOR ALL
  USING  (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ── 3. contactos_ia ──────────────────────────────────────────────────
-- Log de cada llamada del agente de voz (independiente de si agendó o no).
CREATE TABLE IF NOT EXISTS public.contactos_ia (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre       text,
  email        text,
  telefono     text,
  empresa      text,
  resumen      text        NOT NULL DEFAULT '',
  duracion_seg integer,
  reunion_id   uuid        REFERENCES public.reuniones_externas(id) ON DELETE SET NULL,
  lead_id      uuid        REFERENCES public.leads(id)              ON DELETE SET NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cia_created ON public.contactos_ia (created_at DESC);

ALTER TABLE public.contactos_ia ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS cia_admin ON public.contactos_ia;
CREATE POLICY cia_admin ON public.contactos_ia FOR ALL
  USING  (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
