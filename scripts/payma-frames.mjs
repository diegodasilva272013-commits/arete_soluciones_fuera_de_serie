#!/usr/bin/env node
// Genera la secuencia de cuadros del hero de /propuesta-payma a partir de
// los clips listados en assets-src/payma/sequence.json.
//
// Usa ffmpeg del sistema; si no está instalado, usa los paquetes
// ffmpeg-static y ffprobe-static (npm i -D ffmpeg-static ffprobe-static).
// Uso: node scripts/payma-frames.mjs
//
// Todo lo específico (clips, recortes, cantidad de cuadros, tamaños) vive
// en sequence.json: este script no tiene datos del recorrido adentro.

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

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, 'assets-src', 'payma');
const cfg = JSON.parse(fs.readFileSync(path.join(SRC_DIR, 'sequence.json'), 'utf-8'));
const OUT_DIR = path.join(ROOT, cfg.salida);
const FPS_IN = 24; // fps de trabajo para recortes y fundidos

const clips = cfg.clips.map((c) => ({ ...c, dur: c.fin - c.inicio }));
const fadeIn = (c) => c.fundido_entrada_s ?? cfg.fundido_s;
const totalDur = clips.reduce((a, c, i) => a + c.dur - (i > 0 ? fadeIn(c) : 0), 0);
const fpsOut = cfg.cuadros_total / totalDur;

function run(args) {
  execFileSync(FFMPEG, ['-v', 'error', '-y', ...args], { stdio: 'inherit' });
}

function buildFilter(width) {
  const parts = [];
  clips.forEach((c, i) => {
    const chain = [
      `trim=start=${c.inicio}:end=${c.fin}`,
      'setpts=PTS-STARTPTS',
      c.invertir ? 'reverse' : null,
      `fps=${FPS_IN}`,
      // Escalado de alta calidad + nitidez suave (los clips de origen pueden
      // venir en baja resolución).
      `scale=${width}:-2:flags=lanczos`,
      'unsharp=5:5:0.6:5:5:0.0',
      'format=yuv420p',
      'setsar=1',
    ].filter(Boolean).join(',');
    parts.push(`[${i}:v]${chain}[c${i}]`);
  });
  let last = 'c0';
  let offset = clips[0].dur;
  for (let i = 1; i < clips.length; i++) {
    const f = fadeIn(clips[i]);
    offset -= f;
    const out = i === clips.length - 1 ? 'joined' : `x${i}`;
    parts.push(`[${last}][c${i}]xfade=transition=fade:duration=${f}:offset=${offset.toFixed(3)}[${out}]`);
    last = out;
    offset += clips[i].dur;
  }
  if (clips.length === 1) parts.push('[c0]null[joined]');
  parts.push(`[joined]fps=${fpsOut.toFixed(5)}[out]`);
  return parts.join(';');
}

const manifest = { count: 0, fps: Number(fpsOut.toFixed(3)), duracion_s: Number(totalDur.toFixed(2)), patron: 'f_%04d.webp', juegos: {} };

for (const juego of cfg.juegos) {
  const dir = path.join(OUT_DIR, juego.nombre);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const inputs = clips.flatMap((c) => ['-i', path.join(SRC_DIR, c.archivo)]);
  run([
    ...inputs,
    '-filter_complex', buildFilter(juego.ancho),
    '-map', '[out]',
    '-frames:v', String(cfg.cuadros_total),
    '-c:v', 'libwebp', '-quality', String(juego.calidad), '-compression_level', '6',
    path.join(dir, 'f_%04d.webp'),
  ]);
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.webp')).sort();
  const bytes = files.reduce((a, f) => a + fs.statSync(path.join(dir, f)).size, 0);
  const probe = execFileSync(FFPROBE, ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', path.join(dir, files[0])]).toString().trim().split(',');
  manifest.count = files.length;
  manifest.juegos[juego.nombre] = { ancho: Number(probe[0]), alto: Number(probe[1]), bytes };
  console.log(`${juego.nombre}: ${files.length} cuadros, ${(bytes / 1024 / 1024).toFixed(1)} MB, ${probe[0]}x${probe[1]}`);
}

fs.writeFileSync(path.join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`manifest: ${manifest.count} cuadros, ${manifest.duracion_s}s de recorrido, ${manifest.fps} fps efectivos`);
