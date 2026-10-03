'use client';

import { useState } from 'react';

/** Manda un mail con un link nuevo (la próxima clase, un aviso) a TODOS los inscriptos. */
export function EnviarAnuncio({ total }: { total: number }) {
  const [url, setUrl] = useState('');
  const [asunto, setAsunto] = useState('Nuevo link · Fuera de Serie T1');
  const [intro, setIntro] = useState('Este es el link para la próxima clase:');
  const [estado, setEstado] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviar() {
    if (!url.trim() || !asunto.trim() || !intro.trim()) {
      setEstado('Completá el link, el asunto y el mensaje.');
      return;
    }
    if (!confirm(`¿Mandar este mail a los ${total} inscriptos?`)) return;
    setEnviando(true);
    setEstado('');
    try {
      const res = await fetch('/api/admin/temporada-1/anuncio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), asunto: asunto.trim(), intro: intro.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Error al enviar');
      setEstado(`Enviado a ${data.enviados} de ${data.total}${data.fallidos ? ` · ${data.fallidos} fallaron` : ''}`);
    } catch (e) {
      setEstado(e instanceof Error ? e.message : 'Error al enviar');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.03] p-4">
      <h3 className="text-sm font-semibold text-white">Mandar un anuncio a TODOS los inscriptos</h3>
      <p className="mt-1 text-xs text-white/40">
        Para avisar el link de la próxima clase (o cualquier otra cosa) — a diferencia de
        "Enviar Zoom a pendientes", esto le llega a todos, ya hayan recibido algo antes o no.
      </p>
      <div className="mt-3 flex flex-col gap-2">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Link (https://…)"
          className="rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30"
        />
        <input
          value={asunto}
          onChange={(e) => setAsunto(e.target.value)}
          placeholder="Asunto del mail"
          className="rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30"
        />
        <textarea
          value={intro}
          onChange={(e) => setIntro(e.target.value)}
          placeholder="Mensaje antes del botón del link"
          rows={2}
          className="rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30"
        />
        <button
          onClick={enviar}
          disabled={enviando || total === 0}
          className="self-start rounded-md bg-[#2969D1] px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
        >
          {enviando ? 'Enviando…' : `Mandar a los ${total} inscriptos`}
        </button>
        {estado && <p className="text-xs text-white/60">{estado}</p>}
      </div>
    </div>
  );
}
