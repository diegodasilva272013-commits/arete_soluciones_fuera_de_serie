-- =====================================================================
-- 0081 · Frecuencia — palabras de escasez (7.6), contenido del método.
--
-- PARA CORRER POR DIEGO (SQL Editor), en este orden:
--   1) 0081_..._CHECK.sql  (tiene que dar 0)
--   2) este archivo
--   3) 0081_..._VERIFY.sql (esperado: 1 fila, 4 energías, 38 entradas en total)
-- Rollback: 0081_..._ROLLBACK.sql
--
-- Solo inserta UNA fila en public.frecuencia_knowledge_blocks (no cambia
-- estructura). Las palabras son una PROPUESTA editable: Diego puede
-- cambiarlas después con un UPDATE. El "*" al final de una entrada
-- significa "empieza con" (ej.: quej* detecta queja, quejo, quejarme).
-- =====================================================================

BEGIN;

INSERT INTO public.frecuencia_knowledge_blocks (clave, valor)
VALUES (
  'palabras_escasez',
  '{
    "envidia": ["envidia", "envidio", "ojalá fuera como", "qué suerte tienen", "por qué ellos", "a él le sale todo", "a ella le sale todo", "todo le sale bien"],
    "resentimiento": ["resentimiento", "resentido", "resentida", "rencor", "me la deben", "no se lo perdono", "me arruinó", "se aprovechó de mí", "me hicieron mal"],
    "critica": ["inútil", "incapaz", "no sirve para nada", "no tiene idea", "no entiende nada", "mediocre", "qué pelotudo", "son todos unos", "siempre la caga"],
    "queja": ["quej*", "no puedo más", "no me alcanza", "es injusto", "injusto", "siempre me pasa a mí", "nunca me sale", "estoy podrido", "estoy podrida", "qué asco", "harto", "harta"]
  }'::jsonb
);

COMMIT;
