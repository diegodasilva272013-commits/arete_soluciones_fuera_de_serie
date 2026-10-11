#!/usr/bin/env node
// Genera la secuencia de cuadros del hero de una propuesta con portada por
// scroll, a partir de UN video. Reutilizable (el de Payma tiene su propio
// script, payma-frames.mjs, que arma el recorrido a partir de varios clips).
//
// Uso:
//   node scripts/frames.mjs --input assets-src/bombas/hero.mp4 \
//     --slug propuesta-bombas-de-agua --start 0.6 --end 8.6 --fps 24
//
// Salida: public/<slug>/frames/{desktop,mobile}/f_0001.webp... y
// public/<slug>/frames/manifest.json (mismo formato que el de Payma).
// Opcionales: --desktop-ancho 1280 --mobile-ancho 720 --desktop-calidad 70
// --mobile-calidad 62 --tope-desktop-mb 12 --tope-mobile-mb 5.
// Si un juego supera su tope, baja la calidad de a 4 puntos hasta que entre.

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
function bin(name) {
  try { execFileSync(name, ['-version'], { stdio: 'ignore' }); return name; } catch { /* no está en el sistema */ }
  if (name === 'ffmpeg') return require('ffmpeg-static');
  return require('ffprobe-static').path;
}
const FFMPEG = bin('ffmpeg');
const FFPROBE = bin('ffprobe');

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, arr) => (a.startsWith('--') ? [...acc, [a.slice(2), arr[i + 1]]] : acc), []),
);
for (const req of ['input', 'slug', 'start', 'end', 'fps']) {
  if (!args[req]) { console.error(`Falta --${req}`); process.exit(1); }
}

const ROOT = process.cwd();
const input = path.resolve(ROOT, args.input);
const start = Number(args.start);
const end = Number(args.end);
const fps = Number(args.fps);
const outDir = path.join(ROOT, 'public', args.slug, 'frames');

const anchoOrigen = Number(execFileSync(FFPROBE, ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width', '-of', 'csv=p=0', input]).toString().trim());

const juegos = [
  { nombre: 'desktop', ancho: Math.min(Number(args['desktop-ancho'] ?? 1280), anchoOrigen), calidad: Number(args['desktop-calidad'] ?? 70), topeMb: Number(args['tope-desktop-mb'] ?? 12) },
  { nombre: 'mobile', ancho: Math.min(Number(args['mobile-ancho'] ?? 720), anchoOrigen), calidad: Number(args['mobile-calidad'] ?? 62), topeMb: Number(args['tope-mobile-mb'] ?? 5) },
];

function generar(juego, calidad) {
  const dir = path.join(outDir, juego.nombre);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  execFileSync(FFMPEG, [
    '-v', 'error', '-y', '-i', input,
    '-vf', `trim=start=${start}:end=${end},setpts=PTS-STARTPTS,fps=${fps},scale=${juego.ancho}:-2:flags=lanczos`,
    '-c:v', 'libwebp', '-quality', String(calidad), '-compression_level', '6',
    path.join(dir, 'f_%04d.webp'),
  ], { stdio: 'inherit' });
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.webp')).sort();
  const bytes = files.reduce((a, f) => a + fs.statSync(path.join(dir, f)).size, 0);
  return { dir, files, bytes };
}

const manifest = { count: 0, fps, duracion_s: Number((end - start).toFixed(2)), patron: 'f_%04d.webp', juegos: {} };

for (const juego of juegos) {
  let calidad = juego.calidad;
  let r = generar(juego, calidad);
  while (r.bytes > juego.topeMb * 1024 * 1024 && calidad > 10) {
    console.log(`${juego.nombre}: ${(r.bytes / 1024 / 1024).toFixed(1)} MB supera el tope de ${juego.topeMb} MB con calidad ${calidad}; bajo 4 puntos`);
    calidad -= 4;
    r = generar(juego, calidad);
  }
  const probe = execFileSync(FFPROBE, ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', path.join(r.dir, r.files[0])]).toString().trim().split(',');
  manifest.count = r.files.length;
  manifest.juegos[juego.nombre] = { ancho: Number(probe[0]), alto: Number(probe[1]), bytes: r.bytes };
  console.log(`${juego.nombre}: ${r.files.length} cuadros, ${(r.bytes / 1024 / 1024).toFixed(2)} MB, ${probe[0]}x${probe[1]}, calidad ${calidad}`);
}

fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`manifest: ${manifest.count} cuadros, ${manifest.duracion_s}s, ${fps} fps`);
