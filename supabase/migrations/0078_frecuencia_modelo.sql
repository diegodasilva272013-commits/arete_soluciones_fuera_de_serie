-- =====================================================================
-- 0078 · Frecuencia — modelo de datos completo (v2, reemplaza la v1
-- que nunca se corrió).
--
-- Todo prefijado frecuencia_. Cero referencias a objetos existentes de
-- la plataforma salvo: FK de lectura hacia profiles(id)/auth.users(id),
-- y una lectura de profiles.role desde el middleware (no se modifica
-- profiles). setter_teams NO se usa — Frecuencia tiene su propio
-- concepto de equipo (frecuencia_equipos / frecuencia_equipo_miembros).
--
-- Sin CREATE TABLE IF NOT EXISTS a propósito: si algo con este nombre
-- ya existe, esta migración tiene que fallar, no seguir en silencio.
-- Todo envuelto en una sola transacción: si algo falla, no queda nada
-- a medias.
-- =====================================================================

BEGIN;

-- =====================================================================
-- 1. CONFIG / CONTENIDO DEL MÉTODO
-- =====================================================================

CREATE TABLE frecuencia_knowledge_blocks (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  clave       text        NOT NULL UNIQUE,
  valor       jsonb       NOT NULL,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE frecuencia_knowledge_blocks ENABLE ROW LEVEL SECURITY;

-- Lectura: cualquier autenticado (la UI la necesita para labels, reglas,
-- etc.). Escritura: solo admin.
CREATE POLICY frecuencia_knowledge_blocks_select ON frecuencia_knowledge_blocks
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY frecuencia_knowledge_blocks_admin_write ON frecuencia_knowledge_blocks
  FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- =====================================================================
-- 2. PREFERENCIAS (zona horaria y hora de despertar — se preguntan en
--    el onboarding; ninguna tabla usa CURRENT_DATE del servidor para
--    "fecha", la calcula la app con esto)
-- =====================================================================

CREATE TABLE frecuencia_preferencias (
  user_id       uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  timezone      text NOT NULL DEFAULT 'America/Argentina/Buenos_Aires',
  hora_despertar time, -- null hasta que el onboarding la pida
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE frecuencia_preferencias ENABLE ROW LEVEL SECURITY;

CREATE POLICY frecuencia_preferencias_own ON frecuencia_preferencias
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY frecuencia_preferencias_admin_select ON frecuencia_preferencias
  FOR SELECT USING (public.is_admin(auth.uid()));

-- =====================================================================
-- 3. EQUIPOS PROPIOS DE FRECUENCIA (no setter_teams)
-- =====================================================================

CREATE TABLE frecuencia_equipos (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      text NOT NULL,
  lider_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE frecuencia_equipo_miembros (
  equipo_id       uuid NOT NULL REFERENCES frecuencia_equipos(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rol_en_equipo   text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (equipo_id, user_id)
);

ALTER TABLE frecuencia_equipos         ENABLE ROW LEVEL SECURITY;
ALTER TABLE frecuencia_equipo_miembros ENABLE ROW LEVEL SECURITY;

-- Equipos: el líder ve y administra el suyo; un miembro ve el equipo
-- del que es parte (solo lectura); admin ve y administra todos.
CREATE POLICY frecuencia_equipos_select ON frecuencia_equipos
  FOR SELECT USING (
    lider_id = auth.uid()
    OR EXISTS (SELECT 1 FROM frecuencia_equipo_miembros m WHERE m.equipo_id = id AND m.user_id = auth.uid())
    OR public.is_admin(auth.uid())
  );
CREATE POLICY frecuencia_equipos_write ON frecuencia_equipos
  FOR INSERT WITH CHECK (lider_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY frecuencia_equipos_update ON frecuencia_equipos
  FOR UPDATE USING (lider_id = auth.uid() OR public.is_admin(auth.uid()))
  WITH CHECK (lider_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY frecuencia_equipos_delete ON frecuencia_equipos
  FOR DELETE USING (lider_id = auth.uid() OR public.is_admin(auth.uid()));

-- Miembros: el propio miembro se ve a sí mismo; el líder del equipo ve
-- y administra la lista; admin ve y administra todo.
CREATE POLICY frecuencia_equipo_miembros_select ON frecuencia_equipo_miembros
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM frecuencia_equipos e WHERE e.id = equipo_id AND e.lider_id = auth.uid())
    OR public.is_admin(auth.uid())
  );
CREATE POLICY frecuencia_equipo_miembros_write ON frecuencia_equipo_miembros
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM frecuencia_equipos e WHERE e.id = equipo_id AND e.lider_id = auth.uid())
    OR public.is_admin(auth.uid())
  );
CREATE POLICY frecuencia_equipo_miembros_delete ON frecuencia_equipo_miembros
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM frecuencia_equipos e WHERE e.id = equipo_id AND e.lider_id = auth.uid())
    OR public.is_admin(auth.uid())
  );

-- =====================================================================
-- 4. ÍNTIMO — SOLO EL DUEÑO, SIN EXCEPCIÓN DE ADMIN NI DE LÍDER
-- =====================================================================

CREATE TABLE frecuencia_identidad (
  user_id             uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  quien_creia_ser     text,
  quien_soy           text,
  como_me_ven         text,
  quien_quiero_ser    text,
  no_negociables      jsonb NOT NULL DEFAULT '[]'::jsonb,
  estandar_minimo     jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE frecuencia_mapa_energia (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  franjas                 jsonb NOT NULL DEFAULT '[]'::jsonb, -- [{offset_desde_horas, offset_hasta_horas, tipo}] relativas a hora_despertar
  fecha_diagnostico       timestamptz NOT NULL,
  proximo_rediagnostico   timestamptz,
  created_at              timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE frecuencia_dial (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  fecha               date NOT NULL, -- la calcula la app en la timezone del usuario, nunca CURRENT_DATE
  momento             text NOT NULL CHECK (momento IN ('manana', 'noche')),
  frecuencia          int NOT NULL CHECK (frecuencia BETWEEN -100 AND 100),
  energias_escasez    jsonb NOT NULL DEFAULT '{}'::jsonb,
  acciones_subida     jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, fecha, momento)
);

CREATE TABLE frecuencia_espejo (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  fecha               date NOT NULL, -- idem: calculada por la app, no CURRENT_DATE
  momento             text NOT NULL CHECK (momento IN ('manana', 'noche')),
  como_me_veo         text,
  como_me_percibo     text,
  como_me_siento      text,
  foto_storage_path   text, -- ruta dentro del bucket privado frecuencia-imagenes, no una URL pública
  vestimenta_manana   text,
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE frecuencia_conversaciones (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  canal       text NOT NULL CHECK (canal IN ('texto', 'voz')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id, user_id)
);

CREATE TABLE frecuencia_mensajes (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversacion_id   uuid NOT NULL,
  user_id           uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rol               text NOT NULL CHECK (rol IN ('user', 'assistant', 'system', 'tool')),
  contenido         text NOT NULL,
  modelo            text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (conversacion_id, user_id) REFERENCES frecuencia_conversaciones (id, user_id) ON DELETE CASCADE
);

ALTER TABLE frecuencia_identidad      ENABLE ROW LEVEL SECURITY;
ALTER TABLE frecuencia_mapa_energia   ENABLE ROW LEVEL SECURITY;
ALTER TABLE frecuencia_dial           ENABLE ROW LEVEL SECURITY;
ALTER TABLE frecuencia_espejo         ENABLE ROW LEVEL SECURITY;
ALTER TABLE frecuencia_conversaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE frecuencia_mensajes       ENABLE ROW LEVEL SECURITY;

-- Sin OR public.is_admin(...) en ninguna de estas seis. A propósito.
CREATE POLICY frecuencia_identidad_own ON frecuencia_identidad
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY frecuencia_mapa_energia_own ON frecuencia_mapa_energia
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY frecuencia_dial_own ON frecuencia_dial
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY frecuencia_espejo_own ON frecuencia_espejo
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY frecuencia_conversaciones_own ON frecuencia_conversaciones
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY frecuencia_mensajes_own ON frecuencia_mensajes
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- =====================================================================
-- 5. ÁREAS, OBJETIVOS, TAREAS, BLOQUES, EVIDENCIA, IDEAS
--    (dueño siempre; admin SOLO lectura, nunca escribe filas ajenas;
--    bloques/evidencia suman lectura del líder de equipo)
-- =====================================================================

CREATE TABLE frecuencia_areas (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  area_key            text NOT NULL, -- matchea una key de frecuencia_knowledge_blocks['areas_vida']
  nivel_actual        int  NOT NULL DEFAULT 0 CHECK (nivel_actual BETWEEN 0 AND 10),
  es_palanca          boolean NOT NULL DEFAULT false,
  es_manzana_podrida  boolean NOT NULL DEFAULT false,
  updated_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, area_key)
);

CREATE TABLE frecuencia_objetivos (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  titulo                   text NOT NULL,
  imagen_mental            text,
  area_key                 text,
  fecha_limite             date,
  identidad_que_expresa    text,
  metas_por_periodo        jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id, user_id)
);

CREATE TABLE frecuencia_tareas (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  objetivo_id       uuid,
  titulo            text NOT NULL,
  protocolo         jsonb NOT NULL DEFAULT '[]'::jsonb,
  depende_de        uuid[] NOT NULL DEFAULT '{}',
  desbloquea        uuid[] NOT NULL DEFAULT '{}',
  tipo_energia      text,
  duracion_min      int,
  dosis_actual      int NOT NULL DEFAULT 1,
  dosis_objetivo    int,
  veces_postergada  int NOT NULL DEFAULT 0,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id, user_id),
  FOREIGN KEY (objetivo_id, user_id) REFERENCES frecuencia_objetivos (id, user_id) ON DELETE CASCADE
);

CREATE TABLE frecuencia_bloques (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tarea_id              uuid,
  tipo                  text NOT NULL,
  inicio                timestamptz NOT NULL,
  fin                   timestamptz NOT NULL,
  estado                text NOT NULL DEFAULT 'PROGRAMADO',
  interrupciones        int NOT NULL DEFAULT 0,
  minutos_reales_foco   int NOT NULL DEFAULT 0,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id, user_id),
  FOREIGN KEY (tarea_id, user_id) REFERENCES frecuencia_tareas (id, user_id) ON DELETE SET NULL (tarea_id)
);

CREATE TABLE frecuencia_evidencia (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  bloque_id   uuid,
  fecha       date NOT NULL,
  texto       text NOT NULL,
  tipo        text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (bloque_id, user_id) REFERENCES frecuencia_bloques (id, user_id) ON DELETE SET NULL (bloque_id)
);

CREATE TABLE frecuencia_ideas (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  texto       text NOT NULL,
  estado      text NOT NULL DEFAULT 'ESTACIONADA',
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE frecuencia_areas      ENABLE ROW LEVEL SECURITY;
ALTER TABLE frecuencia_objetivos  ENABLE ROW LEVEL SECURITY;
ALTER TABLE frecuencia_tareas     ENABLE ROW LEVEL SECURITY;
ALTER TABLE frecuencia_bloques    ENABLE ROW LEVEL SECURITY;
ALTER TABLE frecuencia_evidencia  ENABLE ROW LEVEL SECURITY;
ALTER TABLE frecuencia_ideas      ENABLE ROW LEVEL SECURITY;

-- Áreas, objetivos, tareas, ideas: dueño CRUD; admin SOLO select.
CREATE POLICY frecuencia_areas_own ON frecuencia_areas
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY frecuencia_areas_admin_select ON frecuencia_areas
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY frecuencia_objetivos_own ON frecuencia_objetivos
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY frecuencia_objetivos_admin_select ON frecuencia_objetivos
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY frecuencia_tareas_own ON frecuencia_tareas
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY frecuencia_tareas_admin_select ON frecuencia_tareas
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY frecuencia_ideas_own ON frecuencia_ideas
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY frecuencia_ideas_admin_select ON frecuencia_ideas
  FOR SELECT USING (public.is_admin(auth.uid()));

-- Bloques y evidencia: dueño CRUD; admin select; líder del equipo del
-- dueño, select.
CREATE POLICY frecuencia_bloques_own ON frecuencia_bloques
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY frecuencia_bloques_admin_select ON frecuencia_bloques
  FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY frecuencia_bloques_lider_select ON frecuencia_bloques
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM frecuencia_equipos eq
      JOIN frecuencia_equipo_miembros em ON em.equipo_id = eq.id
      WHERE eq.lider_id = auth.uid() AND em.user_id = frecuencia_bloques.user_id
    )
  );

CREATE POLICY frecuencia_evidencia_own ON frecuencia_evidencia
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY frecuencia_evidencia_admin_select ON frecuencia_evidencia
  FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY frecuencia_evidencia_lider_select ON frecuencia_evidencia
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM frecuencia_equipos eq
      JOIN frecuencia_equipo_miembros em ON em.equipo_id = eq.id
      WHERE eq.lider_id = auth.uid() AND em.user_id = frecuencia_evidencia.user_id
    )
  );

-- =====================================================================
-- 6. COMPROMISOS (co-conductor) Y REVISIONES
-- =====================================================================

CREATE TABLE frecuencia_compromisos (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  co_conductor_id   uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  texto_mensual     text NOT NULL,
  avance            int NOT NULL DEFAULT 0,
  mes               date NOT NULL,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE frecuencia_revisiones (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  semana              date NOT NULL,
  que_funciono        jsonb NOT NULL DEFAULT '[]'::jsonb,
  que_no              jsonb NOT NULL DEFAULT '[]'::jsonb,
  ajustes             jsonb NOT NULL DEFAULT '[]'::jsonb,
  carga_siguiente     jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, semana)
);

ALTER TABLE frecuencia_compromisos ENABLE ROW LEVEL SECURITY;
ALTER TABLE frecuencia_revisiones  ENABLE ROW LEVEL SECURITY;

-- Compromisos: el dueño hace todo; el co-conductor solo LEE (el update
-- de "avance" es exclusivo de la función de abajo, no de esta policy);
-- admin y líder del equipo del dueño, solo lectura.
CREATE POLICY frecuencia_compromisos_select ON frecuencia_compromisos
  FOR SELECT USING (
    user_id = auth.uid()
    OR co_conductor_id = auth.uid()
    OR public.is_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM frecuencia_equipos eq
      JOIN frecuencia_equipo_miembros em ON em.equipo_id = eq.id
      WHERE eq.lider_id = auth.uid() AND em.user_id = frecuencia_compromisos.user_id
    )
  );
CREATE POLICY frecuencia_compromisos_insert ON frecuencia_compromisos
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY frecuencia_compromisos_update ON frecuencia_compromisos
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY frecuencia_compromisos_delete ON frecuencia_compromisos
  FOR DELETE USING (user_id = auth.uid());

-- Revisiones: dueño CRUD; admin solo lectura. (No está en la lista de
-- visibilidad del líder — C2 solo nombra bloques/evidencia/compromisos/
-- delegaciones.)
CREATE POLICY frecuencia_revisiones_own ON frecuencia_revisiones
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY frecuencia_revisiones_admin_select ON frecuencia_revisiones
  FOR SELECT USING (public.is_admin(auth.uid()));

-- Función SECURITY DEFINER: es la ÚNICA vía por la que el co-conductor
-- puede tocar un compromiso ajeno, y solo puede tocar "avance" — nunca
-- el resto de la fila. Sin policy de UPDATE para co_conductor_id en la
-- tabla: si no pasa por acá, no puede escribir nada.
CREATE FUNCTION frecuencia_actualizar_avance_compromiso(p_compromiso_id uuid, p_avance int)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE frecuencia_compromisos
  SET avance = p_avance, updated_at = now()
  WHERE id = p_compromiso_id
    AND (user_id = auth.uid() OR co_conductor_id = auth.uid());

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No autorizado o compromiso inexistente';
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION frecuencia_actualizar_avance_compromiso(uuid, int) TO authenticated;

-- =====================================================================
-- 7. CRITERIOS Y DELEGACIONES
-- =====================================================================

CREATE TABLE frecuencia_criterios (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  equipo_id                   uuid REFERENCES frecuencia_equipos(id) ON DELETE SET NULL,
  ambito                      text NOT NULL CHECK (ambito IN ('personal', 'equipo')),
  titulo                      text NOT NULL,
  que_se_decide               text NOT NULL,
  que_entra                   text,
  que_no_entra                text,
  costo_si_sale_mal           text,
  reversible                  boolean NOT NULL DEFAULT false,
  tiempo_reversibilidad       text,
  quien_asume_responsabilidad text,
  activo                      boolean NOT NULL DEFAULT true,
  created_at                  timestamptz NOT NULL DEFAULT now(),
  updated_at                  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id, user_id)
);

CREATE TABLE frecuencia_delegaciones (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tarea_id        uuid NOT NULL,
  de_user_id      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  a_user_id       uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  criterio_id     uuid NOT NULL, -- obligatorio: no se delega sin criterio escrito
  volvio          boolean NOT NULL DEFAULT false,
  fecha           date NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (tarea_id, de_user_id) REFERENCES frecuencia_tareas (id, user_id) ON DELETE CASCADE,
  FOREIGN KEY (criterio_id, de_user_id) REFERENCES frecuencia_criterios (id, user_id) ON DELETE RESTRICT
);

ALTER TABLE frecuencia_criterios    ENABLE ROW LEVEL SECURITY;
ALTER TABLE frecuencia_delegaciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY frecuencia_criterios_own ON frecuencia_criterios
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY frecuencia_criterios_admin_select ON frecuencia_criterios
  FOR SELECT USING (public.is_admin(auth.uid()));

-- Delegaciones: las dos partes (quien delega y quien recibe) leen y
-- participan; admin y líder del equipo de cualquiera de las dos
-- partes, solo lectura. Solo quien delega inserta/edita/borra.
CREATE POLICY frecuencia_delegaciones_select ON frecuencia_delegaciones
  FOR SELECT USING (
    de_user_id = auth.uid()
    OR a_user_id = auth.uid()
    OR public.is_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM frecuencia_equipos eq
      JOIN frecuencia_equipo_miembros em ON em.equipo_id = eq.id
      WHERE eq.lider_id = auth.uid()
        AND (em.user_id = frecuencia_delegaciones.de_user_id OR em.user_id = frecuencia_delegaciones.a_user_id)
    )
  );
CREATE POLICY frecuencia_delegaciones_insert ON frecuencia_delegaciones
  FOR INSERT WITH CHECK (de_user_id = auth.uid());
CREATE POLICY frecuencia_delegaciones_update ON frecuencia_delegaciones
  FOR UPDATE USING (de_user_id = auth.uid() OR a_user_id = auth.uid())
  WITH CHECK (de_user_id = auth.uid() OR a_user_id = auth.uid());
CREATE POLICY frecuencia_delegaciones_delete ON frecuencia_delegaciones
  FOR DELETE USING (de_user_id = auth.uid());

-- =====================================================================
-- 8. IMÁGENES
-- =====================================================================

CREATE TABLE frecuencia_imagenes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  objetivo_id     uuid,
  tarea_id        uuid,
  criterio_id     uuid,
  prompt          text NOT NULL,
  modelo          text,
  storage_path    text,
  estado          text NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'generando', 'lista', 'error')),
  created_at      timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (objetivo_id, user_id) REFERENCES frecuencia_objetivos (id, user_id) ON DELETE SET NULL (objetivo_id),
  FOREIGN KEY (tarea_id, user_id)    REFERENCES frecuencia_tareas    (id, user_id) ON DELETE SET NULL (tarea_id),
  FOREIGN KEY (criterio_id, user_id) REFERENCES frecuencia_criterios (id, user_id) ON DELETE SET NULL (criterio_id)
);

ALTER TABLE frecuencia_imagenes ENABLE ROW LEVEL SECURITY;

CREATE POLICY frecuencia_imagenes_own ON frecuencia_imagenes
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY frecuencia_imagenes_admin_select ON frecuencia_imagenes
  FOR SELECT USING (public.is_admin(auth.uid()));

-- =====================================================================
-- 9. ÍNDICES
-- =====================================================================

CREATE INDEX idx_frecuencia_objetivos_user      ON frecuencia_objetivos(user_id);
CREATE INDEX idx_frecuencia_tareas_user         ON frecuencia_tareas(user_id);
CREATE INDEX idx_frecuencia_tareas_objetivo     ON frecuencia_tareas(objetivo_id);
CREATE INDEX idx_frecuencia_bloques_user        ON frecuencia_bloques(user_id, inicio);
CREATE INDEX idx_frecuencia_bloques_tarea       ON frecuencia_bloques(tarea_id);
CREATE INDEX idx_frecuencia_dial_user           ON frecuencia_dial(user_id, fecha DESC);
CREATE INDEX idx_frecuencia_espejo_user         ON frecuencia_espejo(user_id, fecha DESC);
CREATE INDEX idx_frecuencia_evidencia_user      ON frecuencia_evidencia(user_id, fecha DESC);
CREATE INDEX idx_frecuencia_evidencia_bloque    ON frecuencia_evidencia(bloque_id);
CREATE INDEX idx_frecuencia_ideas_user          ON frecuencia_ideas(user_id);
CREATE INDEX idx_frecuencia_criterios_user      ON frecuencia_criterios(user_id);
CREATE INDEX idx_frecuencia_delegaciones_de     ON frecuencia_delegaciones(de_user_id);
CREATE INDEX idx_frecuencia_delegaciones_a      ON frecuencia_delegaciones(a_user_id);
CREATE INDEX idx_frecuencia_delegaciones_tarea  ON frecuencia_delegaciones(tarea_id);
CREATE INDEX idx_frecuencia_imagenes_user       ON frecuencia_imagenes(user_id);
CREATE INDEX idx_frecuencia_equipo_miembros_user ON frecuencia_equipo_miembros(user_id);
CREATE INDEX idx_frecuencia_compromisos_user    ON frecuencia_compromisos(user_id);
CREATE INDEX idx_frecuencia_compromisos_co      ON frecuencia_compromisos(co_conductor_id);

-- =====================================================================
-- 10. TRIGGER updated_at (función propia, solo sobre tablas frecuencia_)
-- =====================================================================

CREATE FUNCTION frecuencia_set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_frecuencia_identidad_updated     BEFORE UPDATE ON frecuencia_identidad     FOR EACH ROW EXECUTE FUNCTION frecuencia_set_updated_at();
CREATE TRIGGER trg_frecuencia_preferencias_updated   BEFORE UPDATE ON frecuencia_preferencias   FOR EACH ROW EXECUTE FUNCTION frecuencia_set_updated_at();
CREATE TRIGGER trg_frecuencia_objetivos_updated      BEFORE UPDATE ON frecuencia_objetivos      FOR EACH ROW EXECUTE FUNCTION frecuencia_set_updated_at();
CREATE TRIGGER trg_frecuencia_tareas_updated         BEFORE UPDATE ON frecuencia_tareas         FOR EACH ROW EXECUTE FUNCTION frecuencia_set_updated_at();
CREATE TRIGGER trg_frecuencia_bloques_updated        BEFORE UPDATE ON frecuencia_bloques        FOR EACH ROW EXECUTE FUNCTION frecuencia_set_updated_at();
CREATE TRIGGER trg_frecuencia_compromisos_updated    BEFORE UPDATE ON frecuencia_compromisos    FOR EACH ROW EXECUTE FUNCTION frecuencia_set_updated_at();
CREATE TRIGGER trg_frecuencia_criterios_updated      BEFORE UPDATE ON frecuencia_criterios      FOR EACH ROW EXECUTE FUNCTION frecuencia_set_updated_at();
CREATE TRIGGER trg_frecuencia_knowledge_blocks_updated BEFORE UPDATE ON frecuencia_knowledge_blocks FOR EACH ROW EXECUTE FUNCTION frecuencia_set_updated_at();

-- =====================================================================
-- 11. STORAGE — bucket privado nuevo + políticas nuevas, prefijadas,
--     limitadas a bucket_id = 'frecuencia-imagenes'. No se toca ninguna
--     policy existente de storage.objects. Carpeta por usuario:
--     la ruta tiene que empezar con "<user_id>/".
-- =====================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('frecuencia-imagenes', 'frecuencia-imagenes', false);

CREATE POLICY frecuencia_imagenes_storage_select ON storage.objects
  FOR SELECT USING (
    bucket_id = 'frecuencia-imagenes'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY frecuencia_imagenes_storage_insert ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'frecuencia-imagenes'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY frecuencia_imagenes_storage_delete ON storage.objects
  FOR DELETE USING (
    bucket_id = 'frecuencia-imagenes'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- =====================================================================
-- 12. SEED — solo lo que Diego dio textual en esta conversación. Todo
--     lo demás queda marcado TODO_DIEGO en vez de inventado (regla 14).
-- =====================================================================

INSERT INTO frecuencia_knowledge_blocks (clave, valor) VALUES

  ('frecuencia_roles_habilitados', '["admin", "setter", "closer"]'::jsonb),

  -- Las 10 áreas de Sergio Fernández, tal cual las escribió Diego.
  ('areas_vida', '[
    {"key": "conocer_quien_sos",     "nombre": "Conocer quién sos"},
    {"key": "creer_en_vos",          "nombre": "Creer en vos"},
    {"key": "salud",                 "nombre": "Salud"},
    {"key": "relaciones",            "nombre": "Relaciones"},
    {"key": "familia",               "nombre": "Familia"},
    {"key": "pareja",                "nombre": "Pareja"},
    {"key": "trascendencia",         "nombre": "Trascendencia"},
    {"key": "proposito",             "nombre": "Propósito"},
    {"key": "carrera_profesional",   "nombre": "Carrera profesional"},
    {"key": "libertad_financiera",   "nombre": "Libertad financiera"}
  ]'::jsonb),

  ('TODO_DIEGO_energias_escasez', '{"todo": true, "nota": "Las 4 energías de escasez según los podcasts — no las tengo confirmadas textualmente, no las invento."}'::jsonb),

  -- Acciones de subida, tal cual las escribió Diego en esta conversación.
  ('acciones_subida', '[
    "Silencio",
    "Dormir bien",
    "Libros que elevan",
    "Películas que elevan",
    "Personas que elevan",
    "Movimiento"
  ]'::jsonb),

  ('TODO_DIEGO_pasos_ante_falla', '{"todo": true, "nota": "4 pasos ante una falla, según los podcasts. En el pseudocódigo original figuraban como conciencia/comprensión/disociación/declaración, pero eso lo escribiste vos en el diseño, no está confirmado como cita textual del material — lo dejo en TODO para que lo confirmes o corrijas."}'::jsonb),

  ('TODO_DIEGO_reglas_plan', '{"todo": true, "nota": "Reglas del armado de semana (no negociables primero, área débil nunca en cero, decisiones solo temprano, no mezclar ejecutar/orquestar, huecos para imprevistos) — mismo caso: estaban en tu pseudocódigo de diseño, no confirmadas contra los podcasts."}'::jsonb),

  ('TODO_DIEGO_mapa_energia_default', '{"todo": true, "nota": "Regla Papayani confirmada por vos: primeras 3-4h desde que te despertás = tarea más difícil, sin mail ni celular; decisiones importantes temprano, nunca en horas de fatiga. Falta: el umbral exacto de \"horas de fatiga\" y si son siempre 3 o siempre 4 horas."}'::jsonb),

  ('TODO_DIEGO_reglas_foco', '{"todo": true, "nota": "Reglas visibles durante el bloque EN EL AIRE (celular afuera, una sola tarea) — confirmar texto exacto."}'::jsonb),

  ('TODO_DIEGO_dosis_y_escalado', '{"todo": true, "nota": "Dosis mínima por área, reglas de cuándo escalar o bajar la dosis, tope de \"no necesito ser primero\", regla de los 2 minutos de dolor — confirmar valores/umbrales."}'::jsonb),

  ('TODO_DIEGO_preguntas_onboarding', '{"todo": true, "nota": "Preguntas exactas de cada paso del onboarding (identidad, no negociables, estándar mínimo, etc.)."}'::jsonb),

  ('TODO_DIEGO_preguntas_criterio', '{"todo": true, "nota": "Las preguntas de los 4 puntos del criterio (qué se decide, qué entra, qué no entra, costo si sale mal) y qué es \"lo no delegable\" (personas, reputación, dirección) — confirmar redacción exacta para mostrar en la UI."}'::jsonb),

  ('TODO_DIEGO_limite_imagenes', '{"todo": true, "nota": "Límite diario de generación de imágenes por usuario — confirmar número."}'::jsonb),

  ('TODO_DIEGO_tono_agente', '{"todo": true, "nota": "Tono del agente (\"el amigo que te agarra de las solapas\") — confirmar si se usa tal cual o se ajusta."}'::jsonb),

  ('modelos_ia', '{"chat": [], "imagenes": []}'::jsonb) -- se completa en la Parte D, con los links de build.nvidia.com

ON CONFLICT (clave) DO NOTHING;

COMMIT;
