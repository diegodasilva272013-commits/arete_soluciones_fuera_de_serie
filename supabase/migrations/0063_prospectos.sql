-- ============================================================
-- MÓDULO PROSPECTOR — tablas para análisis IA de LinkedIn
-- ============================================================

CREATE TABLE IF NOT EXISTS prospects (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at     TIMESTAMPTZ DEFAULT now(),
  full_name      TEXT NOT NULL DEFAULT 'Sin nombre',
  headline       TEXT DEFAULT '',
  company        TEXT DEFAULT '',
  location       TEXT DEFAULT '',
  linkedin_url   TEXT,
  instagram_url  TEXT,
  source_type    TEXT DEFAULT 'linkedin',
  status         TEXT DEFAULT 'nuevo',
  phase          TEXT DEFAULT 'contacto',
  follow_up_count INTEGER DEFAULT 0,
  assigned_to    UUID REFERENCES auth.users(id),
  created_by     UUID REFERENCES auth.users(id),
  whatsapp_number TEXT,
  notes          TEXT,
  last_contact_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS prospect_analyses (
  id                   UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at           TIMESTAMPTZ DEFAULT now(),
  prospect_id          UUID REFERENCES prospects(id) ON DELETE CASCADE UNIQUE,
  psychological_profile TEXT,
  disc_type            TEXT,
  disc_description     TEXT,
  communication_style  TEXT,
  key_words            TEXT[],
  pain_points          TEXT[],
  sales_angle          TEXT,
  company_analysis     TEXT,
  raw_linkedin_data    TEXT
);

CREATE TABLE IF NOT EXISTS generated_messages (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at      TIMESTAMPTZ DEFAULT now(),
  prospect_id     UUID REFERENCES prospects(id) ON DELETE CASCADE,
  follow_up_number INTEGER,
  phase           TEXT,
  message_type    TEXT,
  content         TEXT
);

CREATE TABLE IF NOT EXISTS prospect_follow_ups (
  id                 UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at         TIMESTAMPTZ DEFAULT now(),
  prospect_id        UUID REFERENCES prospects(id) ON DELETE CASCADE,
  follow_up_number   INTEGER,
  phase              TEXT DEFAULT 'contacto',
  status             TEXT DEFAULT 'enviado',
  prospect_responded BOOLEAN DEFAULT false,
  setter_id          UUID REFERENCES auth.users(id),
  sent_at            TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE prospects          ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospect_analyses  ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospect_follow_ups ENABLE ROW LEVEL SECURITY;

-- FIX: profiles.id = auth.uid() (no user_id, la PK es id)
CREATE POLICY "prospects_access" ON prospects FOR ALL USING (
  assigned_to = auth.uid()
  OR created_by = auth.uid()
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "analyses_access" ON prospect_analyses FOR ALL USING (
  EXISTS (
    SELECT 1 FROM prospects p
    WHERE p.id = prospect_id
      AND (p.assigned_to = auth.uid()
           OR p.created_by = auth.uid()
           OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  )
);

CREATE POLICY "messages_access" ON generated_messages FOR ALL USING (
  EXISTS (
    SELECT 1 FROM prospects p
    WHERE p.id = prospect_id
      AND (p.assigned_to = auth.uid()
           OR p.created_by = auth.uid()
           OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  )
);

CREATE POLICY "followups_access" ON prospect_follow_ups FOR ALL USING (
  EXISTS (
    SELECT 1 FROM prospects p
    WHERE p.id = prospect_id
      AND (p.assigned_to = auth.uid()
           OR p.created_by = auth.uid()
           OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  )
);
