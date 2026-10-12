/**
 * Voz de Frecuencia con la MISMA clave de NVIDIA que usa el agente (sin otros
 * proveedores): reconocimiento de voz (Parakeet / Whisper) y síntesis (Magpie).
 * Los servicios de voz de NVIDIA hablan gRPC (Riva) contra grpc.nvcf.nvidia.com,
 * por eso acá se arma el cliente a mano con protobufjs + @grpc/grpc-js.
 * SOLO del lado del servidor: la clave nunca llega al navegador ni se loguea.
 */

import * as grpc from '@grpc/grpc-js';
import * as protobuf from 'protobufjs';

export type CodigoErrorVoz = 'sin_clave' | 'proveedor' | 'vacio';

export class ErrorVoz extends Error {
  constructor(public codigo: CodigoErrorVoz, mensaje: string) {
    super(mensaje);
    this.name = 'ErrorVoz';
  }
}

const OBJETIVO = 'grpc.nvcf.nvidia.com:443';

// Funciones públicas del catálogo de NVIDIA (ids verificados contra la API de la cuenta).
export const FUNCIONES = {
  // Orden = el que mejor responde (verificado en producción): el multilingüe primero.
  asr: [
    { nombre: 'parakeet-1.1b-rnnt-multilingual', id: '71203149-d3b7-4460-8231-1be2543a1fca', idiomas: ['es-US'] },
    { nombre: 'whisper-large-v3', id: 'b702f636-f60c-4a3d-a6f4-f3568c13bd7d', idiomas: ['es'] },
    { nombre: 'parakeet-ctc-0.6b-es', id: 'a9eeee8f-b509-4712-b19d-194361fa5f31', idiomas: ['es-US'] },
  ],
  tts: { nombre: 'magpie-tts-multilingual', id: '877104f7-e885-42b9-8de8-f6e4c6303969' },
};

const PROTO = `
syntax = "proto3";
package nv;
enum AudioEncoding { ENCODING_UNSPECIFIED = 0; LINEAR_PCM = 1; FLAC = 2; MULAW = 3; OGGOPUS = 4; ALAW = 20; }
message RecognitionConfig {
  AudioEncoding encoding = 1; int32 sample_rate_hertz = 2; string language_code = 3; int32 max_alternatives = 4;
  bool profanity_filter = 5; int32 audio_channel_count = 7; bool enable_word_time_offsets = 8;
  bool enable_automatic_punctuation = 11; bool verbatim_transcripts = 14;
}
message RecognizeRequest { RecognitionConfig config = 1; bytes audio = 2; }
message SpeechRecognitionAlternative { string transcript = 1; float confidence = 2; }
message SpeechRecognitionResult { repeated SpeechRecognitionAlternative alternatives = 1; int32 channel_tag = 2; }
message RecognizeResponse { repeated SpeechRecognitionResult results = 1; }
message SynthesizeSpeechRequest { string text = 1; string language_code = 2; AudioEncoding encoding = 3; int32 sample_rate_hz = 4; string voice_name = 5; }
message SynthesizeSpeechResponse { bytes audio = 1; }
message Vacio {}
message ModeloConfig { string model_name = 1; map<string, string> parameters = 2; }
message ConfigSintesis { repeated ModeloConfig model_config = 1; }
`;

// keepCase: los campos del protocolo de NVIDIA van en snake_case tal cual.
const root = protobuf.parse(PROTO, { keepCase: true }).root;
const T = (n: string) => root.lookupType(`nv.${n}`);

function clave(): string {
  const k = (process.env.NVIDIA_API_KEY || process.env.nvidia_key || process.env.NVIDIA_KEY || '').trim();
  if (!k) throw new ErrorVoz('sin_clave', 'Falta la clave de NVIDIA en el entorno.');
  return k;
}

function unario<Rq extends Record<string, unknown>, Rs>(funcionId: string, ruta: string, tipoReq: string, tipoRes: string, pedido: Rq, ms: number): Promise<Rs> {
  const req = T(tipoReq);
  const res = T(tipoRes);
  const cliente = new grpc.Client(OBJETIVO, grpc.credentials.createSsl());
  const md = new grpc.Metadata();
  md.set('function-id', funcionId);
  md.set('authorization', `Bearer ${clave()}`);
  return new Promise<Rs>((resolve, reject) => {
    cliente.makeUnaryRequest(
      ruta,
      (v: Rq) => Buffer.from(req.encode(req.fromObject(v)).finish()),
      (b: Buffer) => res.toObject(res.decode(b), { defaults: true, longs: String }) as unknown as Rs,
      pedido,
      md,
      { deadline: Date.now() + ms },
      (err, r) => {
        cliente.close();
        if (err) reject(err);
        else resolve(r as Rs);
      },
    );
  });
}

/** WAV mono 16 bits a partir de PCM crudo. */
export function pcmAWav(pcm: Buffer, frecuencia: number): Buffer {
  const h = Buffer.alloc(44);
  h.write('RIFF', 0);
  h.writeUInt32LE(36 + pcm.length, 4);
  h.write('WAVEfmt ', 8);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);
  h.writeUInt16LE(1, 22);
  h.writeUInt32LE(frecuencia, 24);
  h.writeUInt32LE(frecuencia * 2, 28);
  h.writeUInt16LE(2, 32);
  h.writeUInt16LE(16, 34);
  h.write('data', 36);
  h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
}

/** Frecuencia de muestreo de un WAV (bytes 24-27), o 16000 si no parece un WAV. */
export function frecuenciaWav(wav: Buffer): number {
  return wav.length > 44 && wav.toString('ascii', 0, 4) === 'RIFF' ? wav.readUInt32LE(24) : 16000;
}

type RespReconocer = { results: { alternatives: { transcript: string }[] }[] };

/** Audio WAV (mono, 16 bits) → texto en español. Prueba las funciones de NVIDIA hasta que una responda. */
export async function transcribir(wav: Buffer): Promise<{ texto: string; modelo: string; idioma: string }> {
  clave();
  const frecuencia = frecuenciaWav(wav);
  const fallos: string[] = [];
  for (const f of FUNCIONES.asr) {
    for (const idioma of f.idiomas) {
      try {
        const r = await unario<Record<string, unknown>, RespReconocer>(
          f.id,
          '/nvidia.riva.asr.RivaSpeechRecognition/Recognize',
          'RecognizeRequest',
          'RecognizeResponse',
          { config: { encoding: 1, sample_rate_hertz: frecuencia, language_code: idioma, max_alternatives: 1, enable_automatic_punctuation: true, audio_channel_count: 1 }, audio: wav },
          20_000,
        );
        const texto = r.results.map((x) => x.alternatives[0]?.transcript ?? '').join(' ').replace(/\s+/g, ' ').trim();
        return { texto, modelo: f.nombre, idioma };
      } catch (e) {
        const detalle = `${f.nombre}/${idioma}: ${(e as Error).message}`.slice(0, 160);
        fallos.push(detalle);
        // Si el idioma no corresponde se sigue con el próximo; si es un error de cuenta/clave, no tiene sentido seguir.
        if (/UNAUTHENTICATED|PERMISSION_DENIED/.test(detalle)) throw new ErrorVoz('proveedor', detalle);
      }
    }
  }
  console.error('[voz] ninguna función de reconocimiento respondió', fallos);
  throw new ErrorVoz('proveedor', fallos.join(' | ') || 'Sin respuesta del reconocimiento de voz.');
}

/** Voces disponibles de Magpie (para elegir una en español). */
export async function configCruda(): Promise<unknown> {
  return unario<Record<string, unknown>, unknown>(FUNCIONES.tts.id, '/nvidia.riva.tts.RivaSpeechSynthesis/GetRivaSynthesisConfig', 'Vacio', 'ConfigSintesis', {}, 15_000);
}

export async function vocesDisponibles(): Promise<string[]> {
  const r = await unario<Record<string, unknown>, { model_config: { parameters: Record<string, string> }[] }>(
    FUNCIONES.tts.id,
    '/nvidia.riva.tts.RivaSpeechSynthesis/GetRivaSynthesisConfig',
    'Vacio',
    'ConfigSintesis',
    {},
    15_000,
  );
  const voces = new Set<string>();
  for (const c of r.model_config) {
    const p = c.parameters ?? {};
    for (const v of String(p.voices ?? p.voice_name ?? '').split(',')) if (v.trim()) voces.add(v.trim());
  }
  return [...voces];
}

const FRECUENCIA_TTS = 22050;
let vozElegida: string | null = null;

/** Texto → audio WAV con una voz en español. */
export async function sintetizar(texto: string): Promise<Buffer> {
  const input = texto.trim().slice(0, 1500);
  if (!input) throw new ErrorVoz('vacio', 'No hay texto para leer.');
  clave();
  if (!vozElegida) {
    try {
      const todas = await vocesDisponibles();
      // Preferencia: una voz de español; primero la que mejor suene en rioplatense (masculina o femenina, da igual).
      vozElegida = todas.find((v) => /ES-US\.Diego/i.test(v)) ?? todas.find((v) => /ES-US\.Isabela/i.test(v)) ?? todas.find((v) => /\.ES-US\./i.test(v)) ?? todas.find((v) => /\.ES\./i.test(v)) ?? null;
    } catch (e) {
      console.error('[voz] no se pudo listar las voces', (e as Error).message);
    }
  }
  try {
    const r = await unario<Record<string, unknown>, { audio: Buffer }>(
      FUNCIONES.tts.id,
      '/nvidia.riva.tts.RivaSpeechSynthesis/Synthesize',
      'SynthesizeSpeechRequest',
      'SynthesizeSpeechResponse',
      { text: input, language_code: 'es-US', encoding: 1, sample_rate_hz: FRECUENCIA_TTS, ...(vozElegida ? { voice_name: vozElegida } : {}) },
      30_000,
    );
    if (!r.audio?.length) throw new ErrorVoz('proveedor', 'La síntesis devolvió audio vacío.');
    return pcmAWav(Buffer.from(r.audio), FRECUENCIA_TTS);
  } catch (e) {
    if (e instanceof ErrorVoz) throw e;
    console.error('[voz] síntesis falló', (e as Error).message.slice(0, 200));
    throw new ErrorVoz('proveedor', 'No se pudo generar la voz.');
  }
}

/** Tope simple por persona (mejor esfuerzo por instancia): evita que un bucle gaste cuota. */
const ventanas = new Map<string, number[]>();
export function reservarVoz(userId: string, tipo: string, maxPorMinuto: number, ahora: number = Date.now()): boolean {
  const k = `${tipo}:${userId}`;
  const recientes = (ventanas.get(k) ?? []).filter((t) => ahora - t < 60_000);
  if (recientes.length >= maxPorMinuto) {
    ventanas.set(k, recientes);
    return false;
  }
  recientes.push(ahora);
  ventanas.set(k, recientes);
  return true;
}
