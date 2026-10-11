/**
 * Frecuencia — lenguaje de escasez (7.6).
 *
 * Detecta, en un texto libre, las 4 energías de escasez (envidia,
 * resentimiento, crítica, queja) a partir de una lista de palabras y
 * frases que vive en frecuencia_knowledge_blocks['palabras_escasez'] (NUNCA
 * en el código). Función pura. No juzga: solo permite ofrecer "cambiar de
 * dial". Sin acentos ni mayúsculas; coincide por palabra entera, o por
 * prefijo si la entrada termina en "*".
 */

export type PalabrasEscasez = Record<string, string[]>;

function normalizar(t: string): string {
  return t
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9ñ\s*]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Devuelve las claves de energía detectadas, en el orden en que vienen en `palabras`. */
export function detectarEscasez(texto: string, palabras: PalabrasEscasez | null | undefined): string[] {
  if (!palabras || !texto.trim()) return [];
  const t = ` ${normalizar(texto)} `;
  const encontradas: string[] = [];
  for (const [energia, lista] of Object.entries(palabras)) {
    if (!Array.isArray(lista)) continue;
    const hay = lista.some((p) => {
      if (typeof p !== 'string' || !p.trim()) return false;
      const n = normalizar(p);
      if (!n) return false;
      return n.endsWith('*') ? t.includes(` ${n.slice(0, -1)}`) : t.includes(` ${n} `);
    });
    if (hay) encontradas.push(energia);
  }
  return encontradas;
}
