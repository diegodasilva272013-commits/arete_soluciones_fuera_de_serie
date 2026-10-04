-- =====================================================================
-- 0078 · Frecuencia — modelo de datos completo + knowledge_blocks
--
-- App de desarrollo personal de uso INTERNO (admin/setter/closer, no
-- students por ahora). Reusa auth.users / public.profiles tal cual —
-- no se toca profiles.role ni la lógica de registerAction/isSetter/
-- isCloser/isAdmin. El control de acceso a Frecuencia es independiente
-- del rol de la plataforma: vive en knowledge_blocks (clave
-- 'frecuencia_roles_habilitados'), nunca hardcodeado en componentes.
--
-- Todas las tablas personales llevan RLS por user_id = auth.uid().
-- frecuencia_compromisos y frecuencia_revisiones suman visibilidad de
-- equipo vía equipo_id → public.setter_teams (la "dupla" setter1/
-- setter2 ya existente en la plataforma) y admin.
-- =====================================================================

-- ── knowledge_blocks ──────────────────────────────────────────────────
-- Config y contenido del método, en vez de strings hardcodeados en
-- componentes: las 10 áreas, las 4 energías de escasez, acciones de
-- subida, los 4 pasos ante una falla, reglas del plan, valores por
-- defecto del mapa de energía, y la lista de roles habilitados.
CREATE TABLE IF NOT EXISTS public.knowledge_blocks (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  clave       text        NOT NULL UNIQUE,
  valor       jsonb       NOT NULL,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.knowledge_blocks ENABLE ROW LEVEL SECURITY;

-- Lectura: cualquier usuario autenticado (lo necesita la UI para
-- mostrar labels de áreas, frases, etc.). Escritura: solo admin.
DROP POLICY IF EXISTS knowledge_blocks_select ON public.knowledge_blocks;
CREATE POLICY knowledge_blocks_select ON public.knowledge_blocks FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS knowledge_blocks_admin_write ON public.knowledge_blocks;
CREATE POLICY knowledge_blocks_admin_write ON public.knowledge_blocks FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ── Identidad (1:1 con profiles) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.frecuencia_identidad (
  user_id             uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  quien_creia_ser     text,
  quien_soy           text,
  como_me_ven         text,
  quien_quiero_ser    text,
  no_negociables      jsonb NOT NULL DEFAULT '[]'::jsonb,
  estandar_minimo     jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- ── Mapa de energía ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.frecuencia_mapa_energia (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  franjas                 jsonb NOT NULL DEFAULT '[]'::jsonb, -- [{desde,hasta,tipo}]
  fecha_diagnostico       timestamptz NOT NULL DEFAULT now(),
  proximo_rediagnostico   timestamptz,
  created_at              timestamptz NOT NULL DEFAULT now()
);

-- ── Áreas (instancia por usuario de las 10 áreas de knowledge_blocks) ─
CREATE TABLE IF NOT EXISTS public.frecuencia_areas (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  area_key            text NOT NULL, -- matchea una key de knowledge_blocks['areas_vida']
  nivel_actual        int  NOT NULL DEFAULT 0 CHECK (nivel_actual BETWEEN 0 AND 10),
  es_palanca          boolean NOT NULL DEFAULT false,
  es_manzana_podrida  boolean NOT NULL DEFAULT false,
  updated_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, area_key)
);

-- ── Objetivos ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.frecuencia_objetivos (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  titulo                   text NOT NULL,
  imagen_mental            text,
  area_key                 text,
  fecha_limite             date,
  identidad_que_expresa    text,
  metas_por_periodo        jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now()
);

-- ── Tareas ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.frecuencia_tareas (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  objetivo_id       uuid REFERENCES public.frecuencia_objetivos(id) ON DELETE CASCADE,
  user_id           uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  titulo            text NOT NULL,
  protocolo         jsonb NOT NULL DEFAULT '[]'::jsonb,
  depende_de        uuid[] NOT NULL DEFAULT '{}',
  desbloquea        uuid[] NOT NULL DEFAULT '{}',
  tipo_energia      text, -- PROFUNDO | DECISION | CREATIVO | REUNIONES | BAJO
  duracion_min      int,
  dosis_actual      int NOT NULL DEFAULT 1,
  dosis_objetivo    int,
  veces_postergada  int NOT NULL DEFAULT 0,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- ── Bloques (grilla de programación) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.frecuencia_bloques (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tarea_id              uuid REFERENCES public.frecuencia_tareas(id) ON DELETE SET NULL,
  tipo                  text NOT NULL, -- FOCO | NO_NEGOCIABLE | AREA_DEBIL | IMPREVISTOS | ORQUESTAR | EJECUTAR
  inicio                timestamptz NOT NULL,
  fin                   timestamptz NOT NULL,
  estado                text NOT NULL DEFAULT 'PROGRAMADO', -- PROGRAMADO | EN_EL_AIRE | CUMPLIDO | NO_SALIO
  interrupciones        int NOT NULL DEFAULT 0,
  minutos_reales_foco   int NOT NULL DEFAULT 0,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

-- ── Dial (check-in mañana/noche) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.frecuencia_dial (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  fecha               date NOT NULL DEFAULT CURRENT_DATE,
  momento             text NOT NULL CHECK (momento IN ('manana', 'noche')),
  frecuencia          int NOT NULL CHECK (frecuencia BETWEEN -100 AND 100),
  energias_escasez    jsonb NOT NULL DEFAULT '{}'::jsonb, -- {envidia,resentimiento,critica,queja}
  acciones_subida     jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, fecha, momento)
);

-- ── Espejo ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.frecuencia_espejo (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  fecha               date NOT NULL DEFAULT CURRENT_DATE,
  momento             text NOT NULL CHECK (momento IN ('manana', 'noche')),
  como_me_veo         text,
  como_me_percibo     text,
  como_me_siento      text,
  foto_url            text,
  vestimenta_manana   text,
  created_at          timestamptz NOT NULL DEFAULT now()
);

-- ── Evidencia (registro de emisión) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.frecuencia_evidencia (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  fecha       date NOT NULL DEFAULT CURRENT_DATE,
  texto       text NOT NULL,
  bloque_id   uuid REFERENCES public.frecuencia_bloques(id) ON DELETE SET NULL,
  tipo        text NOT NULL, -- LOGRO | DESBLOQUEO | ENTRENAMIENTO_CUMPLIDO
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ── Ideas (bitácora para no dispersarse) ──────────────────────────────
CREATE TABLE IF NOT EXISTS public.frecuencia_ideas (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  texto       text NOT NULL,
  estado      text NOT NULL DEFAULT 'ESTACIONADA', -- ESTACIONADA | ACTIVADA | DESCARTADA
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ── Compromiso (co-conductor) ─────────────────────────────────────────
-- equipo_id es opcional: permite que la dupla (setter_teams) vea el
-- compromiso además del co-conductor elegido explícitamente.
CREATE TABLE IF NOT EXISTS public.frecuencia_compromisos (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  co_conductor_id   uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  equipo_id         uuid REFERENCES public.setter_teams(id) ON DELETE SET NULL,
  texto_mensual     text NOT NULL,
  avance            int NOT NULL DEFAULT 0,
  mes               date NOT NULL DEFAULT date_trunc('month', CURRENT_DATE),
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- ── Revisión semanal ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.frecuencia_revisiones (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  equipo_id           uuid REFERENCES public.setter_teams(id) ON DELETE SET NULL,
  semana              date NOT NULL, -- lunes de esa semana
  que_funciono        jsonb NOT NULL DEFAULT '[]'::jsonb,
  que_no              jsonb NOT NULL DEFAULT '[]'::jsonb,
  ajustes             jsonb NOT NULL DEFAULT '[]'::jsonb,
  carga_siguiente     jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, semana)
);

-- =====================================================================
-- RLS — "cada usuario ve solo lo suyo"; compromisos/revisiones suman
-- visibilidad de equipo (setter_teams) y admin siempre ve todo.
-- =====================================================================

ALTER TABLE public.frecuencia_identidad     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.frecuencia_mapa_energia  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.frecuencia_areas         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.frecuencia_objetivos     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.frecuencia_tareas        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.frecuencia_bloques       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.frecuencia_dial          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.frecuencia_espejo        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.frecuencia_evidencia     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.frecuencia_ideas         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.frecuencia_compromisos   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.frecuencia_revisiones    ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS frecuencia_identidad_own ON public.frecuencia_identidad;
CREATE POLICY frecuencia_identidad_own ON public.frecuencia_identidad FOR ALL
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()))
  WITH CHECK (user_id = auth.uid() OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS frecuencia_mapa_energia_own ON public.frecuencia_mapa_energia;
CREATE POLICY frecuencia_mapa_energia_own ON public.frecuencia_mapa_energia FOR ALL
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()))
  WITH CHECK (user_id = auth.uid() OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS frecuencia_areas_own ON public.frecuencia_areas;
CREATE POLICY frecuencia_areas_own ON public.frecuencia_areas FOR ALL
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()))
  WITH CHECK (user_id = auth.uid() OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS frecuencia_objetivos_own ON public.frecuencia_objetivos;
CREATE POLICY frecuencia_objetivos_own ON public.frecuencia_objetivos FOR ALL
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()))
  WITH CHECK (user_id = auth.uid() OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS frecuencia_tareas_own ON public.frecuencia_tareas;
CREATE POLICY frecuencia_tareas_own ON public.frecuencia_tareas FOR ALL
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()))
  WITH CHECK (user_id = auth.uid() OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS frecuencia_bloques_own ON public.frecuencia_bloques;
CREATE POLICY frecuencia_bloques_own ON public.frecuencia_bloques FOR ALL
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()))
  WITH CHECK (user_id = auth.uid() OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS frecuencia_dial_own ON public.frecuencia_dial;
CREATE POLICY frecuencia_dial_own ON public.frecuencia_dial FOR ALL
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()))
  WITH CHECK (user_id = auth.uid() OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS frecuencia_espejo_own ON public.frecuencia_espejo;
CREATE POLICY frecuencia_espejo_own ON public.frecuencia_espejo FOR ALL
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()))
  WITH CHECK (user_id = auth.uid() OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS frecuencia_evidencia_own ON public.frecuencia_evidencia;
CREATE POLICY frecuencia_evidencia_own ON public.frecuencia_evidencia FOR ALL
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()))
  WITH CHECK (user_id = auth.uid() OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS frecuencia_ideas_own ON public.frecuencia_ideas;
CREATE POLICY frecuencia_ideas_own ON public.frecuencia_ideas FOR ALL
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()))
  WITH CHECK (user_id = auth.uid() OR public.is_admin(auth.uid()));

-- Compromisos: dueño, co-conductor elegido, cualquiera de la misma
-- dupla (equipo_id) o admin.
DROP POLICY IF EXISTS frecuencia_compromisos_visibilidad ON public.frecuencia_compromisos;
CREATE POLICY frecuencia_compromisos_visibilidad ON public.frecuencia_compromisos FOR SELECT
  USING (
    user_id = auth.uid()
    OR co_conductor_id = auth.uid()
    OR (equipo_id IS NOT NULL AND equipo_id IN (
      SELECT id FROM public.setter_teams WHERE setter1_id = auth.uid() OR setter2_id = auth.uid()
    ))
    OR public.is_admin(auth.uid())
  );
DROP POLICY IF EXISTS frecuencia_compromisos_escritura ON public.frecuencia_compromisos;
CREATE POLICY frecuencia_compromisos_escritura ON public.frecuencia_compromisos FOR INSERT
  WITH CHECK (user_id = auth.uid() OR public.is_admin(auth.uid()));
DROP POLICY IF EXISTS frecuencia_compromisos_update ON public.frecuencia_compromisos;
CREATE POLICY frecuencia_compromisos_update ON public.frecuencia_compromisos FOR UPDATE
  USING (user_id = auth.uid() OR co_conductor_id = auth.uid() OR public.is_admin(auth.uid()))
  WITH CHECK (user_id = auth.uid() OR co_conductor_id = auth.uid() OR public.is_admin(auth.uid()));
DROP POLICY IF EXISTS frecuencia_compromisos_delete ON public.frecuencia_compromisos;
CREATE POLICY frecuencia_compromisos_delete ON public.frecuencia_compromisos FOR DELETE
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

-- Revisiones: dueño, misma dupla (equipo_id) o admin.
DROP POLICY IF EXISTS frecuencia_revisiones_visibilidad ON public.frecuencia_revisiones;
CREATE POLICY frecuencia_revisiones_visibilidad ON public.frecuencia_revisiones FOR SELECT
  USING (
    user_id = auth.uid()
    OR (equipo_id IS NOT NULL AND equipo_id IN (
      SELECT id FROM public.setter_teams WHERE setter1_id = auth.uid() OR setter2_id = auth.uid()
    ))
    OR public.is_admin(auth.uid())
  );
DROP POLICY IF EXISTS frecuencia_revisiones_escritura ON public.frecuencia_revisiones;
CREATE POLICY frecuencia_revisiones_escritura ON public.frecuencia_revisiones FOR INSERT
  WITH CHECK (user_id = auth.uid() OR public.is_admin(auth.uid()));
DROP POLICY IF EXISTS frecuencia_revisiones_update ON public.frecuencia_revisiones;
CREATE POLICY frecuencia_revisiones_update ON public.frecuencia_revisiones FOR UPDATE
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()))
  WITH CHECK (user_id = auth.uid() OR public.is_admin(auth.uid()));
DROP POLICY IF EXISTS frecuencia_revisiones_delete ON public.frecuencia_revisiones;
CREATE POLICY frecuencia_revisiones_delete ON public.frecuencia_revisiones FOR DELETE
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

-- Índices para los filtros más comunes
CREATE INDEX IF NOT EXISTS idx_frecuencia_objetivos_user   ON public.frecuencia_objetivos(user_id);
CREATE INDEX IF NOT EXISTS idx_frecuencia_tareas_user      ON public.frecuencia_tareas(user_id);
CREATE INDEX IF NOT EXISTS idx_frecuencia_tareas_objetivo  ON public.frecuencia_tareas(objetivo_id);
CREATE INDEX IF NOT EXISTS idx_frecuencia_bloques_user     ON public.frecuencia_bloques(user_id, inicio);
CREATE INDEX IF NOT EXISTS idx_frecuencia_dial_user        ON public.frecuencia_dial(user_id, fecha DESC);
CREATE INDEX IF NOT EXISTS idx_frecuencia_espejo_user      ON public.frecuencia_espejo(user_id, fecha DESC);
CREATE INDEX IF NOT EXISTS idx_frecuencia_evidencia_user   ON public.frecuencia_evidencia(user_id, fecha DESC);
CREATE INDEX IF NOT EXISTS idx_frecuencia_ideas_user       ON public.frecuencia_ideas(user_id);

-- =====================================================================
-- Contenido del método en knowledge_blocks — cero strings hardcodeados
-- en componentes. ON CONFLICT DO NOTHING: no pisa valores si ya se
-- ajustaron a mano desde el admin.
-- =====================================================================

INSERT INTO public.knowledge_blocks (clave, valor) VALUES
  ('frecuencia_roles_habilitados', '["admin", "setter", "closer"]'::jsonb),

  ('areas_vida', '[
    {"key": "salud",          "nombre": "Salud"},
    {"key": "dinero",         "nombre": "Dinero"},
    {"key": "pareja",         "nombre": "Pareja"},
    {"key": "familia",        "nombre": "Familia"},
    {"key": "amistades",      "nombre": "Amistades"},
    {"key": "carrera",        "nombre": "Carrera / Negocio"},
    {"key": "espiritualidad", "nombre": "Espiritualidad"},
    {"key": "diversion",      "nombre": "Diversión / Ocio"},
    {"key": "entorno",        "nombre": "Entorno físico"},
    {"key": "crecimiento",    "nombre": "Crecimiento personal"}
  ]'::jsonb),

  ('energias_escasez', '[
    {"key": "envidia",       "nombre": "Envidia"},
    {"key": "resentimiento", "nombre": "Resentimiento"},
    {"key": "critica",       "nombre": "Crítica"},
    {"key": "queja",         "nombre": "Queja"}
  ]'::jsonb),

  ('acciones_subida', '[
    "Silencio",
    "Dormir / descansar",
    "Movimiento físico",
    "Leer",
    "Hablar con una persona que suma"
  ]'::jsonb),

  ('pasos_ante_falla', '[
    {"paso": 1, "nombre": "Conciencia",    "descripcion": "Notar que pasó, sin taparlo."},
    {"paso": 2, "nombre": "Comprensión",   "descripcion": "Entender qué lo generó."},
    {"paso": 3, "nombre": "Disociación",   "descripcion": "\"Hoy actué X\", no \"soy X\"."},
    {"paso": 4, "nombre": "Declaración",   "descripcion": "Decir en voz alta cómo sigo."}
  ]'::jsonb),

  ('reglas_plan', '{
    "noNegociablesPrimero": true,
    "areaDebilNuncaEnCero": true,
    "decisionesSoloEnFranjaDecisionManana": true,
    "noMezclarEjecutarYOrquestar": true,
    "reservarHuecosImprevistos": true
  }'::jsonb),

  ('mapa_energia_default', '{
    "franjas": [
      {"desde": "06:00", "hasta": "10:00", "tipo": "PROFUNDO"},
      {"desde": "10:00", "hasta": "12:00", "tipo": "DECISION"},
      {"desde": "12:00", "hasta": "14:00", "tipo": "BAJO"},
      {"desde": "14:00", "hasta": "17:00", "tipo": "REUNIONES"},
      {"desde": "17:00", "hasta": "19:00", "tipo": "CREATIVO"}
    ],
    "reglaSinDiagnostico": "primeras_3_a_4h_tarea_mas_dificil_sin_mail_ni_celular"
  }'::jsonb)

ON CONFLICT (clave) DO NOTHING;
