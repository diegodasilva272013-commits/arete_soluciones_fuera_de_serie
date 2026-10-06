-- Busca los 4 archivos sin referencia en el código en TODAS las
-- columnas de texto/jsonb de TODAS las tablas de public. Función
-- temporal en pg_temp: se borra sola al cerrar la sesión del SQL
-- Editor, no deja nada permanente en la base.
--
-- Devuelve filas SOLO donde encontró coincidencias (tabla, columna,
-- patrón, cantidad de filas que matchean). Si no devuelve nada, no
-- hay ninguna referencia en la base.

CREATE OR REPLACE FUNCTION pg_temp.buscar_archivos_huerfanos()
RETURNS TABLE(tabla text, columna text, patron text, coincidencias bigint) AS $$
DECLARE
  r RECORD;
  pat TEXT;
  patterns TEXT[] := ARRAY[
    'Estudio_juridico_noa_testimonio',
    'vi.mp4',
    'video_noa',
    '(1).png'
  ];
  cnt BIGINT;
BEGIN
  FOR r IN
    SELECT c.table_name, c.column_name
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
      AND c.data_type IN ('text', 'character varying', 'jsonb', 'json')
  LOOP
    FOREACH pat IN ARRAY patterns LOOP
      BEGIN
        EXECUTE format(
          'SELECT count(*) FROM public.%I WHERE %I::text ILIKE %L',
          r.table_name, r.column_name, '%' || pat || '%'
        ) INTO cnt;
      EXCEPTION WHEN OTHERS THEN
        cnt := NULL; -- columna no se pudo castear a text; revisar a mano si aparece NULL
      END;
      IF cnt IS NOT NULL AND cnt > 0 THEN
        tabla := r.table_name;
        columna := r.column_name;
        patron := pat;
        coincidencias := cnt;
        RETURN NEXT;
      END IF;
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

SELECT * FROM pg_temp.buscar_archivos_huerfanos();
