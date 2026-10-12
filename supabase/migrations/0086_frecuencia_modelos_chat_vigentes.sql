-- =====================================================================
-- 0086 · Frecuencia — modelos de chat vigentes en NVIDIA.
--
-- Por qué: meta/llama-3.3-70b-instruct y meta/llama-3.1-8b-instruct (los de
-- 0082) salieron de servicio en NVIDIA (410 Gone, fin de vida 2026-08-26) y el
-- agente mostraba "todavía no está conectado". La clave de NVIDIA estaba bien.
--
-- YA APLICADO EN PRODUCCIÓN el 2026-10-11 (verificado: NVIDIA responde 200 con
-- el modelo por defecto y los tres soportan herramientas). Este archivo queda
-- como registro y para reconstruir la base. Es idempotente.
-- =====================================================================

-- Modelos probados el 2026-10-11/12 con la clave real y con un turno de chat
-- completo (prompt del agente + herramientas) en producción. Quedaron afuera:
-- los que dan 404 (ya no existen en el catálogo), nemotron-3-nano-omni y
-- poolside/laguna (503 por falta de capacidad), gemma-4-31b, kimi-k3 y
-- deepseek-v4.1-flash (tardan más de 60 s por turno) e ising-calibration
-- (modelo de calibración, no de conversación).
-- YA APLICADO EN PRODUCCIÓN: no hace falta correrlo.
UPDATE public.frecuencia_knowledge_blocks
SET valor = jsonb_set(valor, '{chat}', '[
  {"id": "nvidia/nemotron-3-super-120b-a12b", "nombre": "Nemotron 3 Super 120B", "licencia": "NVIDIA API Catalog", "por_defecto": true},
  {"id": "nvidia/nemotron-3-ultra-550b-a55b", "nombre": "Nemotron 3 Ultra 550B (el más potente)", "licencia": "NVIDIA API Catalog"},
  {"id": "z-ai/glm-5.3", "nombre": "GLM 5.3", "licencia": "NVIDIA API Catalog"},
  {"id": "z-ai/glm-5.3-flash", "nombre": "GLM 5.3 Flash", "licencia": "NVIDIA API Catalog"},
  {"id": "openai/gpt-oss-20b", "nombre": "GPT-OSS 20B", "licencia": "NVIDIA API Catalog"},
  {"id": "nvidia/nemotron-3.5-lightning-30b-a3b", "nombre": "Nemotron 3.5 Lightning 30B", "licencia": "NVIDIA API Catalog"}
]'::jsonb)
WHERE clave = 'modelos_ia';
