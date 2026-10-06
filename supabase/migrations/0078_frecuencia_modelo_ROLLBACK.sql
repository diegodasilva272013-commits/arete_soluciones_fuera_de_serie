-- =====================================================================
-- ROLLBACK de 0078_frecuencia_modelo.sql (v6)
--
-- Borra objetos frecuencia_ (tablas, funciones, triggers, políticas de
-- storage.objects filtradas por bucket_id). No toca nada más. Orden
-- inverso de dependencias. Envuelto en transacción.
--
-- ORDEN DE EJECUCIÓN (storage.objects/storage.buckets están protegidos
-- en producción contra DELETE directo por SQL — triggers
-- protect_objects_delete / protect_buckets_delete):
--   1. node scripts/frecuencia-bucket-rollback.mjs   (vacía y borra el bucket)
--   2. este archivo (SQL)                            (política, tablas, funciones)
-- =====================================================================

BEGIN;

-- Storage: solo las políticas (no están protegidas). El vaciado y
-- borrado del bucket ya se hizo con el script de la Storage API —
-- ver orden de ejecución arriba.
DROP POLICY IF EXISTS frecuencia_imagenes_storage_select ON storage.objects;
DROP POLICY IF EXISTS frecuencia_imagenes_storage_insert ON storage.objects;
DROP POLICY IF EXISTS frecuencia_imagenes_storage_delete ON storage.objects;

-- Tablas, en orden inverso de dependencias (hijas antes que padres).
-- Los triggers y sus funciones se van solos con DROP TABLE, salvo las
-- funciones de trigger que viven independientes de una sola tabla.
DROP TABLE IF EXISTS public.frecuencia_imagenes;
DROP TABLE IF EXISTS public.frecuencia_delegaciones;
DROP TABLE IF EXISTS public.frecuencia_criterios;
DROP TABLE IF EXISTS public.frecuencia_revisiones;
DROP TABLE IF EXISTS public.frecuencia_compromisos;
DROP TABLE IF EXISTS public.frecuencia_evidencia;
DROP TABLE IF EXISTS public.frecuencia_ideas;

-- 0079: columnas/constraint/índice de inicio y fin reales del bloque
-- (EN EL AIRE), antes de borrar la tabla.
DROP INDEX IF EXISTS public.idx_frecuencia_bloques_un_solo_en_el_aire;
ALTER TABLE public.frecuencia_bloques DROP CONSTRAINT IF EXISTS frecuencia_bloques_fin_real_valido;
ALTER TABLE public.frecuencia_bloques
  DROP COLUMN IF EXISTS fin_real,
  DROP COLUMN IF EXISTS inicio_real;

DROP TABLE IF EXISTS public.frecuencia_bloques;
DROP TABLE IF EXISTS public.frecuencia_tareas;
DROP TABLE IF EXISTS public.frecuencia_objetivos;
DROP TABLE IF EXISTS public.frecuencia_areas;
DROP TABLE IF EXISTS public.frecuencia_mensajes;
DROP TABLE IF EXISTS public.frecuencia_conversaciones;
DROP TABLE IF EXISTS public.frecuencia_espejo;
DROP TABLE IF EXISTS public.frecuencia_dial;
DROP TABLE IF EXISTS public.frecuencia_mapa_energia;
DROP TABLE IF EXISTS public.frecuencia_identidad;
DROP TABLE IF EXISTS public.frecuencia_equipo_miembros;
DROP TABLE IF EXISTS public.frecuencia_equipos;
DROP TABLE IF EXISTS public.frecuencia_preferencias;
DROP TABLE IF EXISTS public.frecuencia_knowledge_blocks;

-- Funciones de trigger (sus triggers ya se borraron con las tablas).
DROP FUNCTION IF EXISTS public.frecuencia_al_crear_equipo();
DROP FUNCTION IF EXISTS public.frecuencia_al_cambiar_lider();
DROP FUNCTION IF EXISTS public.frecuencia_al_borrar_tarea();
DROP FUNCTION IF EXISTS public.frecuencia_al_borrar_bloque();
DROP FUNCTION IF EXISTS public.frecuencia_al_borrar_objetivo();
DROP FUNCTION IF EXISTS public.frecuencia_al_borrar_criterio();
DROP FUNCTION IF EXISTS public.frecuencia_set_updated_at();

-- Función de escritura controlada.
DROP FUNCTION IF EXISTS public.frecuencia_actualizar_avance_compromiso(uuid, int);

-- Funciones SECURITY DEFINER de RLS (sección 2 de la migración).
DROP FUNCTION IF EXISTS public.frecuencia_habilitado();
DROP FUNCTION IF EXISTS public.frecuencia_es_lider_de(uuid);
DROP FUNCTION IF EXISTS public.frecuencia_es_miembro(uuid);
DROP FUNCTION IF EXISTS public.frecuencia_comparten_equipo(uuid, uuid);
DROP FUNCTION IF EXISTS public.frecuencia_me_delegaron(uuid);
DROP FUNCTION IF EXISTS public.frecuencia_criterio_delegado(uuid);

COMMIT;
