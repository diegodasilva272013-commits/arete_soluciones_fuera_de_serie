'use client';

import { useState } from 'react';

/** Muestra con qué se envían los mails y permite mandar una prueba al propio mail. */
export function ProbarMail({ via, detalle }: { via: string; detalle: string }) {
  const [estado, setEstado] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function probar() {
    setEnviando(true);
    setEstado('');
    try {
      const res = await fetch('/api/admin/temporada-1/probar-mail', { method: 'POST' });
      const d = await res.json();
      setEstado(d.ok ? `✓ Enviado a ${d.to} vía ${d.via}. Revisá tu bandeja (y spam).` : `✗ Falló vía ${d.via}: ${d.error}`);
    } catch {
      setEstado('✗ No se pudo contactar al servidor');
    } finally {
      setEnviando(false);
    }
  }

  const color = via === 'hostinger' ? 'text-emerald-400' : 'text-amber-400';
  return (
    <div className="mb-6 flex flex-col gap-2 rounded-lg border border-white/10 bg-white/[0.03] p-4 md:flex-row md:items-center md:justify-between">
      <div className="text-sm">
        <span className="text-white/50">Envío de mails: </span>
        <span className={color}>{via === 'hostinger' ? '✓ ' : '⚠ '}{detalle}</span>
        {estado && <p className={`mt-1 text-xs ${estado.startsWith('✓') ? 'text-emerald-400' : 'text-red-400'}`}>{estado}</p>}
      </div>
      <button
        onClick={probar}
        disabled={enviando}
        className="rounded-md border border-white/20 px-4 py-2 text-sm text-white hover:border-white/50 disabled:opacity-40"
      >
        {enviando ? 'Enviando…' : 'Enviar mail de prueba a mi correo'}
      </button>
    </div>
  );
}
