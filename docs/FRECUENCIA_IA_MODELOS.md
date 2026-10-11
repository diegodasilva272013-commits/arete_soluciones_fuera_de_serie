# Frecuencia — modelos de IA: licencias y endpoints (Fase 5, punto 1)

Qué se verificó y qué NO, con honestidad.

| Modelo | Uso | Licencia | Endpoint | Estado |
|---|---|---|---|---|
| FLUX.1 [schnell] | Imágenes | Apache-2.0 (uso comercial permitido) | `https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-schnell` | ⚠️ Licencia confirmada por fuentes secundarias (ver links); endpoint tomado del traspaso. **No se pudo abrir build.nvidia.com ni Hugging Face desde el entorno de trabajo** (sin salida a esos dominios). |
| FLUX.2 [klein] 4B | Imágenes | Apache-2.0 (la variante 4B; la 32B dev NO es comercial gratis) | `https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.2-klein-4b` | ⚠️ Igual que arriba. |
| Qwen-Image | Imágenes | Apache-2.0 según una fuente secundaria, sin confirmar | — | ⛔ Queda afuera: no hay endpoint ni licencia confirmados en NVIDIA. |
| Stable Diffusion 3.5 | Imágenes | No comercial | — | ⛔ Descartado. |
| Llama 3.3 70B Instruct / Llama 3.1 8B Instruct | Chat | Llama Community License (uso comercial con condiciones de la licencia) | `https://integrate.api.nvidia.com/v1` (compatible con OpenAI) | ⚠️ Ids propuestos: confirmá que existen en tu catálogo de build.nvidia.com y leé las condiciones de la licencia de Llama. |

**Antes de producción (Diego):** abrí la ficha de cada modelo en build.nvidia.com ("Model Card" → License) y confirmá lo de esta tabla. Si algo no coincide, se cambia con un UPDATE sobre `frecuencia_knowledge_blocks['modelos_ia']`; el código no toca la lista.

Fuentes consultadas (secundarias):
- https://developer.puter.com/ai/black-forest-labs/flux-schnell/
- https://enterprisedna.co/directories/models/vs/black-forest-labs-flux-1-schnell-vs-black-forest-labs-flux-2-klein-4b
- https://invideo.io/blog/flux-ai-image-generator/
- https://fal.ai/learn/tools/flux-vs-qwen-image

Límites: chat 40 pedidos por minuto por modelo (el código respeta una ventana deslizante por modelo y traduce el 429).
La clave `NVIDIA_API_KEY` va solo en variables de entorno del servidor (Vercel y entorno de la nube); nunca en el cliente ni en el chat.
