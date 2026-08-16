'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';
import { cn } from '@/lib/utils';

type Prospect = {
  id: string;
  full_name: string;
  headline: string;
  company: string;
  location: string;
  linkedin_url: string | null;
  instagram_url: string | null;
  source_type: string;
  status: string;
  phase: string;
  follow_up_count: number;
  notes: string | null;
  whatsapp_number: string | null;
};

type Analysis = {
  id: string;
  disc_type: string | null;
  disc_description: string | null;
  psychological_profile: string | null;
  communication_style: string | null;
  key_words: string[] | null;
  pain_points: string[] | null;
  sales_angle: string | null;
  company_analysis: string | null;
  raw_linkedin_data: string | null;
};

type Message = {
  id: string;
  follow_up_number: number;
  phase: string;
  message_type: string;
  content: string;
};

type FollowUp = {
  id: string;
  follow_up_number: number;
  phase: string;
  status: string;
  prospect_responded: boolean;
  sent_at: string;
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  nuevo:            { label: 'Nuevo',           color: '#1a6fff', bg: 'rgba(26,111,255,0.12)' },
  activo:           { label: 'Activo',          color: '#22c55e', bg: 'rgba(34,197,94,0.12)'  },
  pausado:          { label: 'Pausado',         color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  llamada_agendada: { label: 'Llamada agend.', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)'  },
  cerrado_ganado:   { label: 'Cerrado ✓',       color: '#22c55e', bg: 'rgba(34,197,94,0.12)'  },
  cerrado_perdido:  { label: 'Cerrado ✗',       color: '#ef4444', bg: 'rgba(239,68,68,0.12)'  },
};

const FOLLOWUP_STEPS = [
  { num: 0, label: 'Mensaje Inicial',      phase: 'contacto', type_resp: 'inicial',       type_no_resp: 'inicial' },
  { num: 1, label: 'Seguimiento 1',        phase: 'contacto', type_resp: 'con_respuesta', type_no_resp: 'sin_respuesta' },
  { num: 2, label: 'Seguimiento 2',        phase: 'venta',    type_resp: 'sin_respuesta', type_no_resp: 'sin_respuesta' },
  { num: 3, label: 'Seguimiento 3',        phase: 'venta',    type_resp: 'sin_respuesta', type_no_resp: 'sin_respuesta' },
  { num: 4, label: 'Seguimiento 4',        phase: 'venta',    type_resp: 'con_respuesta', type_no_resp: 'sin_respuesta' },
  { num: 5, label: 'Seguimiento 5 / Cierre', phase: 'cierre', type_resp: 'con_respuesta', type_no_resp: 'sin_respuesta' },
];

const PHASE_COLORS: Record<string, string> = {
  contacto: '#1a6fff',
  venta: '#f59e0b',
  cierre: '#22c55e',
};

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
      style={{ background: copied ? 'rgba(34,197,94,0.12)' : 'rgba(26,111,255,0.08)', color: copied ? '#22c55e' : '#1a6fff' }}>
      {copied ? '✓ Copiado' : 'Copiar'}
    </button>
  );
}

function WABtn({ text }: { text: string }) {
  return (
    <a href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
      style={{ background: 'rgba(37,211,102,0.12)', color: '#25d366', border: '1px solid rgba(37,211,102,0.2)' }}>
      💬 WhatsApp
    </a>
  );
}

export default function ProspectDetailClient({
  prospect,
  analysis,
  messages,
  followUps,
}: {
  prospect: Prospect;
  analysis: Analysis | null;
  messages: Message[];
  followUps: FollowUp[];
}) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [tab, setTab] = useState<'mensajes' | 'analisis' | 'seguimiento' | 'notas'>('mensajes');
  const [localStatus, setLocalStatus] = useState(prospect.status);
  const [localFollowUps, setLocalFollowUps] = useState(followUps);
  const [localMessages, setLocalMessages] = useState(messages);
  const [notes, setNotes] = useState(prospect.notes || '');
  const [savingNotes, setSavingNotes] = useState(false);
  const [savedNotes, setSavedNotes] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [respondedMap, setRespondedMap] = useState<Record<number, boolean>>({});

  function getMsg(num: number, responded: boolean) {
    const step = FOLLOWUP_STEPS[num];
    if (!step) return null;
    const type = responded ? step.type_resp : step.type_no_resp;
    return localMessages.find(m => m.follow_up_number === num && m.message_type === type)
      || localMessages.find(m => m.follow_up_number === num);
  }

  async function updateStatus(status: string) {
    await supabase.from('prospects').update({ status }).eq('id', prospect.id);
    setLocalStatus(status);
  }

  async function markSent(stepNum: number) {
    const phase = FOLLOWUP_STEPS[stepNum]?.phase || 'contacto';
    const { data } = await supabase.from('prospect_follow_ups').insert({
      prospect_id: prospect.id,
      follow_up_number: stepNum,
      phase,
      status: 'enviado',
      prospect_responded: false,
      sent_at: new Date().toISOString(),
    }).select().single();
    if (data) setLocalFollowUps(prev => [...prev, data]);
    await supabase.from('prospects').update({
      follow_up_count: stepNum + 1,
      status: 'activo',
      phase,
    }).eq('id', prospect.id);
  }

  async function markResponded(fuId: string, stepNum: number, responded: boolean) {
    await supabase.from('prospect_follow_ups').update({
      status: responded ? 'respondido' : 'sin_respuesta',
      prospect_responded: responded,
    }).eq('id', fuId);
    setLocalFollowUps(prev => prev.map(f => f.id === fuId
      ? { ...f, status: responded ? 'respondido' : 'sin_respuesta', prospect_responded: responded }
      : f));
    setRespondedMap(prev => ({ ...prev, [stepNum]: responded }));
  }

  async function saveNotes() {
    setSavingNotes(true);
    await supabase.from('prospects').update({ notes }).eq('id', prospect.id);
    setSavingNotes(false);
    setSavedNotes(true);
    setTimeout(() => setSavedNotes(false), 2000);
  }

  async function handleRegenerate() {
    if (!confirm('¿Regenerar todos los mensajes con IA? Se reemplazarán los actuales.')) return;
    setRegenerating(true);
    try {
      const res = await fetch('/api/prospectos/regenerar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prospectId: prospect.id }),
      });
      const data = await res.json();
      if (res.ok && data.messages) setLocalMessages(data.messages);
      else alert('Error regenerando mensajes');
    } finally {
      setRegenerating(false);
    }
  }

  const badge = STATUS_CONFIG[localStatus] || STATUS_CONFIG.nuevo;
  const profileUrl = prospect.linkedin_url || prospect.instagram_url;

  return (
    <div className="min-h-screen bg-brand-black p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-4">
            <button onClick={() => router.back()}
              className="mt-1 p-2 rounded-lg text-brand-muted hover:bg-[#111] transition-colors">
              ←
            </button>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-brand-text">{prospect.full_name}</h1>
                <span className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ background: badge.bg, color: badge.color }}>
                  {badge.label}
                </span>
              </div>
              {prospect.headline && (
                <p className="mt-1 text-sm text-brand-muted">{prospect.headline}</p>
              )}
              <div className="flex items-center gap-4 mt-2 flex-wrap">
                {prospect.company && <span className="text-xs text-brand-muted">🏢 {prospect.company}</span>}
                {prospect.location && <span className="text-xs text-brand-muted">📍 {prospect.location}</span>}
                {profileUrl && (
                  <a href={profileUrl} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-brand-gold hover:underline">
                    Ver perfil →
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Status selector */}
          <select value={localStatus} onChange={e => updateStatus(e.target.value)}
            className="px-3 py-2 rounded-xl text-sm bg-[#111] border border-[rgba(26,111,255,0.15)] text-brand-text outline-none cursor-pointer">
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <option key={key} value={key}>{cfg.label}</option>
            ))}
          </select>
        </div>

        {/* DISC badge */}
        {analysis?.disc_type && (
          <div className="mb-6 p-4 rounded-xl flex items-center gap-4 border border-[rgba(26,111,255,0.12)] bg-[#0d0d0d]">
            <div className="px-4 py-2 rounded-xl font-bold text-lg bg-[rgba(26,111,255,0.1)] text-brand-gold">
              {analysis.disc_type}
            </div>
            <div>
              <p className="text-sm font-semibold text-brand-text">Perfil DISC detectado</p>
              <p className="text-xs text-brand-muted mt-0.5">Follow-up #{prospect.follow_up_count}</p>
            </div>
            {analysis.key_words?.slice(0, 4).map(kw => (
              <span key={kw} className="px-2 py-1 rounded-lg text-xs bg-[#111] text-brand-muted">{kw}</span>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-1 p-1 rounded-xl bg-[#0d0d0d] border border-[rgba(26,111,255,0.08)]">
            {(['mensajes', 'analisis', 'seguimiento', 'notas'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all"
                style={{
                  background: tab === t ? '#1a6fff' : 'transparent',
                  color: tab === t ? 'white' : '#6b7280',
                }}>
                {t === 'mensajes' ? '✉️ Mensajes' : t === 'analisis' ? '🧠 Análisis' : t === 'seguimiento' ? '📊 Seguimiento' : '📝 Notas'}
              </button>
            ))}
          </div>
          {tab === 'mensajes' && (
            <button onClick={handleRegenerate} disabled={regenerating}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-brand-muted border border-[rgba(26,111,255,0.12)] bg-[#0d0d0d] hover:text-brand-text transition-colors disabled:opacity-50">
              {regenerating
                ? <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                : '↻'}
              {regenerating ? 'Regenerando...' : 'Regenerar mensajes'}
            </button>
          )}
        </div>

        {/* TAB: MENSAJES */}
        {tab === 'mensajes' && (
          <div className="space-y-4">
            {FOLLOWUP_STEPS.map(step => {
              const prevFU = localFollowUps.find(f => f.follow_up_number === step.num - 1);
              const prevResponded = step.num === 0 ? false
                : (respondedMap[step.num - 1] ?? prevFU?.prospect_responded ?? false);
              const msg = getMsg(step.num, step.num > 0 ? prevResponded : false);
              const thisFU = localFollowUps.find(f => f.follow_up_number === step.num);
              const isSent = !!thisFU;
              const phaseColor = PHASE_COLORS[step.phase] || '#1a6fff';

              return (
                <div key={step.num} className="rounded-2xl overflow-hidden border border-[rgba(26,111,255,0.1)]">
                  <div className="flex items-center justify-between px-5 py-3 bg-[#0d0d0d]">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ background: isSent ? 'rgba(34,197,94,0.12)' : '#111', color: isSent ? '#22c55e' : '#6b7280' }}>
                        {isSent ? '✓' : step.num + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-brand-text">{step.label}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: `${phaseColor}1a`, color: phaseColor }}>
                          {step.phase}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isSent && !thisFU.prospect_responded && thisFU.status !== 'sin_respuesta' && (
                        <>
                          <button onClick={() => markResponded(thisFU.id, step.num, true)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium"
                            style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e' }}>
                            ✓ Respondió
                          </button>
                          <button onClick={() => markResponded(thisFU.id, step.num, false)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium"
                            style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                            ✗ Sin respuesta
                          </button>
                        </>
                      )}
                      {isSent && (
                        <span className="text-xs px-2 py-1 rounded-lg"
                          style={{
                            background: thisFU.prospect_responded ? 'rgba(34,197,94,0.12)' : thisFU.status === 'sin_respuesta' ? 'rgba(239,68,68,0.1)' : '#111',
                            color: thisFU.prospect_responded ? '#22c55e' : thisFU.status === 'sin_respuesta' ? '#ef4444' : '#6b7280',
                          }}>
                          {thisFU.prospect_responded ? 'Respondió' : thisFU.status === 'sin_respuesta' ? 'Sin respuesta' : 'Enviado'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5 bg-[#0a0a0a]">
                    {msg ? (
                      <>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap mb-3 text-brand-text">
                          {msg.content}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <CopyBtn text={msg.content} />
                          <WABtn text={msg.content} />
                          {!isSent && (
                            <button onClick={() => markSent(step.num)}
                              className={cn(
                                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                                'border border-[rgba(26,111,255,0.2)]'
                              )}
                              style={{ background: 'rgba(26,111,255,0.08)', color: '#1a6fff' }}>
                              ✓ Marcar como enviado
                            </button>
                          )}
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-brand-muted">Mensaje no disponible</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB: ANÁLISIS */}
        {tab === 'analisis' && analysis && (
          <div className="space-y-4">
            <div className="p-6 rounded-2xl border border-[rgba(26,111,255,0.1)] bg-[#0d0d0d]">
              <h3 className="font-semibold mb-3 text-brand-text">🧠 Perfil Psicológico</h3>
              <p className="text-sm leading-relaxed text-brand-muted">{analysis.psychological_profile}</p>
            </div>
            <div className="p-6 rounded-2xl border border-[rgba(26,111,255,0.1)] bg-[#0d0d0d]">
              <h3 className="font-semibold mb-3 text-brand-text">💬 Estilo de Comunicación</h3>
              <p className="text-sm leading-relaxed text-brand-muted mb-4">{analysis.communication_style}</p>
              <div className="flex flex-wrap gap-2">
                {analysis.key_words?.map(kw => (
                  <span key={kw} className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{ background: 'rgba(26,111,255,0.1)', color: '#1a6fff', border: '1px solid rgba(26,111,255,0.2)' }}>
                    {kw}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl border border-[rgba(26,111,255,0.1)] bg-[#0d0d0d]">
                <h3 className="font-semibold mb-3 text-brand-text">🏢 Análisis de Empresa</h3>
                <p className="text-sm leading-relaxed text-brand-muted">{analysis.company_analysis}</p>
              </div>
              <div className="p-6 rounded-2xl border border-[rgba(26,111,255,0.1)] bg-[#0d0d0d]">
                <h3 className="font-semibold mb-3 text-brand-text">🎯 Ángulo de Venta</h3>
                <p className="text-sm leading-relaxed text-brand-muted">{analysis.sales_angle}</p>
              </div>
            </div>
            <div className="p-6 rounded-2xl border border-[rgba(26,111,255,0.1)] bg-[#0d0d0d]">
              <h3 className="font-semibold mb-3 text-brand-text">🔑 Pain Points Detectados</h3>
              <div className="space-y-2">
                {analysis.pain_points?.map((pp, i) => (
                  <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-xl bg-[#111]">
                    <span className="text-xs font-bold px-2 py-0.5 rounded shrink-0"
                      style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}>
                      {i + 1}
                    </span>
                    <p className="text-sm text-brand-muted">{pp}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: NOTAS */}
        {tab === 'notas' && (
          <div className="p-6 rounded-2xl border border-[rgba(26,111,255,0.1)] bg-[#0d0d0d]">
            <h3 className="font-semibold mb-1 text-brand-text">📝 Notas</h3>
            <p className="text-xs text-brand-muted mb-4">Observaciones sobre este prospecto.</p>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={10}
              placeholder="Ej: Habló de ampliar equipo en Q2, interesado en automatización..."
              className="w-full px-4 py-3 rounded-xl text-sm bg-[#111] border border-[rgba(26,111,255,0.15)] text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-[#1a6fff] transition-colors resize-y mb-4"
            />
            <button onClick={saveNotes} disabled={savingNotes}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-all"
              style={{ background: savedNotes ? 'rgba(34,197,94,0.2)' : 'linear-gradient(135deg, #1a6fff, #0f52cc)', color: savedNotes ? '#22c55e' : 'white' }}>
              {savingNotes ? 'Guardando...' : savedNotes ? '✓ Guardado' : 'Guardar notas'}
            </button>
          </div>
        )}

        {/* TAB: SEGUIMIENTO */}
        {tab === 'seguimiento' && (
          <div className="rounded-2xl overflow-x-auto border border-[rgba(26,111,255,0.1)] bg-[#0d0d0d]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(26,111,255,0.08)]">
                  {['#', 'Mensaje', 'Fase', 'Estado', 'Respondió', 'Fecha'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-brand-muted">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FOLLOWUP_STEPS.map(step => {
                  const fu = localFollowUps.find(f => f.follow_up_number === step.num);
                  const pc = PHASE_COLORS[step.phase];
                  return (
                    <tr key={step.num} className="border-b border-[rgba(26,111,255,0.05)]"
                      style={{ background: fu ? 'rgba(26,111,255,0.02)' : '#0a0a0a' }}>
                      <td className="px-4 py-4">
                        <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ background: fu ? 'rgba(34,197,94,0.12)' : '#111', color: fu ? '#22c55e' : '#6b7280' }}>
                          {fu ? '✓' : step.num + 1}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-brand-text">{step.label}</td>
                      <td className="px-4 py-4">
                        <span className="px-2 py-1 rounded-full text-xs capitalize"
                          style={{ background: `${pc}1a`, color: pc }}>
                          {step.phase}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {fu ? (
                          <span className="px-2 py-1 rounded-full text-xs"
                            style={{
                              background: fu.status === 'respondido' ? 'rgba(34,197,94,0.12)' : fu.status === 'sin_respuesta' ? 'rgba(239,68,68,0.1)' : 'rgba(26,111,255,0.1)',
                              color: fu.status === 'respondido' ? '#22c55e' : fu.status === 'sin_respuesta' ? '#ef4444' : '#1a6fff',
                            }}>
                            {fu.status === 'respondido' ? 'Respondió' : fu.status === 'sin_respuesta' ? 'Sin respuesta' : 'Enviado'}
                          </span>
                        ) : <span className="text-xs text-brand-muted">Pendiente</span>}
                      </td>
                      <td className="px-4 py-4">
                        {fu ? (
                          <span className={`text-xs font-medium ${fu.prospect_responded ? 'text-green-400' : 'text-red-400'}`}>
                            {fu.prospect_responded ? '✓ Sí' : '✗ No'}
                          </span>
                        ) : <span className="text-xs text-brand-muted">—</span>}
                      </td>
                      <td className="px-4 py-4 text-xs text-brand-muted">
                        {fu?.sent_at ? new Date(fu.sent_at).toLocaleDateString('es-AR') : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
