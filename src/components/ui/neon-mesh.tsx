'use client';

import { useEffect, useRef } from 'react';

interface Point3D {
  x: number; y: number; z: number;
  oldX: number; oldY: number; oldZ: number;
  pinned: boolean;
  baseX: number; baseY: number; baseZ: number;
  projX: number; projY: number; projScale: number;
}

interface Constraint3D {
  p1: Point3D; p2: Point3D; length: number;
}

interface NeonMeshProps {
  className?: string;
}

export function NeonMesh({ className = '' }: NeonMeshProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef   = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas    = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animId: number;
    let width = 0;
    let height = 0;

    const mouse = {
      x: -1000, y: -1000,
      targetAngleX: 0.2, targetAngleY: -0.3,
      angleX: 0.2, angleY: -0.3,
      radius: 180,
    };

    let points: Point3D[] = [];
    let constraints: Constraint3D[] = [];

    function handleResize() {
      const rect = container!.getBoundingClientRect();
      const dpr  = Math.min(window.devicePixelRatio || 1, 2);
      width  = rect.width;
      height = rect.height;
      canvas!.width  = width  * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width  = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.scale(dpr, dpr);
      initMesh();
    }

    function handleMouseMove(e: MouseEvent) {
      const rect = container!.getBoundingClientRect();
      const rx = e.clientX - rect.left;
      const ry = e.clientY - rect.top;
      mouse.x = rx; mouse.y = ry;
      mouse.targetAngleY =  (rx / width  - 0.5) * 2 * 0.45;
      mouse.targetAngleX = -(ry / height - 0.5) * 2 * 0.35 + 0.2;
    }

    function handleMouseLeave() {
      mouse.x = -1000; mouse.y = -1000;
      mouse.targetAngleX = 0.2;
      mouse.targetAngleY = 0;
    }

    function initMesh() {
      points = []; constraints = [];
      const spacing = 44;
      const cols = Math.ceil((width  * 1.1) / spacing) + 1;
      const rows = Math.ceil((height * 1.1) / spacing) + 1;
      const grid: Point3D[][] = [];
      const sx = -(cols * spacing) / 2;
      const sy = -(rows * spacing) / 2;

      for (let j = 0; j < rows; j++) {
        grid[j] = [];
        for (let i = 0; i < cols; i++) {
          const bx = sx + i * spacing;
          const by = sy + j * spacing;
          const isEdge = i === 0 || i === cols - 1 || j === 0 || j === rows - 1;
          const p: Point3D = {
            x: bx, y: by, z: 0,
            oldX: bx, oldY: by, oldZ: 0,
            pinned: isEdge,
            baseX: bx, baseY: by, baseZ: 0,
            projX: 0, projY: 0, projScale: 1,
          };
          points.push(p);
          grid[j][i] = p;
        }
      }

      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          if (i < cols - 1) constraints.push({ p1: grid[j][i], p2: grid[j][i + 1], length: spacing });
          if (j < rows - 1) constraints.push({ p1: grid[j][i], p2: grid[j + 1][i], length: spacing });
        }
      }
    }

    handleResize();
    window.addEventListener('resize', handleResize);
    // Escucha en window para que funcione aunque el container tenga pointer-events:none
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    let time = 0;

    function render() {
      time += 0.025;

      // Suavizado cámara
      mouse.angleX += (mouse.targetAngleX - mouse.angleX) * 0.05;
      mouse.angleY += (mouse.targetAngleY - mouse.angleY) * 0.05;

      const cosX = Math.cos(mouse.angleX), sinX = Math.sin(mouse.angleX);
      const cosY = Math.cos(mouse.angleY), sinY = Math.sin(mouse.angleY);

      // Fondo Areté negro
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, width, height);

      // ── Verlet integration ──
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        if (p.pinned) continue;
        const vx = (p.x - p.oldX) * 0.93;
        const vy = (p.y - p.oldY) * 0.93;
        const vz = (p.z - p.oldZ) * 0.93;
        p.oldX = p.x; p.oldY = p.y; p.oldZ = p.z;
        p.x += vx; p.y += vy; p.z += vz;
        const wave = Math.sin(p.baseX * 0.015 + p.baseY * 0.015 + time) * 18;
        p.x += (p.baseX - p.x) * 0.04;
        p.y += (p.baseY - p.y) * 0.04;
        p.z += (p.baseZ + wave - p.z) * 0.04;
      }

      // ── Proyección 3D ──
      const persp   = 600;
      const centerX = width / 2;
      const centerY = height / 2;

      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        const rx1 = p.x * cosY + p.z * sinY;
        const ry1 = p.y;
        const rz1 = -p.x * sinY + p.z * cosY;
        const ry2 = ry1 * cosX - rz1 * sinX;
        const rz2 = ry1 * sinX + rz1 * cosX + 400;
        const scale = persp / Math.max(1, rz2);
        p.projScale = scale;
        p.projX = centerX + rx1 * scale;
        p.projY = centerY + ry2 * scale;

        // Fuerza magnética del mouse
        if (!p.pinned) {
          const dx = p.projX - mouse.x;
          const dy = p.projY - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius && dist > 0) {
            const force = (1 - dist / mouse.radius) * 22;
            const ang = Math.atan2(dy, dx);
            p.x += (Math.cos(ang) * force) / p.projScale;
            p.y += (Math.sin(ang) * force) / p.projScale;
            p.z -= (force * 1.5) / p.projScale;
          }
        }
      }

      // ── Constraint solver ──
      for (let iter = 0; iter < 4; iter++) {
        for (let i = 0; i < constraints.length; i++) {
          const c = constraints[i];
          const dx = c.p2.x - c.p1.x;
          const dy = c.p2.y - c.p1.y;
          const dz = c.p2.z - c.p1.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
          const delta = (dist - c.length) / (dist || 1);
          if (!c.p1.pinned) { c.p1.x += dx * 0.5 * delta; c.p1.y += dy * 0.5 * delta; c.p1.z += dz * 0.5 * delta; }
          if (!c.p2.pinned) { c.p2.x -= dx * 0.5 * delta; c.p2.y -= dy * 0.5 * delta; c.p2.z -= dz * 0.5 * delta; }
        }
      }

      // ── Render líneas — colores Areté ──
      // Azul base: rgba(47, 123, 246, ...)  Hover: #5C9AFF
      for (let i = 0; i < constraints.length; i++) {
        const c = constraints[i];
        const midX = (c.p1.projX + c.p2.projX) / 2;
        const midY = (c.p1.projY + c.p2.projY) / 2;
        const dx = mouse.x - midX;
        const dy = mouse.y - midY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const isHot = dist < mouse.radius;
        const avgScale = (c.p1.projScale + c.p2.projScale) / 2;

        ctx.strokeStyle = isHot
          ? '#5C9AFF'
          : `rgba(47, 123, 246, ${Math.min(1, Math.max(0.05, 0.16 * avgScale))})`;
        ctx.lineWidth = isHot ? 1.6 * avgScale : 0.65 * avgScale;
        ctx.beginPath();
        ctx.moveTo(c.p1.projX, c.p1.projY);
        ctx.lineTo(c.p2.projX, c.p2.projY);
        ctx.stroke();
      }

      // ── Nodos activos ──
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        const dx = mouse.x - p.projX;
        const dy = mouse.y - p.projY;
        if (Math.sqrt(dx * dx + dy * dy) < 100) {
          ctx.fillStyle = '#5C9AFF';
          ctx.beginPath();
          ctx.arc(p.projX, p.projY, 2.5 * p.projScale, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(render);
    }

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full ${className}`}
      style={{ display: 'block' }}
    >
      <canvas ref={canvasRef} style={{ display: 'block', position: 'absolute', inset: 0 }} />
    </div>
  );
}
