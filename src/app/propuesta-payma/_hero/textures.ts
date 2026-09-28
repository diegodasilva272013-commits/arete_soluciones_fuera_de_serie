import * as THREE from 'three';

// Texturas 100% procedurales generadas en <canvas>, sin ningún archivo
// externo (punto 4.3 de la orden). Cada función devuelve un CanvasTexture
// listo para usar en un material.

function mkCanvas(size = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  return { canvas, ctx: canvas.getContext('2d')! };
}

function finish(canvas: HTMLCanvasElement, repeat: [number, number] = [1, 1]) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(...repeat);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function woodTexture(base = '#8a5a34', dark = '#5c3a20') {
  const { canvas, ctx } = mkCanvas(512);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 40; i++) {
    const y = (i / 40) * 512 + (Math.random() - 0.5) * 6;
    ctx.strokeStyle = dark;
    ctx.globalAlpha = 0.12 + Math.random() * 0.18;
    ctx.lineWidth = 1 + Math.random() * 2;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= 512; x += 32) {
      ctx.lineTo(x, y + Math.sin(x * 0.02 + i) * 4 + (Math.random() - 0.5) * 3);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  return finish(canvas, [2, 2]);
}

export function stoneTexture(base = '#8e8577', dark = '#5f584c') {
  const { canvas, ctx } = mkCanvas(512);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 512, 512);
  const cols = 6, rows = 10;
  const cw = 512 / cols;
  for (let r = 0; r < rows; r++) {
    const offset = (r % 2) * (cw / 2);
    for (let c = -1; c <= cols; c++) {
      const x = c * cw + offset;
      const y = (r / rows) * 512;
      const shade = 0.85 + Math.random() * 0.3;
      ctx.fillStyle = `rgba(${142 * shade | 0},${133 * shade | 0},${119 * shade | 0},1)`;
      ctx.fillRect(x + 2, y + 2, cw - 4, 512 / rows - 4);
    }
  }
  ctx.strokeStyle = dark;
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 3;
  for (let r = 0; r <= rows; r++) { ctx.beginPath(); ctx.moveTo(0, (r / rows) * 512); ctx.lineTo(512, (r / rows) * 512); ctx.stroke(); }
  return finish(canvas, [2, 3]);
}

export function rugTexture(base = '#b5482f', accent = '#e8c27a') {
  const { canvas, ctx } = mkCanvas(512);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 512, 512);
  ctx.strokeStyle = accent;
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = 6;
  ctx.strokeRect(28, 28, 456, 456);
  ctx.lineWidth = 2;
  ctx.strokeRect(56, 56, 400, 400);
  for (let i = 0; i < 12; i++) {
    const t = i / 11;
    ctx.beginPath();
    ctx.arc(256, 256, 40 + t * 170, 0, Math.PI * 2);
    ctx.globalAlpha = 0.12;
    ctx.stroke();
  }
  return finish(canvas, [1, 1]);
}

export function plasterTexture(base = '#e7e0d2') {
  const { canvas, ctx } = mkCanvas(256);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 256, 256);
  const img = ctx.getImageData(0, 0, 256, 256);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 14;
    img.data[i] += n; img.data[i + 1] += n; img.data[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);
  return finish(canvas, [4, 4]);
}

export function grassTexture(base = '#465c33', dark = '#31421f') {
  const { canvas, ctx } = mkCanvas(256);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 256, 256);
  ctx.strokeStyle = dark;
  ctx.globalAlpha = 0.35;
  for (let i = 0; i < 900; i++) {
    const x = Math.random() * 256, y = Math.random() * 256;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (Math.random() - 0.5) * 4, y - 4 - Math.random() * 6);
    ctx.stroke();
  }
  return finish(canvas, [8, 8]);
}
