-- =====================================================================
-- 0079 · Frecuencia Fase 4 — inicio y fin REALES del bloque.
--
-- CORRIDA en producción (por Diego). Este archivo refleja exactamente
-- lo que se ejecutó — incluye 2 agregados de Diego sobre la propuesta
-- original: el CHECK de fin_real válido y el índice único de "un solo
-- bloque EN_EL_AIRE por usuario a la vez".
--
-- Por qué: inicio/fin de frecuencia_bloques son la ventana PLANEADA
-- (la que arma el motor de la semana). El cronómetro de "EN EL AIRE"
-- necesita el momento REAL en que el usuario arrancó y terminó, para
-- sobrevivir a un reload o a cambiar de dispositivo sin perder el
-- tiempo transcurrido — leyendo inicio_real desde la base y calculando
-- el elapsed contra el reloj del servidor, nunca con localStorage ni
-- con updated_at (que se pisa con cualquier otro cambio a la fila).
--
-- Todo nullable: la inmensa mayoría de los bloques quedan solo
-- planeados y nunca llegan a "salir al aire".
-- =====================================================================

BEGIN;

ALTER TABLE public.frecuencia_bloques
  ADD COLUMN inicio_real timestamptz,
  ADD COLUMN fin_real    timestamptz;

ALTER TABLE public.frecuencia_bloques
  ADD CONSTRAINT frecuencia_bloques_fin_real_valido
  CHECK (fin_real IS NULL OR inicio_real IS NULL OR fin_real >= inicio_real);

CREATE UNIQUE INDEX idx_frecuencia_bloques_un_solo_en_el_aire
  ON public.frecuencia_bloques (user_id)
  WHERE estado = 'EN_EL_AIRE';

COMMENT ON COLUMN public.frecuencia_bloques.inicio_real IS 'Momento real en que el usuario apretó Salir al aire. Null si el bloque nunca arrancó.';
COMMENT ON COLUMN public.frecuencia_bloques.fin_real IS 'Momento real en que el bloque terminó (cumplido o abandonado). Null mientras está en curso o si nunca arrancó.';

COMMIT;
