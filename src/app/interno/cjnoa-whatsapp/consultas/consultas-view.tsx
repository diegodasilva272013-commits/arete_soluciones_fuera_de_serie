'use client';

import { useEffect, useMemo, useState } from 'react';
import { fetchCJNoaConsultas, type CJNoaConsulta } from './actions';

type Bubble = { who: 'cliente' | 'agente'; texto: string };

function parseTranscripcion(t: string | null): Bubble[] {
  if (!t) return [];
  return t
    .split('\n')
    .map((line) => line.match(/^\[(.+?)\]:\s*(.*)$/))
    .filter((m): m is RegExpMatchArray => !!m && m[2].trim().length > 0)
    .map((m) => {
      const label = m[1].toLowerCase();
      const who: Bubble['who'] = /user|cliente|consultante/.test(label) ? 'cliente' : 'agente';
      return { who, texto: m[2].trim() };
    });
}

/** Fuente de burbujas de una consulta: prioriza el historial en tiempo real
 *  (`mensajes`, los dos lados si la Tool manda `respuesta_agente`), después
 *  la transcripción completa del webhook post-call, y como último recurso
 *  el único mensaje viejo guardado antes de que existiera `mensajes`. */
function bubblesFor(c: CJNoaConsulta): Bubble[] {
  if (c.mensajes?.length > 0) {
    return c.mensajes.map((m) => ({ who: m.from, texto: m.texto }));
  }
  const fromTranscripcion = parseTranscripcion(c.transcripcion);
  if (fromTranscripcion.length > 0) return fromTranscripcion;
  if (c.mensaje) return [{ who: 'cliente', texto: c.mensaje }];
  return [];
}

function initials(name: string | null, telefono: string | null) {
  if (name) {
    const parts = name.trim().split(/\s+/);
    return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?';
  }
  if (telefono) return telefono.slice(-2);
  return '?';
}

function relativeTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return 'ahora';
  if (min < 60) return `hace ${min} min`;
  const hs = Math.floor(min / 60);
  if (hs < 24) return `hace ${hs} h`;
  const days = Math.floor(hs / 24);
  return `hace ${days} d`;
}

export function CJNoaConsultasView({ initial }: { initial: CJNoaConsulta[] }) {
  const [consultas, setConsultas] = useState(initial);
  const [selectedId, setSelectedId] = useState<string | null>(initial[0]?.id ?? null);

  useEffect(() => {
    const interval = setInterval(async () => {
      const fresh = await fetchCJNoaConsultas();
      setConsultas(fresh);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const selected = useMemo(
    () => consultas.find((c) => c.id === selectedId) ?? consultas[0] ?? null,
    [consultas, selectedId]
  );

  const bubbles = useMemo(() => (selected ? bubblesFor(selected) : []), [selected]);

  return (
    <div className="flex h-[calc(100svh-120px)] min-h-[520px] overflow-hidden rounded-lg border border-[#8A8A8A]/20">
      {/* Lista de conversaciones */}
      <aside className="w-[300px] shrink-0 overflow-y-auto border-r border-[#8A8A8A]/20 bg-[#0A0A0A]">
        {consultas.length === 0 && (
          <p className="p-5 text-sm text-[#8A8A8A]">Todavía no llegó ninguna consulta.</p>
        )}
        {consultas.map((c) => {
          const preview = bubblesFor(c).slice(-1)[0]?.texto;
          const active = selected?.id === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className={`flex w-full items-start gap-3 border-b border-[#8A8A8A]/10 px-4 py-3 text-left transition ${
                active ? 'bg-[#2F7BF6]/10' : 'hover:bg-white/[0.03]'
              }`}
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#2F7BF6]/20 text-xs font-semibold text-[#2F7BF6]">
                {initials(c.nombre_consultante, c.telefono)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-sm font-medium text-[#F2EFE9]">
                    {c.nombre_consultante || c.telefono || 'Consulta sin nombre'}
                  </span>
                  <span className="shrink-0 text-[10px] text-[#8A8A8A]">{relativeTime(c.updated_at)}</span>
                </span>
                <span className="mt-0.5 block truncate text-xs text-[#8A8A8A]">
                  {preview || 'Sin mensaje registrado'}
                </span>
                {c.rama_consulta && (
                  <span className="mt-1 inline-block rounded-full bg-[#8A8A8A]/10 px-2 py-0.5 text-[10px] text-[#8A8A8A]">
                    {c.rama_consulta}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </aside>

      {/* Hilo de la conversación */}
      <section className="flex flex-1 flex-col overflow-hidden bg-[#050505]">
        {!selected ? (
          <div className="flex flex-1 items-center justify-center text-sm text-[#8A8A8A]">
            Elegí una consulta para ver el detalle.
          </div>
        ) : (
          <>
            <header className="shrink-0 border-b border-[#8A8A8A]/20 px-5 py-4">
              <h2 className="text-sm font-semibold text-[#F2EFE9]">
                {selected.nombre_consultante || selected.telefono || 'Consulta sin nombre'}
              </h2>
              <p className="mt-0.5 text-xs text-[#8A8A8A]">
                {[selected.telefono, selected.rama_consulta, selected.tipo_tramite_previsional]
                  .filter(Boolean)
                  .join(' · ') || 'Sin datos adicionales'}
              </p>
            </header>

            <div className="flex-1 space-y-3 overflow-y-auto px-5 py-5">
              {bubbles.length > 0 ? (
                bubbles.map((b, i) => (
                  <div key={i} className={`flex ${b.who === 'cliente' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                        b.who === 'cliente'
                          ? 'rounded-br-sm bg-[#2F7BF6] text-white'
                          : 'rounded-bl-sm bg-[#1A1A1A] text-[#F2EFE9]'
                      }`}
                    >
                      {b.texto}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#8A8A8A]">Sin mensajes registrados todavía.</p>
              )}

              {bubbles.length > 0 && !bubbles.some((b) => b.who === 'agente') && (
                <p className="pt-2 text-center text-[11px] text-[#8A8A8A]/70">
                  Solo se ve el lado del cliente: la Tool de ElevenLabs todavía no manda la respuesta
                  del agente (parámetro "respuesta_agente") ni llegó la transcripción completa del
                  webhook post-llamada.
                </p>
              )}
            </div>

            {(selected.resumen || selected.dni_o_cuil || selected.requiere_turno !== null || selected.datos_adicionales) && (
              <footer className="shrink-0 space-y-1 border-t border-[#8A8A8A]/20 bg-[#0A0A0A] px-5 py-3 text-xs text-[#8A8A8A]">
                {selected.resumen && <p><span className="text-[#F2EFE9]/70">Resumen:</span> {selected.resumen}</p>}
                {selected.dni_o_cuil && <p><span className="text-[#F2EFE9]/70">DNI/CUIL:</span> {selected.dni_o_cuil}</p>}
                {selected.requiere_turno !== null && (
                  <p><span className="text-[#F2EFE9]/70">Turno:</span> {selected.requiere_turno ? 'Sí' : 'No'}</p>
                )}
                {selected.datos_adicionales && <p><span className="text-[#F2EFE9]/70">Otros datos:</span> {selected.datos_adicionales}</p>}
              </footer>
            )}
          </>
        )}
      </section>
    </div>
  );
}
