-- =====================================================================
-- 0082 · Frecuencia Fase 5 — contenido de la IA en frecuencia_knowledge_blocks:
--        modelos habilitados (modelos_ia) y los prompts (prompt_chat,
--        prompt_descomposicion). NO cambia estructura.
--
-- PARA CORRER POR DIEGO (SQL Editor), en este orden:
--   1) 0082_..._CHECK.sql  (esperado: modelos_ia_vacio = 1, prompts_existentes = 0)
--   2) este archivo
--   3) 0082_..._VERIFY.sql (esperado en cada fila: ver columna "esperado")
-- Rollback: 0082_..._ROLLBACK.sql
--
-- Modelos: solo licencias comerciales confirmadas. FLUX.1-schnell y
-- FLUX.2-klein-4B: Apache-2.0 (confirmado por fuentes secundarias; verificalo
-- también en la ficha del modelo en build.nvidia.com antes de producción).
-- Stable Diffusion 3.5: DESCARTADO (licencia no comercial). Qwen-Image: queda
-- afuera hasta confirmar endpoint y licencia en NVIDIA.
-- Los ids de los modelos de chat son una PROPUESTA: confirmá que existan en
-- tu catálogo de build.nvidia.com (si alguno no existe, se cambia con un UPDATE).
-- =====================================================================

BEGIN;

UPDATE public.frecuencia_knowledge_blocks
SET valor = '{
  "chat": [
    {"id": "meta/llama-3.3-70b-instruct", "nombre": "Llama 3.3 70B", "licencia": "Llama 3.3 Community License", "por_defecto": true},
    {"id": "meta/llama-3.1-8b-instruct", "nombre": "Llama 3.1 8B (más rápido)", "licencia": "Llama 3.1 Community License"}
  ],
  "imagenes": [
    {"id": "black-forest-labs/flux.1-schnell", "nombre": "FLUX.1 schnell", "licencia": "Apache-2.0", "endpoint": "https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-schnell", "por_defecto": true},
    {"id": "black-forest-labs/flux.2-klein-4b", "nombre": "FLUX.2 klein 4B", "licencia": "Apache-2.0", "endpoint": "https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.2-klein-4b"}
  ]
}'::jsonb,
    updated_at = now()
WHERE clave = 'modelos_ia';

INSERT INTO public.frecuencia_knowledge_blocks (clave, valor) VALUES
(
  'prompt_chat',
  '{"texto": "Sos el agente de Frecuencia: el amigo que te agarra de las solapas. Hablás en voseo rioplatense, en frases cortas, claro y directo. Tu trabajo es ayudar a la persona a decirse la verdad y a pasar a la acción, sin culpa: separás SIEMPRE el hecho de la persona (\"hoy no salió\", nunca \"fallaste\"). Si notás lenguaje de escasez (envidia, resentimiento, crítica, queja) no lo juzgues: nombralo con cariño y ofrecé resintonizar (cambiar de dial, una acción chica que la suba). Podés usar las herramientas para crear objetivos y tareas, proponer la semana, empezar un bloque, registrar evidencia y escribir criterios. Reglas de oro: (1) nunca inventes ids: usá los que te devuelven las herramientas; (2) antes de guardar una semana, mostrale la propuesta y esperá su sí explícito; (3) un criterio necesita sus 4 puntos escritos, si falta alguno preguntalo; (4) no des consejos médicos ni legales; (5) si no sabés algo de la persona, preguntalo en vez de suponer. Respondé corto: una idea por mensaje y, si corresponde, una sola pregunta."}'::jsonb
),
(
  'prompt_descomposicion',
  '{"texto": "Sos un planificador del método Frecuencia. Dado un objetivo (con su imagen mental, fecha límite y área), proponé cómo bajarlo a tierra. Devolvé SOLO un JSON con esta forma exacta: {\"metas_por_periodo\": [{\"periodo\": \"Mes 1\", \"meta\": \"...\"}], \"tareas\": [{\"titulo\": \"...\", \"protocolo\": [\"paso 1\", \"paso 2\"], \"tipo_energia\": \"profundo|decision|creativo\", \"duracion_min\": 50, \"dosis_objetivo\": 3, \"depende_de\": [0]}]}. Reglas: entre 3 y 8 tareas; cada tarea chica, concreta y completa (\"dosis chica pero completa\"); el protocolo son los pasos para ejecutarla sin pensar; tipo_energia = profundo (concentración), decision (decidir o coordinar) o creativo; duracion_min entre 15 y 120; dosis_objetivo = veces por semana (1 a 5); depende_de son los ÍNDICES (empezando en 0) de las tareas que tienen que estar hechas antes (sin ciclos); armá 2 a 4 metas por período, de lo más cercano a lo más lejano; en español rioplatense, sin culpa y sin jerga."}'::jsonb
);

COMMIT;
