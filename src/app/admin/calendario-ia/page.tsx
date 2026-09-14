'use client';

/**
 * /admin/calendario-ia
 *
 * Gestión de slots públicos y vista de reuniones agendadas por el agente de voz IA.
 *   • Tab "Slots": crear franjas horarias disponibles para prospectos
 *   • Tab "Reuniones": ver reuniones agendadas vía IA
 *   • Tab "Llamadas": log de llamadas del agente
 */

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Plus, Trash2, Calendar, Phone, Users } from 'lucide-react';
import { APP_TIMEZONE } from '@/constants/timezone';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Tab = 'slots' | 'reuniones' | 'llamadas';

type Slot = {
  id: string;
  inicio: string;
  duracion_min: number;
  disponible: boolean;
  etiqueta: string | null;
};

type Reunion = {
  id: string;
  nombre: string;
  email: string | null;
  telefono: string | null;
  empresa: string | null;
  motivo: string;
  inicio: string;
  duracion_min: number;
  estado: string;
  notas_ia: string | null;
  created_at: string;
};

type Contacto = {
  id: string;
  nombre: string | null;
  email: string | null;
  telefono: string | null;
  empresa: string | null;
  resumen: string;
  duracion_seg: number | null;
  reunion_id: string | null;
  created_at: string;
};

function fmt(iso: string) {
  return new Date(iso).toLocaleString('es-AR', {
    timeZone: APP_TIMEZONE,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const ESTADO_COLOR: Record<string, string> = {
  pendiente: '#f59e0b',
  confirmada: '#3b82f6',
  completada: '#22c55e',
  cancelada: '#6b7280',
  no_show: '#ef4444',
};

export default function CalendarioIAPage() {
  const [tab, setTab] = useState<Tab>('slots');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [reuniones, setReuniones] = useState<Reunion[]>([]);
  const [llamadas, setLlamadas] = useState<Contacto[]>([]);
  const [loading, setLoading] = useState(false);

  // Nuevo slot form
  const [newSlot, setNewSlot] = useState({
    inicio: '',
    duracion_min: 30,
    etiqueta: 'Diagnóstico inicial',
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const loadSlots = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('slots_publicos')
      .select('id, inicio, duracion_min, disponible, etiqueta')
      .gte('inicio', new Date().toISOString())
      .order('inicio', { ascending: true })
      .limit(50);
    setSlots(data ?? []);
    setLoading(false);
  }, []);

  const loadReuniones = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('reuniones_externas')
      .select('id, nombre, email, telefono, empresa, motivo, inicio, duracion_min, estado, notas_ia, created_at')
      .order('inicio', { ascending: false })
      .limit(50);
    setReuniones(data ?? []);
    setLoading(false);
  }, []);

  const loadLlamadas = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('contactos_ia')
      .select('id, nombre, email, telefono, empresa, resumen, duracion_seg, reunion_id, created_at')
      .order('created_at', { ascending: false })
      .limit(50);
    setLlamadas(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (tab === 'slots') loadSlots();
    else if (tab === 'reuniones') loadReuniones();
    else loadLlamadas();
  }, [tab, loadSlots, loadReuniones, loadLlamadas]);

  async function crearSlot(e: React.FormEvent) {
    e.preventDefault();
    if (!newSlot.inicio) return;
    setSaving(true);
    setMsg('');

    // Convertir datetime-local (sin tz) a timestamptz Buenos Aires
    const localDate = new Date(newSlot.inicio);
    const { error } = await supabase
      .from('slots_publicos')
      .insert({
        inicio: localDate.toISOString(),
        duracion_min: newSlot.duracion_min,
        etiqueta: newSlot.etiqueta || 'Diagnóstico inicial',
        disponible: true,
      });

    setSaving(false);
    if (error) {
      setMsg('Error: ' + error.message);
    } else {
      setMsg('✓ Slot creado');
      setNewSlot(prev => ({ ...prev, inicio: '' }));
      loadSlots();
    }
  }

  async function eliminarSlot(id: string) {
    if (!confirm('¿Eliminar este slot?')) return;
    await supabase.from('slots_publicos').delete().eq('id', id);
    loadSlots();
  }

  async function cambiarEstadoReunion(id: string, estado: string) {
    await supabase
      .from('reuniones_externas')
      .update({ estado, updated_at: new Date().toISOString() })
      .eq('id', id);
    loadReuniones();
  }

  // ── Styles ──────────────────────────────────────────────────────────
  const cardStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 10,
    padding: '16px 20px',
    marginBottom: 10,
  };

  const inputStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 6,
    color: '#F2EFE9',
    padding: '8px 12px',
    fontSize: 13,
    width: '100%',
    outline: 'none',
    colorScheme: 'dark',
  };

  const btnPrimary: React.CSSProperties = {
    background: 'rgba(26,111,255,0.9)',
    border: 'none',
    borderRadius: 7,
    color: '#fff',
    padding: '9px 20px',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  };

  return (
    <div style={{ minHeight: '100vh', background: '#080808', color: '#F2EFE9', padding: '24px 28px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(242,239,233,0.4)', textTransform: 'uppercase' }}>Admin · IA</p>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#F2EFE9' }}>Calendario del Agente de Voz</h1>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: 'rgba(242,239,233,0.45)' }}>
            Slots disponibles, reuniones agendadas y llamadas registradas por el agente IA.
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 0 }}>
          {([
            { id: 'slots', label: 'Slots disponibles', Icon: Calendar },
            { id: 'reuniones', label: 'Reuniones', Icon: Users },
            { id: 'llamadas', label: 'Llamadas IA', Icon: Phone },
          ] as { id: Tab; label: string; Icon: React.ElementType }[]).map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: tab === id ? '2px solid rgba(26,111,255,1)' : '2px solid transparent',
                color: tab === id ? '#F2EFE9' : 'rgba(242,239,233,0.45)',
                padding: '8px 16px',
                fontSize: 13,
                fontWeight: tab === id ? 700 : 400,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                marginBottom: -1,
              }}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* ── TAB: SLOTS ─────────────────────────────────────────────────── */}
        {tab === 'slots' && (
          <>
            {/* Crear slot */}
            <form onSubmit={crearSlot} style={{ ...cardStyle, background: 'rgba(26,111,255,0.05)', border: '1px solid rgba(26,111,255,0.2)', marginBottom: 20 }}>
              <p style={{ margin: '0 0 14px', fontWeight: 700, fontSize: 14 }}>Crear nuevo slot disponible</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 1fr auto', gap: 10, alignItems: 'end' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: 'rgba(242,239,233,0.5)', marginBottom: 4 }}>Fecha y hora (Buenos Aires)</label>
                  <input
                    type="datetime-local"
                    value={newSlot.inicio}
                    onChange={e => setNewSlot(p => ({ ...p, inicio: e.target.value }))}
                    required
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: 'rgba(242,239,233,0.5)', marginBottom: 4 }}>Duración (min)</label>
                  <input
                    type="number"
                    min={15}
                    max={120}
                    value={newSlot.duracion_min}
                    onChange={e => setNewSlot(p => ({ ...p, duracion_min: Number(e.target.value) }))}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: 'rgba(242,239,233,0.5)', marginBottom: 4 }}>Etiqueta</label>
                  <input
                    type="text"
                    value={newSlot.etiqueta}
                    onChange={e => setNewSlot(p => ({ ...p, etiqueta: e.target.value }))}
                    placeholder="Diagnóstico inicial"
                    style={inputStyle}
                  />
                </div>
                <button type="submit" disabled={saving} style={btnPrimary}>
                  <Plus size={14} />
                  {saving ? 'Guardando…' : 'Agregar'}
                </button>
              </div>
              {msg && <p style={{ margin: '10px 0 0', fontSize: 12, color: msg.startsWith('Error') ? '#ef4444' : '#22c55e' }}>{msg}</p>}
            </form>

            {/* Lista de slots */}
            {loading ? (
              <p style={{ color: 'rgba(242,239,233,0.4)', fontSize: 13 }}>Cargando…</p>
            ) : slots.length === 0 ? (
              <p style={{ color: 'rgba(242,239,233,0.35)', fontSize: 13 }}>No hay slots futuros. Creá uno arriba.</p>
            ) : (
              slots.map(slot => (
                <div key={slot.id} style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: 14 }}>{fmt(slot.inicio)}</p>
                    <p style={{ margin: 0, fontSize: 12, color: 'rgba(242,239,233,0.45)' }}>
                      {slot.etiqueta ?? 'Diagnóstico inicial'} · {slot.duracion_min} min
                    </p>
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999,
                    background: slot.disponible ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                    color: slot.disponible ? '#22c55e' : '#ef4444',
                    border: `1px solid ${slot.disponible ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                  }}>
                    {slot.disponible ? 'Disponible' : 'Reservado'}
                  </span>
                  <button
                    onClick={() => eliminarSlot(slot.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(239,68,68,0.6)', padding: 4 }}
                    title="Eliminar"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))
            )}
          </>
        )}

        {/* ── TAB: REUNIONES ─────────────────────────────────────────────── */}
        {tab === 'reuniones' && (
          <>
            {loading ? (
              <p style={{ color: 'rgba(242,239,233,0.4)', fontSize: 13 }}>Cargando…</p>
            ) : reuniones.length === 0 ? (
              <p style={{ color: 'rgba(242,239,233,0.35)', fontSize: 13 }}>Sin reuniones registradas aún.</p>
            ) : (
              reuniones.map(r => (
                <div key={r.id} style={cardStyle}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: 15 }}>{r.nombre}</p>
                      <p style={{ margin: '0 0 6px', fontSize: 12, color: 'rgba(242,239,233,0.5)' }}>
                        {r.telefono ?? '—'} {r.email ? `· ${r.email}` : ''} {r.empresa ? `· ${r.empresa}` : ''}
                      </p>
                      <p style={{ margin: '0 0 6px', fontSize: 13, color: '#F2EFE9' }}>{fmt(r.inicio)} · {r.duracion_min} min</p>
                      {r.motivo && <p style={{ margin: 0, fontSize: 12, color: 'rgba(242,239,233,0.45)', fontStyle: 'italic' }}>"{r.motivo}"</p>}
                      {r.notas_ia && <p style={{ margin: '6px 0 0', fontSize: 11, color: 'rgba(242,239,233,0.35)' }}>IA: {r.notas_ia}</p>}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999,
                        background: `${ESTADO_COLOR[r.estado] ?? '#6b7280'}20`,
                        color: ESTADO_COLOR[r.estado] ?? '#6b7280',
                        border: `1px solid ${ESTADO_COLOR[r.estado] ?? '#6b7280'}50`,
                      }}>
                        {r.estado}
                      </span>
                      <select
                        value={r.estado}
                        onChange={e => cambiarEstadoReunion(r.id, e.target.value)}
                        style={{ ...inputStyle, width: 'auto', fontSize: 11, padding: '4px 8px' }}
                      >
                        {['pendiente', 'confirmada', 'completada', 'cancelada', 'no_show'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {/* ── TAB: LLAMADAS ─────────────────────────────────────────────── */}
        {tab === 'llamadas' && (
          <>
            {loading ? (
              <p style={{ color: 'rgba(242,239,233,0.4)', fontSize: 13 }}>Cargando…</p>
            ) : llamadas.length === 0 ? (
              <p style={{ color: 'rgba(242,239,233,0.35)', fontSize: 13 }}>Sin llamadas registradas aún.</p>
            ) : (
              llamadas.map(c => (
                <div key={c.id} style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: 14 }}>
                        {c.nombre ?? 'Anónimo'}
                        {c.empresa ? ` · ${c.empresa}` : ''}
                      </p>
                      <p style={{ margin: '0 0 6px', fontSize: 12, color: 'rgba(242,239,233,0.45)' }}>
                        {c.telefono ?? '—'} {c.email ? `· ${c.email}` : ''}
                      </p>
                      <p style={{ margin: 0, fontSize: 13, color: 'rgba(242,239,233,0.75)', lineHeight: 1.5 }}>{c.resumen}</p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ margin: '0 0 4px', fontSize: 11, color: 'rgba(242,239,233,0.35)' }}>{fmt(c.created_at)}</p>
                      {c.duracion_seg && (
                        <p style={{ margin: 0, fontSize: 11, color: 'rgba(242,239,233,0.35)' }}>
                          {Math.floor(c.duracion_seg / 60)}:{String(c.duracion_seg % 60).padStart(2, '0')} min
                        </p>
                      )}
                      {c.reunion_id && (
                        <span style={{ fontSize: 11, color: '#22c55e', display: 'block', marginTop: 4 }}>✓ Agendó reunión</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {/* Webhook URLs info */}
        <div style={{ marginTop: 40, padding: '20px 24px', background: 'rgba(26,111,255,0.04)', border: '1px solid rgba(26,111,255,0.15)', borderRadius: 10 }}>
          <p style={{ margin: '0 0 12px', fontWeight: 700, fontSize: 13 }}>URLs de los webhooks (ElevenLabs)</p>
          {[
            { name: 'consultar_disponibilidad', path: '/api/webhooks/consultar-disponibilidad' },
            { name: 'agendar_reunion', path: '/api/webhooks/agendar-reunion' },
            { name: 'registrar_llamada', path: '/api/webhooks/registrar-llamada' },
          ].map(w => (
            <div key={w.name} style={{ marginBottom: 8 }}>
              <code style={{ fontSize: 11, color: 'rgba(242,239,233,0.6)', display: 'block', marginBottom: 2 }}>{w.name}</code>
              <code style={{ fontSize: 12, color: 'rgba(26,111,255,0.9)' }}>
                POST https://arete-soluciones-plataforma.vercel.app{w.path}
              </code>
            </div>
          ))}
          <p style={{ margin: '12px 0 0', fontSize: 11, color: 'rgba(242,239,233,0.35)' }}>
            Header requerido: <code>X-Webhook-Secret: [WEBHOOK_IA_SECRET en Vercel]</code>
          </p>
        </div>
      </div>
    </div>
  );
}
