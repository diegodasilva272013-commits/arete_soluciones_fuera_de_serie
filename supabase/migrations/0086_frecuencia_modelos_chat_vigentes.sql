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

UPDATE public.frecuencia_knowledge_blocks
SET valor = jsonb_set(valor, '{chat}', '[
  {"id": "nvidia/nemotron-3-super-120b-a12b", "nombre": "Nemotron 3 Super 120B", "licencia": "NVIDIA API Catalog", "por_defecto": true},
  {"id": "deepseek-ai/deepseek-v4.1-flash", "nombre": "DeepSeek V4.1 Flash", "licencia": "NVIDIA API Catalog"},
  {"id": "openai/gpt-oss-20b", "nombre": "GPT-OSS 20B (más rápido)", "licencia": "NVIDIA API Catalog"}
]'::jsonb)
WHERE clave = 'modelos_ia';
