-- =====================================================================
-- ROLLBACK de 0078_frecuencia_modelo.sql
--
-- Borra SOLO objetos frecuencia_ (tablas, funciones, políticas de
-- storage.objects filtradas por bucket_id, y el bucket). No toca nada
-- más. Orden inverso de dependencias. Envuelto en transacción.
-- =====================================================================

BEGIN;

-- Storage: políticas primero, después el bucket y sus objetos.
DROP POLICY IF EXISTS frecuencia_imagenes_storage_select ON storage.objects;
DROP POLICY IF EXISTS frecuencia_imagenes_storage_insert ON storage.objects;
DROP POLICY IF EXISTS frecuencia_imagenes_storage_delete ON storage.objects;
DELETE FROM storage.objects WHERE bucket_id = 'frecuencia-imagenes';
DELETE FROM storage.buckets WHERE id = 'frecuencia-imagenes';

-- Tablas, en orden inverso de dependencias (hijas antes que padres).
DROP TABLE IF EXISTS frecuencia_imagenes;
DROP TABLE IF EXISTS frecuencia_delegaciones;
DROP TABLE IF EXISTS frecuencia_criterios;
DROP TABLE IF EXISTS frecuencia_revisiones;
DROP TABLE IF EXISTS frecuencia_compromisos;
DROP TABLE IF EXISTS frecuencia_evidencia;
DROP TABLE IF EXISTS frecuencia_ideas;
DROP TABLE IF EXISTS frecuencia_bloques;
DROP TABLE IF EXISTS frecuencia_tareas;
DROP TABLE IF EXISTS frecuencia_objetivos;
DROP TABLE IF EXISTS frecuencia_areas;
DROP TABLE IF EXISTS frecuencia_mensajes;
DROP TABLE IF EXISTS frecuencia_conversaciones;
DROP TABLE IF EXISTS frecuencia_espejo;
DROP TABLE IF EXISTS frecuencia_dial;
DROP TABLE IF EXISTS frecuencia_mapa_energia;
DROP TABLE IF EXISTS frecuencia_identidad;
DROP TABLE IF EXISTS frecuencia_equipo_miembros;
DROP TABLE IF EXISTS frecuencia_equipos;
DROP TABLE IF EXISTS frecuencia_preferencias;
DROP TABLE IF EXISTS frecuencia_knowledge_blocks;

-- Funciones propias.
DROP FUNCTION IF EXISTS frecuencia_actualizar_avance_compromiso(uuid, int);
DROP FUNCTION IF EXISTS frecuencia_set_updated_at();

COMMIT;
