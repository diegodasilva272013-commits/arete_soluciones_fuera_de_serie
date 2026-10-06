-- =====================================================================
-- 0079 · Frecuencia Fase 4 — inicio y fin REALES del bloque.
--
-- PROPUESTA, NO CORRIDA. Esperando tu ok.
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

COMMENT ON COLUMN public.frecuencia_bloques.inicio_real IS 'Momento real en que el usuario apretó "Salir al aire" — null si el bloque nunca arrancó.';
COMMENT ON COLUMN public.frecuencia_bloques.fin_real IS 'Momento real en que el bloque terminó (cumplido o abandonado) — null mientras está en curso o si nunca arrancó.';

COMMIT;
