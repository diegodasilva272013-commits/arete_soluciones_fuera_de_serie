/**
 * Contenido de Areté Fuera de Serie · Temporada 1.
 * Fuente única: lo usan la landing, el mail de confirmación y el admin.
 */

export const TEMPORADA_SLUG = 'temporada-1';
export const TEMPORADA_NOMBRE = 'Areté Fuera de Serie · Temporada 1';

/** Primera clase: lunes 5 de octubre, 20 h Argentina (UTC-3). */
export const TEMPORADA_INICIO = '2026-10-05T20:00:00-03:00';

/**
 * Video de presentación de la semana. Subir el archivo a /public y
 * poner acá la ruta (p. ej. '/video_temporada_1.mp4'). Mientras sea
 * null, la sección muestra el póster con el aviso "se publica en estos días".
 */
export const VIDEO_TEMPORADA_SRC: string | null = '/temporada_1_video.mp4';
export const VIDEO_TEMPORADA_POSTER = '/fuera-de-serie-temporada-1.jpg';

export type Episodio = {
  n: number;
  dia: string;
  fecha: string;
  hora: string;
  profes: string[];
  titulo: string;
  bajada: string;
};

export type Semana = {
  n: number;
  nombre: string;
  episodios: Episodio[];
};

export const SEMANAS: Semana[] = [
  {
    n: 1,
    nombre: 'La apertura',
    episodios: [
      { n: 1, dia: 'Lun', fecha: '5 oct',  hora: '20 h', profes: ['Mauro'],   titulo: 'El que no estaba',      bajada: 'Los primeros minutos: conexión antes que preguntas.' },
      { n: 2, dia: 'Mié', fecha: '7 oct',  hora: '20 h', profes: ['Cecilia'], titulo: 'Lo que no se pregunta', bajada: 'Cómo está el negocio del cliente de verdad.' },
      { n: 3, dia: 'Sáb', fecha: '10 oct', hora: '18 h', profes: ['Diego'],   titulo: 'El síntoma',            bajada: '"Quiero vender más" no es el problema.' },
    ],
  },
  {
    n: 2,
    nombre: 'Lo que no se dice',
    episodios: [
      { n: 4, dia: 'Lun', fecha: '12 oct', hora: '20 h', profes: ['Fátima'], titulo: 'Lo que cuesta', bajada: 'Lo que le cuesta a él, no al negocio.' },
      { n: 5, dia: 'Mié', fecha: '14 oct', hora: '20 h', profes: ['Dani'],   titulo: 'El espejo',     bajada: 'Devolverle lo que dijo para que se escuche.' },
      { n: 6, dia: 'Sáb', fecha: '17 oct', hora: '18 h', profes: ['Diego'],  titulo: 'El precio',     bajada: 'La primera vez que se habla de plata.' },
    ],
  },
  {
    n: 3,
    nombre: 'El desenlace',
    episodios: [
      { n: 7, dia: 'Lun', fecha: '19 oct', hora: '20 h', profes: ['Dani'],                       titulo: 'La objeción',         bajada: 'Solo cierra quien llega a la razón real.' },
      { n: 8, dia: 'Mié', fecha: '21 oct', hora: '20 h', profes: ['Mauro', 'Cecilia', 'Fátima'], titulo: 'Del otro lado',       bajada: 'Qué te pasa por dentro en la llamada.' },
      { n: 9, dia: 'Sáb', fecha: '24 oct', hora: '18 h', profes: [],                             titulo: 'Nunca fue el precio', bajada: 'Cierre de temporada.' },
    ],
  },
];

export const EPISODIOS: Episodio[] = SEMANAS.flatMap((s) => s.episodios);

/**
 * Póster oficial de la temporada con el equipo. Guardarlo en
 * public/fuera-de-serie-temporada-1.jpg; si el archivo no está, la
 * sección del equipo se muestra solo con el dock.
 */
export const POSTER_TEMPORADA = '/fuera-de-serie-temporada-1.jpg';

/**
 * Quienes dan las clases (mismo orden que el póster). `foto` es
 * opcional: con una imagen en /public (p. ej. '/equipo/mauro.jpg') el
 * dock la muestra; si no, muestra las iniciales.
 */
export const PROFES: { nombre: string; apellido: string; foto?: string }[] = [
  { nombre: 'Diego',   apellido: 'Da Silva' },
  { nombre: 'Mauro',   apellido: 'Benitez' },
  { nombre: 'Fátima',  apellido: 'Rivera' },
  { nombre: 'Cecilia', apellido: 'Gutierrez' },
  { nombre: 'Daniel',  apellido: 'Peña' },
];

export function profesLabel(profes: string[]): string {
  if (profes.length === 0) return 'Todo el equipo';
  if (profes.length === 1) return profes[0];
  return `${profes.slice(0, -1).join(', ')} y ${profes[profes.length - 1]}`;
}
