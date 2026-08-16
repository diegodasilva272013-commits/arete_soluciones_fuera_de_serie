import OpenAI from 'openai';

const DEFAULT_CONTEXT = `
Eres un agente de ventas experto especializado en prospección B2B.
Los mensajes deben ser cortos, directos, personalizados y con un gancho real basado en el perfil del prospecto.
El objetivo final es llevar al prospecto a una conversación de 20-30 minutos.
Los mensajes deben sonar naturales — como una persona real, no un vendedor genérico.
Ir al pain point del prospecto antes de mencionar cualquier solución.
`;

function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY no configurada');
  return new OpenAI({ apiKey });
}

// ─── Agent 1: Extraer perfil via web search ───────────────────────────────────
async function extractProfile(
  openai: OpenAI,
  profileUrl: string,
  profileText: string,
  sourceType: 'linkedin' | 'instagram' = 'linkedin'
): Promise<string> {
  if (profileText && profileText.trim().length > 50) {
    const r = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{
        role: 'user',
        content: `Organizá esta información del perfil ${sourceType} (${profileUrl}) en español:\n\n${profileText}`,
      }],
    });
    return r.choices[0].message.content || '';
  }

  if (sourceType === 'instagram') {
    const handle = profileUrl
      .replace(/https?:\/\/(www\.)?instagram\.com\/?/, '')
      .replace(/\//g, '')
      .replace('@', '');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r = await (openai as any).responses.create({
      model: 'gpt-4o',
      tools: [{ type: 'web_search_preview' }],
      input: `Buscá información sobre esta persona o marca de Instagram: @${handle} (${profileUrl}).
Necesito: nombre real, a qué se dedica, empresa o negocio, cargo, ubicación, seguidores aprox., temática de contenido, logros relevantes.
Buscá en Google, sitios de noticias, su web. Organizá todo en español.`,
    });
    return r.output_text || '';
  }

  const username = profileUrl.split('/in/')[1]?.replace(/\//g, '') || profileUrl;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = await (openai as any).responses.create({
    model: 'gpt-4o',
    tools: [{ type: 'web_search_preview' }],
    input: `Buscá información sobre esta persona de LinkedIn: ${profileUrl}
Buscá su nombre, empresa actual, cargo, trayectoria profesional y cualquier información pública sobre "${username}".
Podés buscar en Google, sitios de noticias, página de su empresa, etc.
Organizá todo lo que encuentres en español.`,
  });
  return r.output_text || '';
}

// ─── Agent 2: Perfil psicológico DISC ────────────────────────────────────────
async function buildPsychologicalProfile(
  openai: OpenAI,
  profileData: string,
  ctx: string
): Promise<string> {
  const r = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `${ctx}\n\nEres un psicólogo experto en ventas B2B. Analizás perfiles y construís perfiles psicológicos profundos.`,
      },
      {
        role: 'user',
        content: `Analizá este perfil y construí un perfil psicológico completo:

${profileData}

Devolvé un JSON con esta estructura exacta:
{
  "disc_type": "D/I/S/C o combinación (ej: D-I)",
  "disc_description": "descripción del tipo en 2 líneas",
  "communication_style": "cómo habla esta persona, qué palabras usa, cómo se expresa",
  "motivations": ["motivación 1", "motivación 2", "motivación 3"],
  "fears": ["miedo 1", "miedo 2"],
  "key_words": ["palabra clave 1", "palabra que usa", "término que repite"],
  "how_to_approach": "cómo abordar a esta persona específicamente",
  "what_to_avoid": "qué NO decirle o hacer",
  "psychological_profile": "párrafo completo del perfil psicológico"
}`,
      },
    ],
    response_format: { type: 'json_object' },
  });
  return r.choices[0].message.content || '{}';
}

// ─── Agent 3: Estrategia de venta ────────────────────────────────────────────
async function buildSalesStrategy(
  openai: OpenAI,
  profileData: string,
  psychProfile: string,
  ctx: string
): Promise<string> {
  const r = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `${ctx}\n\nEres el mejor estratega de ventas B2B. Tu especialidad es encontrar el ángulo perfecto para conectar una solución con el pain point específico de cada prospecto.`,
      },
      {
        role: 'user',
        content: `Basándote en este perfil y análisis psicológico, construí una estrategia de venta:

PERFIL:
${profileData}

PERFIL PSICOLÓGICO:
${psychProfile}

Devolvé un JSON:
{
  "company_analysis": "análisis de la empresa: sector, tamaño estimado, procesos que probablemente tiene",
  "pain_points": ["pain point principal", "pain point 2", "pain point 3"],
  "sales_angle": "el ángulo de venta principal para esta persona específica",
  "hook": "el gancho de apertura más poderoso en 1 línea",
  "value_proposition": "propuesta de valor personalizada en 2-3 líneas",
  "objections": ["objeción probable 1 y cómo manejarla", "objeción 2 y respuesta"]
}`,
      },
    ],
    response_format: { type: 'json_object' },
  });
  return r.choices[0].message.content || '{}';
}

// ─── Agent 4: Generador de mensajes ──────────────────────────────────────────
async function generateMessages(
  openai: OpenAI,
  profileData: string,
  psychProfile: string,
  salesStrategy: string,
  prospectName: string,
  sourceType: 'linkedin' | 'instagram',
  ctx: string
): Promise<string> {
  const isInstagram = sourceType === 'instagram';
  const channel = isInstagram ? 'Instagram DM' : 'LinkedIn';
  const charLimit = isInstagram
    ? '200 caracteres máximo (DM casual pero profesional)'
    : '300 caracteres máximo';
  const toneNote = isInstagram
    ? 'Tono: casual, cercano. Mencioná algo de su contenido reciente.'
    : 'Tono: profesional pero humano. Mencioná algo de su empresa o rol.';

  const r = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `${ctx}\n\nEres el mejor copywriter de mensajes de prospección en ${channel} en español latinoamericano.
Escribís como una persona real, no como un vendedor genérico.

REGLAS para el mensaje inicial:
1. Mencioná algo MUY ESPECÍFICO del perfil de la persona
2. Conectá ese dato con un problema concreto que probablemente tiene
3. CTA simple: preguntar si le interesa o proponer 15 min
4. ${charLimit}
5. NO empezar con "Hola [nombre]," genérico — arrancá con el hook
6. ${toneNote}

Para los seguimientos: cada uno debe tener un ángulo nuevo, nunca repetir lo mismo.`,
      },
      {
        role: 'user',
        content: `Generá una secuencia de mensajes para ${channel} para ${prospectName}.

PERFIL:
${profileData}

ANÁLISIS PSICOLÓGICO:
${psychProfile}

ESTRATEGIA DE VENTA:
${salesStrategy}

Generá un JSON:
{
  "mensaje_inicial": "mensaje que menciona algo específico + pain point + CTA (máx 300 chars)",
  "fase_contacto": {
    "seguimiento_1_sin_respuesta": "diferente ángulo, caso de uso o resultado concreto (máx 200 chars)",
    "seguimiento_2_con_respuesta": "si contestó positivamente: avanzar hacia agendar la llamada"
  },
  "fase_venta": {
    "seguimiento_3_sin_respuesta": "aportar valor real: dato, insight o pregunta que les haga pensar (máx 250 chars)",
    "seguimiento_4_sin_respuesta": "caso de uso específico para su industria/rol",
    "seguimiento_5_con_respuesta": "si contestó: proponer fecha y hora concreta para llamada de 20 min"
  },
  "fase_cierre": {
    "seguimiento_6_breakup": "último mensaje breakup, cierra el ciclo con elegancia y sin presión",
    "seguimiento_6_agendar": "si mostró interés, mensaje directo para agendar la llamada"
  },
  "notas_clave": "tips específicos para hablar con esta persona"
}`,
      },
    ],
    response_format: { type: 'json_object' },
  });
  return r.choices[0].message.content || '{}';
}

// ─── Agent 5: Refinador ───────────────────────────────────────────────────────
async function refineMessages(
  openai: OpenAI,
  messages: string,
  psychProfile: string,
  prospectName: string,
  ctx: string
): Promise<string> {
  const r = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `${ctx}\n\nEres un revisor experto de mensajes de ventas. Mejorás mensajes para que sean más efectivos, naturales y personalizados.`,
      },
      {
        role: 'user',
        content: `Revisá y mejorá estos mensajes para ${prospectName}.

MENSAJES ACTUALES:
${messages}

PERFIL PSICOLÓGICO (para validar tono):
${psychProfile}

Criterios:
1. ¿El inicial menciona algo ESPECÍFICO de la empresa o rol? Si no, agregarlo.
2. ¿Engancha en las primeras 5 palabras?
3. ¿Usa el vocabulario del prospecto?
4. ¿Es muy largo? Reducir si pasa de 300 chars el inicial.
5. ¿Suena a spam genérico? Reescribir para que sea humano.
6. ¿Hay CTA claro en cada mensaje?
7. ¿El breakup es elegante y deja la puerta abierta?

Devolvé el JSON mejorado con la misma estructura. Si algo está bien, dejarlo igual.`,
      },
    ],
    response_format: { type: 'json_object' },
  });
  return r.choices[0].message.content || messages;
}

// ─── Tipos exportados ─────────────────────────────────────────────────────────
export type ProspectAnalysisResult = {
  rawProfileData: string;
  psychologicalProfile: {
    disc_type: string;
    disc_description: string;
    communication_style: string;
    motivations: string[];
    fears: string[];
    key_words: string[];
    how_to_approach: string;
    what_to_avoid: string;
    psychological_profile: string;
  };
  salesStrategy: {
    company_analysis: string;
    pain_points: string[];
    sales_angle: string;
    hook: string;
    value_proposition: string;
    objections: string[];
  };
  messages: {
    mensaje_inicial: string;
    fase_contacto: {
      seguimiento_1_sin_respuesta: string;
      seguimiento_2_con_respuesta: string;
    };
    fase_venta: {
      seguimiento_3_sin_respuesta: string;
      seguimiento_4_sin_respuesta: string;
      seguimiento_5_con_respuesta: string;
    };
    fase_cierre: {
      seguimiento_6_breakup: string;
      seguimiento_6_agendar: string;
    };
    notas_clave: string;
  };
  prospectInfo: {
    full_name: string;
    headline: string;
    company: string;
    location: string;
  };
};

// ─── Pipeline principal ───────────────────────────────────────────────────────
export async function runProspectAnalysisPipeline(
  profileUrl: string,
  profileText: string,
  sourceType: 'linkedin' | 'instagram' = 'linkedin',
  language = 'es'
): Promise<ProspectAnalysisResult> {
  const openai = getOpenAI();
  const langNames: Record<string, string> = {
    es: 'español latinoamericano',
    en: 'English',
    pt: 'português brasileiro',
  };
  const langInstruction =
    language !== 'es'
      ? `\n\nIMPORTANTE: Generá todos los mensajes de prospección en ${langNames[language] || language}. El análisis puede estar en español.`
      : '';
  const ctx = DEFAULT_CONTEXT + langInstruction;

  const rawProfileData = await extractProfile(openai, profileUrl, profileText, sourceType);
  const psychProfileRaw = await buildPsychologicalProfile(openai, rawProfileData, ctx);
  const salesStrategyRaw = await buildSalesStrategy(openai, rawProfileData, psychProfileRaw, ctx);

  let prospectName = 'el prospecto';
  try {
    const nameMatch = rawProfileData.match(/nombre[:\s]+([^\n]+)/i);
    if (nameMatch) prospectName = nameMatch[1].trim().split(' ')[0];
  } catch { /* ignore */ }

  const messagesRaw = await generateMessages(
    openai, rawProfileData, psychProfileRaw, salesStrategyRaw,
    prospectName, sourceType, ctx
  );
  const refinedMessages = await refineMessages(openai, messagesRaw, psychProfileRaw, prospectName, ctx);

  // Extraer datos del prospecto
  let prospectInfo = { full_name: '', headline: '', company: '', location: '' };
  try {
    const infoR = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'user',
        content: `Del siguiente perfil, extraé solo estos datos en JSON:
{"full_name": "...", "headline": "...", "company": "...", "location": "..."}

PERFIL:
${rawProfileData.substring(0, 2000)}`,
      }],
      response_format: { type: 'json_object' },
    });
    prospectInfo = JSON.parse(infoR.choices[0].message.content || '{}');
  } catch { /* ignore */ }

  return {
    rawProfileData,
    psychologicalProfile: JSON.parse(psychProfileRaw),
    salesStrategy: JSON.parse(salesStrategyRaw),
    messages: JSON.parse(refinedMessages),
    prospectInfo,
  };
}

// ─── Regenerar solo mensajes ──────────────────────────────────────────────────
export async function regenerateMessagesOnly(
  rawProfileData: string,
  psychProfileRaw: string,
  salesStrategyRaw: string,
  prospectName: string,
  sourceType: 'linkedin' | 'instagram' = 'linkedin'
) {
  const openai = getOpenAI();
  const messagesRaw = await generateMessages(
    openai, rawProfileData, psychProfileRaw, salesStrategyRaw,
    prospectName, sourceType, DEFAULT_CONTEXT
  );
  const refined = await refineMessages(openai, messagesRaw, psychProfileRaw, prospectName, DEFAULT_CONTEXT);
  return JSON.parse(refined);
}
