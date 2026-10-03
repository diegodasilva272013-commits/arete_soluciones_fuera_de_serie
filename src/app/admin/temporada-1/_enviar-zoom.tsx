'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

/** Envía el link de Zoom a todos los inscriptos pendientes (en lotes hasta terminar). */
export function EnviarZoom({ pendientes, zoomDefault }: { pendientes: number; zoomDefault: string }) {
  const router = useRouter();
  const [zoomUrl, setZoomUrl] = useState(zoomDefault);
  const [estado, setEstado] = useState<string>('');
  const [enviando, setEnviando] = useState(false);

  async function enviar() {
    if (!confirm(`¿Enviar el link de Zoom a ${pendientes} inscriptos?`)) return;
    setEnviando(true);
    let total = 0;
    try {
      for (let vuelta = 0; vuelta < 50; vuelta++) {
        const res = await fetch('/api/admin/temporada-1/enviar-zoom', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ zoomUrl }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'Error al enviar');
        total += data.enviados;
        setEstado(`Enviados: ${total} · Pendientes: ${data.pendientes}`);
        if (data.pendientes === 0 || data.enviados === 0) {
          if (data.fallidos) setEstado(`Enviados: ${total} · ${data.pendientes} no se pudieron enviar (revisá los logs)`);
          break;
        }
      }
    } catch (e) {
      setEstado(e instanceof Error ? e.message : 'Error al enviar');
    } finally {
      setEnviando(false);
      router.refresh();
    }
  }

  return (
    <div className="flex flex-col gap-2 md:items-end">
      <div className="flex gap-2">
        <input
          value={zoomUrl}
          onChange={(e) => setZoomUrl(e.target.value)}
          placeholder="https://us06web.zoom.us/j/…"
          className="w-72 rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30"
        />
        <button
          onClick={enviar}
          disabled={enviando || pendientes === 0 || !zoomUrl.trim()}
          className="rounded-md bg-[#2969D1] px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
        >
          {enviando ? 'Enviando…' : 'Enviar Zoom a pendientes'}
        </button>
      </div>
      {estado && <p className="text-xs text-white/60">{estado}</p>}
    </div>
  );
}
