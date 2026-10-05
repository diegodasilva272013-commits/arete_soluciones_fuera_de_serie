-- =====================================================================
-- 0078 · Frecuencia — modelo de datos completo (v6, reemplaza v1-v5,
-- ninguna de las cinco se corrió).
--
-- NOTA (bucket): storage.buckets está protegido en producción contra
-- INSERT/DELETE directo por SQL (triggers protect_bucket_control_insert
-- / protect_buckets_delete, confirmado por consulta de Diego). El
-- bucket 'frecuencia-imagenes' se crea con la Storage API, en
-- scripts/frecuencia-bucket.mjs, DESPUÉS de correr esta migración —
-- nunca con INSERT. Las 3 CREATE POLICY de storage.objects que siguen
-- no necesitan que el bucket ya exista (solo comparan bucket_id como
-- texto), así que se quedan acá sin problema.
--
-- NOTA (compañeros de equipo): no se creó frecuencia_companeros() —
-- public.profiles ya tiene la policy "profiles_select_all_authenticated"
-- (0001_init.sql), que deja leer nombre/rol de cualquier perfil a todo
-- autenticado. No hacía falta una función nueva ni tocar profiles.
--
-- Orden del archivo (fuerza de Postgres: CREATE FUNCTION LANGUAGE sql y
-- CREATE POLICY se analizan al crearse, no al ejecutarse — toda tabla o
-- función referenciada tiene que existir ANTES):
--   a) CREATE TABLE (todas, sin RLS ni políticas).
--   b) CREATE FUNCTION (todas: RLS, avance de compromiso, triggers,
--      updated_at), con sus REVOKE/GRANT.
--   c) ENABLE ROW LEVEL SECURITY + REVOKE ALL ... FROM anon + CREATE
--      POLICY, tabla por tabla.
--   d) CREATE TRIGGER, índices, storage, seed.
--
-- Todo calificado con public. explícito. Todo prefijado frecuencia_.
-- Cero referencias a objetos existentes salvo FK de lectura hacia
-- public.profiles(id) y lectura de profiles.role. setter_teams NO se
-- usa. Sin CREATE TABLE IF NOT EXISTS: si algo ya existe, esto falla.
-- Todo en una transacción.
--
-- NOTA TÉCNICA (SELECT version();): no tengo forma de ejecutarlo yo
-- mismo — no hay conexión directa a Postgres, solo la API de
-- PostgREST, que no expone version() como RPC. Por eso ningún "borrar
-- padre desvincula hijo" usa ON DELETE SET NULL (columna) (eso pide
-- Postgres 15+): todos son triggers propios, que funcionan en
-- cualquier versión.
-- =====================================================================

BEGIN;

-- =====================================================================
-- a) TABLAS
-- =====================================================================

CREATE TABLE public.frecuencia_knowledge_blocks (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  clave       text        NOT NULL UNIQUE,
  valor       jsonb       NOT NULL,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.frecuencia_preferencias (
  user_id        uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  timezone       text NOT NULL DEFAULT 'America/Argentina/Buenos_Aires',
  hora_despertar time,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.frecuencia_equipos (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      text NOT NULL,
  lider_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.frecuencia_equipo_miembros (
  equipo_id      uuid NOT NULL REFERENCES public.frecuencia_equipos(id) ON DELETE CASCADE,
  user_id        uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rol_en_equipo  text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (equipo_id, user_id)
);

CREATE TABLE public.frecuencia_identidad (
  user_id           uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  quien_creia_ser   text,
  quien_soy         text,
  como_me_ven       text,
  quien_quiero_ser  text,
  no_negociables    jsonb NOT NULL DEFAULT '[]'::jsonb,
  estandar_minimo   jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.frecuencia_mapa_energia (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  franjas                jsonb NOT NULL DEFAULT '[]'::jsonb,
  fecha_diagnostico      timestamptz NOT NULL,
  proximo_rediagnostico  timestamptz,
  created_at             timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.frecuencia_dial (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  fecha              date NOT NULL,
  momento            text NOT NULL CHECK (momento IN ('manana', 'noche')),
  frecuencia         int NOT NULL CHECK (frecuencia BETWEEN -100 AND 100),
  energias_escasez   jsonb NOT NULL DEFAULT '{}'::jsonb,
  acciones_subida    jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at         timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, fecha, momento)
);

CREATE TABLE public.frecuencia_espejo (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  fecha              date NOT NULL,
  momento            text NOT NULL CHECK (momento IN ('manana', 'noche')),
  como_me_veo        text,
  como_me_percibo    text,
  como_me_siento     text,
  foto_storage_path  text,
  vestimenta_manana  text,
  created_at         timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.frecuencia_conversaciones (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  canal       text NOT NULL CHECK (canal IN ('texto', 'voz')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id, user_id)
);

CREATE TABLE public.frecuencia_mensajes (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversacion_id  uuid NOT NULL,
  user_id          uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rol              text NOT NULL CHECK (rol IN ('user', 'assistant', 'system', 'tool')),
  contenido        text NOT NULL,
  modelo           text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (conversacion_id, user_id) REFERENCES public.frecuencia_conversaciones (id, user_id) ON DELETE CASCADE
);

CREATE TABLE public.frecuencia_areas (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  area_key            text NOT NULL,
  nivel_actual        int  NOT NULL DEFAULT 0 CHECK (nivel_actual BETWEEN 0 AND 10),
  es_palanca          boolean NOT NULL DEFAULT false,
  es_manzana_podrida  boolean NOT NULL DEFAULT false,
  updated_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, area_key)
);

CREATE TABLE public.frecuencia_objetivos (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  titulo                 text NOT NULL,
  imagen_mental          text,
  area_key               text,
  fecha_limite           date,
  identidad_que_expresa  text,
  metas_por_periodo      jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id, user_id)
);

CREATE TABLE public.frecuencia_tareas (
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
  FOREIGN KEY (objetivo_id, user_id) REFERENCES public.frecuencia_objetivos (id, user_id) ON DELETE CASCADE
);

-- bloques.tarea_id / evidencia.bloque_id: FK simple sin acción
-- (RESTRICT implícito) + trigger que desvincula antes del borrado —
-- ver sección b) y nota técnica del encabezado.
CREATE TABLE public.frecuencia_bloques (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tarea_id             uuid,
  tipo                 text NOT NULL,
  inicio               timestamptz NOT NULL,
  fin                  timestamptz NOT NULL,
  estado               text NOT NULL DEFAULT 'PROGRAMADO',
  interrupciones       int NOT NULL DEFAULT 0,
  minutos_reales_foco  int NOT NULL DEFAULT 0,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id, user_id),
  FOREIGN KEY (tarea_id, user_id) REFERENCES public.frecuencia_tareas (id, user_id)
);

CREATE TABLE public.frecuencia_evidencia (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  bloque_id   uuid,
  fecha       date NOT NULL,
  texto       text NOT NULL,
  tipo        text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (bloque_id, user_id) REFERENCES public.frecuencia_bloques (id, user_id)
);

CREATE TABLE public.frecuencia_ideas (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  texto       text NOT NULL,
  estado      text NOT NULL DEFAULT 'ESTACIONADA',
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.frecuencia_compromisos (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  co_conductor_id  uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  texto_mensual    text NOT NULL,
  avance           int NOT NULL DEFAULT 0,
  mes              date NOT NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.frecuencia_revisiones (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  semana            date NOT NULL,
  que_funciono      jsonb NOT NULL DEFAULT '[]'::jsonb,
  que_no            jsonb NOT NULL DEFAULT '[]'::jsonb,
  ajustes           jsonb NOT NULL DEFAULT '[]'::jsonb,
  carga_siguiente   jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, semana)
);

CREATE TABLE public.frecuencia_criterios (
  id                           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  equipo_id                    uuid REFERENCES public.frecuencia_equipos(id) ON DELETE SET NULL,
  ambito                       text NOT NULL CHECK (ambito IN ('personal', 'equipo')),
  titulo                       text NOT NULL,
  que_se_decide                text NOT NULL,
  que_entra                    text,
  que_no_entra                 text,
  costo_si_sale_mal            text,
  reversible                   boolean NOT NULL DEFAULT false,
  tiempo_reversibilidad        text,
  quien_asume_responsabilidad  text,
  activo                       boolean NOT NULL DEFAULT true,
  created_at                   timestamptz NOT NULL DEFAULT now(),
  updated_at                   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id, user_id)
);

CREATE TABLE public.frecuencia_delegaciones (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tarea_id     uuid NOT NULL,
  de_user_id   uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  a_user_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  criterio_id  uuid NOT NULL,
  volvio       boolean NOT NULL DEFAULT false,
  fecha        date NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  CHECK (de_user_id <> a_user_id),
  FOREIGN KEY (tarea_id, de_user_id) REFERENCES public.frecuencia_tareas (id, user_id) ON DELETE CASCADE,
  FOREIGN KEY (criterio_id, de_user_id) REFERENCES public.frecuencia_criterios (id, user_id) ON DELETE RESTRICT
);

CREATE TABLE public.frecuencia_imagenes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  objetivo_id   uuid,
  tarea_id      uuid,
  criterio_id   uuid,
  prompt        text NOT NULL,
  modelo        text,
  storage_path  text,
  estado        text NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'generando', 'lista', 'error')),
  created_at    timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (objetivo_id, user_id) REFERENCES public.frecuencia_objetivos (id, user_id),
  FOREIGN KEY (tarea_id, user_id)    REFERENCES public.frecuencia_tareas    (id, user_id),
  FOREIGN KEY (criterio_id, user_id) REFERENCES public.frecuencia_criterios (id, user_id)
);

-- =====================================================================
-- b) FUNCIONES — ya existen todas las tablas que referencian.
-- =====================================================================

-- ¿auth.uid() está habilitado para usar Frecuencia según su rol y la
-- lista dinámica de frecuencia_knowledge_blocks? Falla cerrada: si no
-- hay fila de config, solo admin.
CREATE FUNCTION public.frecuencia_habilitado()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public AS $$
DECLARE
  v_role  text;
  v_lista jsonb;
BEGIN
  SELECT role INTO v_role FROM public.profiles WHERE id = auth.uid();
  IF v_role IS NULL THEN RETURN false; END IF;

  SELECT valor INTO v_lista FROM public.frecuencia_knowledge_blocks
    WHERE clave = 'frecuencia_roles_habilitados';
  IF v_lista IS NULL THEN RETURN v_role = 'admin'; END IF;

  RETURN v_lista ? v_role;
END;
$$;
REVOKE ALL ON FUNCTION public.frecuencia_habilitado() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.frecuencia_habilitado() TO authenticated;

-- ¿auth.uid() lidera algún equipo del que p_user es miembro?
CREATE FUNCTION public.frecuencia_es_lider_de(p_user uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.frecuencia_equipos eq
    JOIN public.frecuencia_equipo_miembros em ON em.equipo_id = eq.id
    WHERE eq.lider_id = auth.uid() AND em.user_id = p_user
  );
$$;
REVOKE ALL ON FUNCTION public.frecuencia_es_lider_de(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.frecuencia_es_lider_de(uuid) TO authenticated;

-- ¿auth.uid() es miembro (o líder) del equipo p_equipo?
CREATE FUNCTION public.frecuencia_es_miembro(p_equipo uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.frecuencia_equipo_miembros em WHERE em.equipo_id = p_equipo AND em.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.frecuencia_equipos eq WHERE eq.id = p_equipo AND eq.lider_id = auth.uid()
  );
$$;
REVOKE ALL ON FUNCTION public.frecuencia_es_miembro(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.frecuencia_es_miembro(uuid) TO authenticated;

-- ¿p_a y p_b comparten algún equipo?
CREATE FUNCTION public.frecuencia_comparten_equipo(p_a uuid, p_b uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.frecuencia_equipo_miembros m1
    JOIN public.frecuencia_equipo_miembros m2 ON m1.equipo_id = m2.equipo_id
    WHERE m1.user_id = p_a AND m2.user_id = p_b
  );
$$;
REVOKE ALL ON FUNCTION public.frecuencia_comparten_equipo(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.frecuencia_comparten_equipo(uuid, uuid) TO authenticated;

-- ¿a auth.uid() le delegaron la tarea p_tarea?
CREATE FUNCTION public.frecuencia_me_delegaron(p_tarea uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.frecuencia_delegaciones d WHERE d.tarea_id = p_tarea AND d.a_user_id = auth.uid()
  );
$$;
REVOKE ALL ON FUNCTION public.frecuencia_me_delegaron(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.frecuencia_me_delegaron(uuid) TO authenticated;

-- ¿el criterio p_criterio es el de una delegación que recibió auth.uid()?
CREATE FUNCTION public.frecuencia_criterio_delegado(p_criterio uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.frecuencia_delegaciones d WHERE d.criterio_id = p_criterio AND d.a_user_id = auth.uid()
  );
$$;
REVOKE ALL ON FUNCTION public.frecuencia_criterio_delegado(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.frecuencia_criterio_delegado(uuid) TO authenticated;

-- Única vía para que el co-conductor toque "avance" — nunca el resto
-- de la fila, y nunca directo por UPDATE (no tiene policy de UPDATE).
CREATE FUNCTION public.frecuencia_actualizar_avance_compromiso(p_compromiso_id uuid, p_avance int)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.frecuencia_compromisos
  SET avance = p_avance, updated_at = now()
  WHERE id = p_compromiso_id
    AND (user_id = auth.uid() OR co_conductor_id = auth.uid());

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No autorizado o compromiso inexistente';
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.frecuencia_actualizar_avance_compromiso(uuid, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.frecuencia_actualizar_avance_compromiso(uuid, int) TO authenticated;

-- Al crear un equipo (o cambiarle el líder), el líder queda cargado
-- como miembro automáticamente — así frecuencia_comparten_equipo y
-- frecuencia_es_miembro funcionan sin depender de una carga manual.
CREATE FUNCTION public.frecuencia_al_crear_equipo()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.frecuencia_equipo_miembros (equipo_id, user_id, rol_en_equipo)
  VALUES (NEW.id, NEW.lider_id, 'lider')
  ON CONFLICT (equipo_id, user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE FUNCTION public.frecuencia_al_cambiar_lider()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.lider_id IS DISTINCT FROM OLD.lider_id THEN
    INSERT INTO public.frecuencia_equipo_miembros (equipo_id, user_id, rol_en_equipo)
    VALUES (NEW.id, NEW.lider_id, 'lider')
    ON CONFLICT (equipo_id, user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Desvincular hijos al borrar el padre (reemplaza "ON DELETE SET NULL
-- (columna)" — ver nota técnica del encabezado).
CREATE FUNCTION public.frecuencia_al_borrar_tarea()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  UPDATE public.frecuencia_bloques  SET tarea_id = NULL WHERE tarea_id = OLD.id;
  UPDATE public.frecuencia_imagenes SET tarea_id = NULL WHERE tarea_id = OLD.id;
  RETURN OLD;
END;
$$;

CREATE FUNCTION public.frecuencia_al_borrar_bloque()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  UPDATE public.frecuencia_evidencia SET bloque_id = NULL WHERE bloque_id = OLD.id;
  RETURN OLD;
END;
$$;

CREATE FUNCTION public.frecuencia_al_borrar_objetivo()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  UPDATE public.frecuencia_imagenes SET objetivo_id = NULL WHERE objetivo_id = OLD.id;
  RETURN OLD;
END;
$$;

CREATE FUNCTION public.frecuencia_al_borrar_criterio()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  UPDATE public.frecuencia_imagenes SET criterio_id = NULL WHERE criterio_id = OLD.id;
  RETURN OLD;
END;
$$;

CREATE FUNCTION public.frecuencia_set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- =====================================================================
-- c) RLS — ENABLE + REVOKE ALL FROM anon + políticas, tabla por tabla.
-- =====================================================================

ALTER TABLE public.frecuencia_knowledge_blocks ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.frecuencia_knowledge_blocks FROM anon;
CREATE POLICY frecuencia_knowledge_blocks_select ON public.frecuencia_knowledge_blocks
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY frecuencia_knowledge_blocks_admin_write ON public.frecuencia_knowledge_blocks
  FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

ALTER TABLE public.frecuencia_preferencias ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.frecuencia_preferencias FROM anon;
CREATE POLICY frecuencia_preferencias_select ON public.frecuencia_preferencias
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY frecuencia_preferencias_insert ON public.frecuencia_preferencias
  FOR INSERT WITH CHECK (user_id = auth.uid() AND public.frecuencia_habilitado());
CREATE POLICY frecuencia_preferencias_update ON public.frecuencia_preferencias
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid() AND public.frecuencia_habilitado());
CREATE POLICY frecuencia_preferencias_delete ON public.frecuencia_preferencias
  FOR DELETE USING (user_id = auth.uid());

-- Solo admin crea/edita/borra equipos y miembros. Líder y miembros,
-- solo lectura — vía las funciones de la sección b), sin subconsultas
-- cruzadas entre estas dos tablas en la misma policy.
ALTER TABLE public.frecuencia_equipos ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.frecuencia_equipos FROM anon;
CREATE POLICY frecuencia_equipos_select ON public.frecuencia_equipos
  FOR SELECT USING (
    lider_id = auth.uid()
    OR public.frecuencia_es_miembro(id)
    OR public.is_admin(auth.uid())
  );
CREATE POLICY frecuencia_equipos_admin_insert ON public.frecuencia_equipos
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY frecuencia_equipos_admin_update ON public.frecuencia_equipos
  FOR UPDATE USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY frecuencia_equipos_admin_delete ON public.frecuencia_equipos
  FOR DELETE USING (public.is_admin(auth.uid()));

ALTER TABLE public.frecuencia_equipo_miembros ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.frecuencia_equipo_miembros FROM anon;
CREATE POLICY frecuencia_equipo_miembros_select ON public.frecuencia_equipo_miembros
  FOR SELECT USING (
    user_id = auth.uid()
    OR public.frecuencia_es_miembro(equipo_id)
    OR public.is_admin(auth.uid())
  );
CREATE POLICY frecuencia_equipo_miembros_admin_insert ON public.frecuencia_equipo_miembros
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY frecuencia_equipo_miembros_admin_delete ON public.frecuencia_equipo_miembros
  FOR DELETE USING (public.is_admin(auth.uid()));

-- Íntimo — solo el dueño, sin excepción de admin ni de líder.
ALTER TABLE public.frecuencia_identidad ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.frecuencia_identidad FROM anon;
CREATE POLICY frecuencia_identidad_select ON public.frecuencia_identidad FOR SELECT USING (user_id = auth.uid());
CREATE POLICY frecuencia_identidad_insert ON public.frecuencia_identidad FOR INSERT WITH CHECK (user_id = auth.uid() AND public.frecuencia_habilitado());
CREATE POLICY frecuencia_identidad_update ON public.frecuencia_identidad FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid() AND public.frecuencia_habilitado());
CREATE POLICY frecuencia_identidad_delete ON public.frecuencia_identidad FOR DELETE USING (user_id = auth.uid());

ALTER TABLE public.frecuencia_mapa_energia ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.frecuencia_mapa_energia FROM anon;
CREATE POLICY frecuencia_mapa_energia_select ON public.frecuencia_mapa_energia FOR SELECT USING (user_id = auth.uid());
CREATE POLICY frecuencia_mapa_energia_insert ON public.frecuencia_mapa_energia FOR INSERT WITH CHECK (user_id = auth.uid() AND public.frecuencia_habilitado());
CREATE POLICY frecuencia_mapa_energia_update ON public.frecuencia_mapa_energia FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid() AND public.frecuencia_habilitado());
CREATE POLICY frecuencia_mapa_energia_delete ON public.frecuencia_mapa_energia FOR DELETE USING (user_id = auth.uid());

ALTER TABLE public.frecuencia_dial ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.frecuencia_dial FROM anon;
CREATE POLICY frecuencia_dial_select ON public.frecuencia_dial FOR SELECT USING (user_id = auth.uid());
CREATE POLICY frecuencia_dial_insert ON public.frecuencia_dial FOR INSERT WITH CHECK (user_id = auth.uid() AND public.frecuencia_habilitado());
CREATE POLICY frecuencia_dial_update ON public.frecuencia_dial FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid() AND public.frecuencia_habilitado());
CREATE POLICY frecuencia_dial_delete ON public.frecuencia_dial FOR DELETE USING (user_id = auth.uid());

ALTER TABLE public.frecuencia_espejo ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.frecuencia_espejo FROM anon;
CREATE POLICY frecuencia_espejo_select ON public.frecuencia_espejo FOR SELECT USING (user_id = auth.uid());
CREATE POLICY frecuencia_espejo_insert ON public.frecuencia_espejo FOR INSERT WITH CHECK (user_id = auth.uid() AND public.frecuencia_habilitado());
CREATE POLICY frecuencia_espejo_update ON public.frecuencia_espejo FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid() AND public.frecuencia_habilitado());
CREATE POLICY frecuencia_espejo_delete ON public.frecuencia_espejo FOR DELETE USING (user_id = auth.uid());

ALTER TABLE public.frecuencia_conversaciones ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.frecuencia_conversaciones FROM anon;
CREATE POLICY frecuencia_conversaciones_select ON public.frecuencia_conversaciones FOR SELECT USING (user_id = auth.uid());
CREATE POLICY frecuencia_conversaciones_insert ON public.frecuencia_conversaciones FOR INSERT WITH CHECK (user_id = auth.uid() AND public.frecuencia_habilitado());
CREATE POLICY frecuencia_conversaciones_update ON public.frecuencia_conversaciones FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid() AND public.frecuencia_habilitado());
CREATE POLICY frecuencia_conversaciones_delete ON public.frecuencia_conversaciones FOR DELETE USING (user_id = auth.uid());

ALTER TABLE public.frecuencia_mensajes ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.frecuencia_mensajes FROM anon;
CREATE POLICY frecuencia_mensajes_select ON public.frecuencia_mensajes FOR SELECT USING (user_id = auth.uid());
CREATE POLICY frecuencia_mensajes_insert ON public.frecuencia_mensajes FOR INSERT WITH CHECK (user_id = auth.uid() AND public.frecuencia_habilitado());
CREATE POLICY frecuencia_mensajes_update ON public.frecuencia_mensajes FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid() AND public.frecuencia_habilitado());
CREATE POLICY frecuencia_mensajes_delete ON public.frecuencia_mensajes FOR DELETE USING (user_id = auth.uid());

-- Admin no lee datos personales de nadie: sin *_admin_select en nada
-- de lo que sigue. Visibilidad extra: líder en bloques/evidencia;
-- quien recibió una delegación en tareas/criterios.
ALTER TABLE public.frecuencia_areas ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.frecuencia_areas FROM anon;
CREATE POLICY frecuencia_areas_select ON public.frecuencia_areas FOR SELECT USING (user_id = auth.uid());
CREATE POLICY frecuencia_areas_insert ON public.frecuencia_areas FOR INSERT WITH CHECK (user_id = auth.uid() AND public.frecuencia_habilitado());
CREATE POLICY frecuencia_areas_update ON public.frecuencia_areas FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid() AND public.frecuencia_habilitado());
CREATE POLICY frecuencia_areas_delete ON public.frecuencia_areas FOR DELETE USING (user_id = auth.uid());

ALTER TABLE public.frecuencia_objetivos ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.frecuencia_objetivos FROM anon;
CREATE POLICY frecuencia_objetivos_select ON public.frecuencia_objetivos FOR SELECT USING (user_id = auth.uid());
CREATE POLICY frecuencia_objetivos_insert ON public.frecuencia_objetivos FOR INSERT WITH CHECK (user_id = auth.uid() AND public.frecuencia_habilitado());
CREATE POLICY frecuencia_objetivos_update ON public.frecuencia_objetivos FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid() AND public.frecuencia_habilitado());
CREATE POLICY frecuencia_objetivos_delete ON public.frecuencia_objetivos FOR DELETE USING (user_id = auth.uid());

ALTER TABLE public.frecuencia_tareas ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.frecuencia_tareas FROM anon;
CREATE POLICY frecuencia_tareas_select ON public.frecuencia_tareas
  FOR SELECT USING (user_id = auth.uid() OR public.frecuencia_me_delegaron(id));
CREATE POLICY frecuencia_tareas_insert ON public.frecuencia_tareas FOR INSERT WITH CHECK (user_id = auth.uid() AND public.frecuencia_habilitado());
CREATE POLICY frecuencia_tareas_update ON public.frecuencia_tareas FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid() AND public.frecuencia_habilitado());
CREATE POLICY frecuencia_tareas_delete ON public.frecuencia_tareas FOR DELETE USING (user_id = auth.uid());

ALTER TABLE public.frecuencia_ideas ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.frecuencia_ideas FROM anon;
CREATE POLICY frecuencia_ideas_select ON public.frecuencia_ideas FOR SELECT USING (user_id = auth.uid());
CREATE POLICY frecuencia_ideas_insert ON public.frecuencia_ideas FOR INSERT WITH CHECK (user_id = auth.uid() AND public.frecuencia_habilitado());
CREATE POLICY frecuencia_ideas_update ON public.frecuencia_ideas FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid() AND public.frecuencia_habilitado());
CREATE POLICY frecuencia_ideas_delete ON public.frecuencia_ideas FOR DELETE USING (user_id = auth.uid());

ALTER TABLE public.frecuencia_bloques ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.frecuencia_bloques FROM anon;
CREATE POLICY frecuencia_bloques_select ON public.frecuencia_bloques
  FOR SELECT USING (user_id = auth.uid() OR public.frecuencia_es_lider_de(user_id));
CREATE POLICY frecuencia_bloques_insert ON public.frecuencia_bloques FOR INSERT WITH CHECK (user_id = auth.uid() AND public.frecuencia_habilitado());
CREATE POLICY frecuencia_bloques_update ON public.frecuencia_bloques FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid() AND public.frecuencia_habilitado());
CREATE POLICY frecuencia_bloques_delete ON public.frecuencia_bloques FOR DELETE USING (user_id = auth.uid());

ALTER TABLE public.frecuencia_evidencia ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.frecuencia_evidencia FROM anon;
CREATE POLICY frecuencia_evidencia_select ON public.frecuencia_evidencia
  FOR SELECT USING (user_id = auth.uid() OR public.frecuencia_es_lider_de(user_id));
CREATE POLICY frecuencia_evidencia_insert ON public.frecuencia_evidencia FOR INSERT WITH CHECK (user_id = auth.uid() AND public.frecuencia_habilitado());
CREATE POLICY frecuencia_evidencia_update ON public.frecuencia_evidencia FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid() AND public.frecuencia_habilitado());
CREATE POLICY frecuencia_evidencia_delete ON public.frecuencia_evidencia FOR DELETE USING (user_id = auth.uid());

-- Compromisos y revisiones. Sin admin. Dueño + co-conductor (solo
-- lectura) + líder del equipo del dueño (solo lectura).
ALTER TABLE public.frecuencia_compromisos ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.frecuencia_compromisos FROM anon;
CREATE POLICY frecuencia_compromisos_select ON public.frecuencia_compromisos
  FOR SELECT USING (
    user_id = auth.uid()
    OR co_conductor_id = auth.uid()
    OR public.frecuencia_es_lider_de(user_id)
  );
CREATE POLICY frecuencia_compromisos_insert ON public.frecuencia_compromisos
  FOR INSERT WITH CHECK (user_id = auth.uid() AND public.frecuencia_habilitado());
CREATE POLICY frecuencia_compromisos_update ON public.frecuencia_compromisos
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid() AND public.frecuencia_habilitado());
CREATE POLICY frecuencia_compromisos_delete ON public.frecuencia_compromisos
  FOR DELETE USING (user_id = auth.uid());

ALTER TABLE public.frecuencia_revisiones ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.frecuencia_revisiones FROM anon;
CREATE POLICY frecuencia_revisiones_select ON public.frecuencia_revisiones FOR SELECT USING (user_id = auth.uid());
CREATE POLICY frecuencia_revisiones_insert ON public.frecuencia_revisiones FOR INSERT WITH CHECK (user_id = auth.uid() AND public.frecuencia_habilitado());
CREATE POLICY frecuencia_revisiones_update ON public.frecuencia_revisiones FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid() AND public.frecuencia_habilitado());
CREATE POLICY frecuencia_revisiones_delete ON public.frecuencia_revisiones FOR DELETE USING (user_id = auth.uid());

-- Criterios y delegaciones. Las dos partes leen una delegación. Edita
-- (incluido "volvio") SOLO quien delega. INSERT exige que delegador y
-- receptor compartan equipo.
ALTER TABLE public.frecuencia_criterios ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.frecuencia_criterios FROM anon;
CREATE POLICY frecuencia_criterios_select ON public.frecuencia_criterios
  FOR SELECT USING (user_id = auth.uid() OR public.frecuencia_criterio_delegado(id));
CREATE POLICY frecuencia_criterios_insert ON public.frecuencia_criterios FOR INSERT WITH CHECK (user_id = auth.uid() AND public.frecuencia_habilitado());
CREATE POLICY frecuencia_criterios_update ON public.frecuencia_criterios FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid() AND public.frecuencia_habilitado());
CREATE POLICY frecuencia_criterios_delete ON public.frecuencia_criterios FOR DELETE USING (user_id = auth.uid());

ALTER TABLE public.frecuencia_delegaciones ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.frecuencia_delegaciones FROM anon;
CREATE POLICY frecuencia_delegaciones_select ON public.frecuencia_delegaciones
  FOR SELECT USING (
    de_user_id = auth.uid()
    OR a_user_id = auth.uid()
    OR public.frecuencia_es_lider_de(de_user_id)
    OR public.frecuencia_es_lider_de(a_user_id)
  );
CREATE POLICY frecuencia_delegaciones_insert ON public.frecuencia_delegaciones
  FOR INSERT WITH CHECK (
    de_user_id = auth.uid()
    AND public.frecuencia_comparten_equipo(de_user_id, a_user_id)
    AND public.frecuencia_habilitado()
  );
CREATE POLICY frecuencia_delegaciones_update ON public.frecuencia_delegaciones
  FOR UPDATE USING (de_user_id = auth.uid())
  WITH CHECK (de_user_id = auth.uid() AND public.frecuencia_habilitado());
CREATE POLICY frecuencia_delegaciones_delete ON public.frecuencia_delegaciones
  FOR DELETE USING (de_user_id = auth.uid());

ALTER TABLE public.frecuencia_imagenes ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.frecuencia_imagenes FROM anon;
CREATE POLICY frecuencia_imagenes_select ON public.frecuencia_imagenes FOR SELECT USING (user_id = auth.uid());
CREATE POLICY frecuencia_imagenes_insert ON public.frecuencia_imagenes FOR INSERT WITH CHECK (user_id = auth.uid() AND public.frecuencia_habilitado());
CREATE POLICY frecuencia_imagenes_update ON public.frecuencia_imagenes FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid() AND public.frecuencia_habilitado());
CREATE POLICY frecuencia_imagenes_delete ON public.frecuencia_imagenes FOR DELETE USING (user_id = auth.uid());

-- =====================================================================
-- d) TRIGGERS, ÍNDICES, STORAGE, SEED
-- =====================================================================

CREATE TRIGGER trg_frecuencia_equipos_after_insert
  AFTER INSERT ON public.frecuencia_equipos
  FOR EACH ROW EXECUTE FUNCTION public.frecuencia_al_crear_equipo();
CREATE TRIGGER trg_frecuencia_equipos_after_update_lider
  AFTER UPDATE OF lider_id ON public.frecuencia_equipos
  FOR EACH ROW EXECUTE FUNCTION public.frecuencia_al_cambiar_lider();

CREATE TRIGGER trg_frecuencia_tareas_before_delete
  BEFORE DELETE ON public.frecuencia_tareas
  FOR EACH ROW EXECUTE FUNCTION public.frecuencia_al_borrar_tarea();
CREATE TRIGGER trg_frecuencia_bloques_before_delete
  BEFORE DELETE ON public.frecuencia_bloques
  FOR EACH ROW EXECUTE FUNCTION public.frecuencia_al_borrar_bloque();
CREATE TRIGGER trg_frecuencia_objetivos_before_delete
  BEFORE DELETE ON public.frecuencia_objetivos
  FOR EACH ROW EXECUTE FUNCTION public.frecuencia_al_borrar_objetivo();
CREATE TRIGGER trg_frecuencia_criterios_before_delete
  BEFORE DELETE ON public.frecuencia_criterios
  FOR EACH ROW EXECUTE FUNCTION public.frecuencia_al_borrar_criterio();

CREATE TRIGGER trg_frecuencia_identidad_updated        BEFORE UPDATE ON public.frecuencia_identidad        FOR EACH ROW EXECUTE FUNCTION public.frecuencia_set_updated_at();
CREATE TRIGGER trg_frecuencia_preferencias_updated     BEFORE UPDATE ON public.frecuencia_preferencias     FOR EACH ROW EXECUTE FUNCTION public.frecuencia_set_updated_at();
CREATE TRIGGER trg_frecuencia_objetivos_updated        BEFORE UPDATE ON public.frecuencia_objetivos        FOR EACH ROW EXECUTE FUNCTION public.frecuencia_set_updated_at();
CREATE TRIGGER trg_frecuencia_tareas_updated           BEFORE UPDATE ON public.frecuencia_tareas           FOR EACH ROW EXECUTE FUNCTION public.frecuencia_set_updated_at();
CREATE TRIGGER trg_frecuencia_bloques_updated          BEFORE UPDATE ON public.frecuencia_bloques          FOR EACH ROW EXECUTE FUNCTION public.frecuencia_set_updated_at();
CREATE TRIGGER trg_frecuencia_compromisos_updated      BEFORE UPDATE ON public.frecuencia_compromisos      FOR EACH ROW EXECUTE FUNCTION public.frecuencia_set_updated_at();
CREATE TRIGGER trg_frecuencia_criterios_updated        BEFORE UPDATE ON public.frecuencia_criterios        FOR EACH ROW EXECUTE FUNCTION public.frecuencia_set_updated_at();
CREATE TRIGGER trg_frecuencia_knowledge_blocks_updated BEFORE UPDATE ON public.frecuencia_knowledge_blocks FOR EACH ROW EXECUTE FUNCTION public.frecuencia_set_updated_at();

CREATE INDEX idx_frecuencia_objetivos_user        ON public.frecuencia_objetivos(user_id);
CREATE INDEX idx_frecuencia_tareas_user           ON public.frecuencia_tareas(user_id);
CREATE INDEX idx_frecuencia_tareas_objetivo       ON public.frecuencia_tareas(objetivo_id);
CREATE INDEX idx_frecuencia_bloques_user          ON public.frecuencia_bloques(user_id, inicio);
CREATE INDEX idx_frecuencia_bloques_tarea         ON public.frecuencia_bloques(tarea_id);
CREATE INDEX idx_frecuencia_dial_user             ON public.frecuencia_dial(user_id, fecha DESC);
CREATE INDEX idx_frecuencia_espejo_user           ON public.frecuencia_espejo(user_id, fecha DESC);
CREATE INDEX idx_frecuencia_evidencia_user        ON public.frecuencia_evidencia(user_id, fecha DESC);
CREATE INDEX idx_frecuencia_evidencia_bloque      ON public.frecuencia_evidencia(bloque_id);
CREATE INDEX idx_frecuencia_ideas_user            ON public.frecuencia_ideas(user_id);
CREATE INDEX idx_frecuencia_criterios_user        ON public.frecuencia_criterios(user_id);
CREATE INDEX idx_frecuencia_delegaciones_de       ON public.frecuencia_delegaciones(de_user_id);
CREATE INDEX idx_frecuencia_delegaciones_a        ON public.frecuencia_delegaciones(a_user_id);
CREATE INDEX idx_frecuencia_delegaciones_tarea    ON public.frecuencia_delegaciones(tarea_id);
CREATE INDEX idx_frecuencia_delegaciones_criterio ON public.frecuencia_delegaciones(criterio_id);
CREATE INDEX idx_frecuencia_imagenes_user         ON public.frecuencia_imagenes(user_id);
CREATE INDEX idx_frecuencia_equipo_miembros_user  ON public.frecuencia_equipo_miembros(user_id);
CREATE INDEX idx_frecuencia_compromisos_user      ON public.frecuencia_compromisos(user_id);
CREATE INDEX idx_frecuencia_compromisos_co        ON public.frecuencia_compromisos(co_conductor_id);

-- El bucket 'frecuencia-imagenes' se crea aparte, con la Storage API
-- (scripts/frecuencia-bucket.mjs) — ver nota técnica del encabezado.

CREATE POLICY frecuencia_imagenes_storage_select ON storage.objects
  FOR SELECT USING (bucket_id = 'frecuencia-imagenes' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY frecuencia_imagenes_storage_insert ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'frecuencia-imagenes' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY frecuencia_imagenes_storage_delete ON storage.objects
  FOR DELETE USING (bucket_id = 'frecuencia-imagenes' AND (storage.foldername(name))[1] = auth.uid()::text);

INSERT INTO public.frecuencia_knowledge_blocks (clave, valor) VALUES
('frecuencia_roles_habilitados', '["admin","setter","closer"]'::jsonb),

('areas_vida', '[
 {"key":"conocer_quien_sos","nombre":"Conocer quién sos"},
 {"key":"creer_en_vos","nombre":"Creer en vos"},
 {"key":"salud","nombre":"Salud"},
 {"key":"relaciones","nombre":"Relaciones"},
 {"key":"familia","nombre":"Familia"},
 {"key":"pareja","nombre":"Pareja"},
 {"key":"trascendencia","nombre":"Trascendencia"},
 {"key":"proposito","nombre":"Propósito"},
 {"key":"carrera_profesional","nombre":"Carrera profesional"},
 {"key":"libertad_financiera","nombre":"Libertad financiera"}
]'::jsonb),

('areas_reglas', '{
 "palanca":"El área fuerte tira de las demás: el objetivo principal se apoya en ella.",
 "manzana_podrida":"El área débil contagia al resto: se lleva como mínimo a un aprobado.",
 "contagio_rapido":["salud","libertad_financiera"]
}'::jsonb),

('energias_escasez', '[
 {"key":"envidia","nombre":"Envidia"},
 {"key":"resentimiento","nombre":"Resentimiento"},
 {"key":"critica","nombre":"Crítica"},
 {"key":"queja","nombre":"Queja"}
]'::jsonb),

('acciones_subida', '["Silencio","Dormir bien","Libros que elevan","Películas que elevan","Personas que elevan","Movimiento"]'::jsonb),

('pasos_ante_falla', '[
 {"paso":1,"nombre":"Conciencia","descripcion":"Tomar conciencia de los hechos: pasó esto."},
 {"paso":2,"nombre":"Comprensión","descripcion":"Entender por qué pasó: hice tal cosa, o cuando pasa esto tiendo a responder así."},
 {"paso":3,"nombre":"Disociación","descripcion":"Separar el hecho de la persona: no soy un fracaso, cometí un error."},
 {"paso":4,"nombre":"Declaración","descripcion":"Declarar qué voy a hacer distinto la próxima vez."}
]'::jsonb),

('reglas_foco', '[
 "Las primeras horas del día, sin mail ni celular, van a la tarea más difícil.",
 "Una sola tarea por bloque: el multitasking no existe.",
 "Cada interrupción cuesta el tiempo de la interrupción más el de antes y el de volver a enfocarse.",
 "Anticipá el bloque: avisá al equipo o a tu casa que vas a estar en foco.",
 "Lo que hacés, hacelo completo: la media dosis genera resistencia."
]'::jsonb),

('reglas_decision', '{
 "decisiones_importantes":"temprano, con energía; nunca al final del día cansado",
 "decisiones_dificiles":"si no hay urgencia, dormirlas una noche y volver a mirarlas",
 "umbral_fatiga":{"todo":true,"nota":"hora a partir de la cual no se agendan decisiones importantes"}
}'::jsonb),

('mapa_energia_default', '{
 "regla":"Las primeras 3 a 4 horas desde que te despertás son para la tarea más difícil, sin mail ni celular.",
 "relativo_a":"hora_despertar",
 "rediagnosticar":"el mapa cambia con la edad y con los hechos de la vida: volver a diagnosticar cada tanto",
 "frecuencia_rediagnostico_semanas":{"todo":true}
}'::jsonb),

('reglas_plan', '{
 "pre_diseno":"El día se diseña la noche anterior; la semana se arma el domingo en bloques.",
 "no_negociables_primero":"Descanso, familia, entrenamiento y lo propio se agendan antes que todo, como un cliente más.",
 "area_debil":"La manzana podrida recibe una dosis mínima fija cada semana.",
 "ejecutar_vs_orquestar":"No se ejecuta y se orquesta en el mismo bloque.",
 "imprevistos":"Se deja margen libre a propósito para lo que surja.",
 "prioridad":"Primero la tarea que desbloquea más tareas."
}'::jsonb),

('reglas_dosis', '{
 "habitos_en_oferta":"Arrancar con una dosis que cualquiera pueda cumplir (ejemplo: 15 minutos, 3 veces por semana) y dejar que crezca por interés compuesto.",
 "dosis_completa":"Chica pero completa: nunca media dosis de algo grande.",
 "no_necesito_ser_primero":"Ser primero cuesta 100 horas; ser segundo, 70. Las 30 que sobran van a las otras áreas.",
 "dos_minutos_de_dolor":"Casi todo lo bueno es incómodo al principio y pasa rápido: arrancá solo los primeros minutos.",
 "umbral_subir_dosis":{"todo":true},
 "umbral_bajar_dosis":{"todo":true}
}'::jsonb),

('criterio', '{
 "puntos":[
  {"key":"que_se_decide","pregunta":"¿Qué se está decidiendo?"},
  {"key":"que_entra_y_que_no","pregunta":"¿Qué entra en esta decisión y qué queda afuera?"},
  {"key":"costo_si_sale_mal","pregunta":"¿Qué costo pago si sale mal?"},
  {"key":"reversible","pregunta":"¿Es reversible? ¿En cuánto tiempo?"}
 ],
 "regla":"Si no está escrito, no es criterio.",
 "responsabilidad":"Quien delega asume por escrito la responsabilidad si sale mal.",
 "no_delegable":["Decisiones sobre personas","Reputación: lo que defendés con tu nombre","Dirección de la empresa"],
 "test":"Si delegás una tarea y vuelve a tu escritorio, no delegaste criterio."
}'::jsonb),

('limite_imagenes_diario', '{"todo":true}'::jsonb),
('tono_agente', '{"todo":true,"propuesta":"El amigo que te agarra de las solapas: te hace decirte la verdad, sin culpa, separando el hecho de la persona."}'::jsonb),
('preguntas_onboarding', '{"todo":true}'::jsonb),
('modelos_ia', '{"chat":[],"imagenes":[]}'::jsonb)

ON CONFLICT (clave) DO NOTHING;

COMMIT;
