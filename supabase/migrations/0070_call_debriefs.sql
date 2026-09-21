-- call_debriefs: Shared post-call debrief space for setter + closer escalation tracking
CREATE TABLE IF NOT EXISTS public.call_debriefs (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at    timestamptz DEFAULT now() NOT NULL,
  updated_at    timestamptz DEFAULT now() NOT NULL,

  -- Links
  lead_id       uuid REFERENCES public.leads(id) ON DELETE SET NULL,
  reunion_id    uuid REFERENCES public.reuniones_externas(id) ON DELETE SET NULL,
  creado_por    uuid REFERENCES auth.users(id) NOT NULL,
  closer_id     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  setter_id     uuid REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Outcome
  resultado     text NOT NULL CHECK (resultado IN ('ganado','perdido','reagendar','seguimiento','no_show')),
  monto_usd     numeric(10,2) DEFAULT NULL,

  -- Notes by role (editable by each party)
  notas_closer  text NOT NULL DEFAULT '',
  notas_setter  text NOT NULL DEFAULT '',

  -- Escalation
  proximo_paso  text NOT NULL DEFAULT '',
  fecha_proximo_paso timestamptz DEFAULT NULL
);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_call_debriefs_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_call_debriefs_updated
  BEFORE UPDATE ON public.call_debriefs
  FOR EACH ROW EXECUTE PROCEDURE public.set_call_debriefs_updated_at();

-- RLS
ALTER TABLE public.call_debriefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "debriefs_select" ON public.call_debriefs
  FOR SELECT USING (
    closer_id = auth.uid()
    OR setter_id = auth.uid()
    OR creado_por = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "debriefs_insert" ON public.call_debriefs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND creado_por = auth.uid());

CREATE POLICY "debriefs_update" ON public.call_debriefs
  FOR UPDATE USING (
    closer_id = auth.uid()
    OR setter_id = auth.uid()
    OR creado_por = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
