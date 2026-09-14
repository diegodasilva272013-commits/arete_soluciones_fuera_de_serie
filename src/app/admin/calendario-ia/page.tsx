'use client';

/**
 * /admin/calendario-ia
 *
 * Gestión del calendario del agente de voz IA:
 *   Tab "Disponibilidad" — generador de slots recurrentes (días + horario + semanas)
 *   Tab "Reuniones"      — reuniones agendadas por el agente
 *   Tab "Llamadas"       — log de sesiones del agente
 */

import { useEffect, useState, useCallback } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';
import { Trash2, Calendar, Phone, Users, RefreshCw, Bot } from 'lucide-react';
import { APP_TIMEZONE } from '@/constants/timezone';

const supabase = createSupabaseBrowserClient();

type Tab = 'disponibilidad' | 'reuniones' | 'llamadas';

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

const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const DIAS_FULL = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const ESTADO_COLOR: Record<string, string> = {
  pendiente: '#f59e0b',
  confirmada: '#3b82f6',
  completada: '#22c55e',
  cancelada: '#6b7280',
  no_show: '#ef4444',
};

function fmt(iso: string) {
  return new Date(iso).toLocaleString('es-AR', {
    timeZone: APP_TIMEZONE,
    weekday: 'short', day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit',
  });
}

function fmtShort(iso: string) {
  return new Date(iso).toLocaleString('es-AR', {
    timeZone: APP_TIMEZONE,
    weekday: 'short', day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit',
  });
}

/** Genera slots a partir de la config de disponibilidad recurrente */
function generarSlots(cfg: {
  diasSemana: number[];   // 0=Dom … 6=Sáb
  horaInicio: string;    // "09:00"
  horaFin: string;       // "18:00"
  duracion: number;      // minutos
  semanas: number;       // cuántas semanas generar
  etiqueta: string;
}): Date[] {
  const { diasSemana, horaInicio, horaFin, duracion, semanas, etiqueta: _etiqueta } = cfg;
  const slots: Date[] = [];

  const [hIni, mIni] = horaInicio.split(':').map(Number);
  const [hFin, mFin] = horaFin.split(':').map(Number);

  const ahora = new Date();
  // Empezar desde mañana
  const inicio = new Date(ahora);
  inicio.setDate(inicio.getDate() + 1);
  inicio.setHours(0, 0, 0, 0);

  const fin = new Date(inicio);
  fin.setDate(fin.getDate() + semanas * 7);

  const cursor = new Date(inicio);
  while (cursor < fin) {
    const dow = cursor.getDay(); // día de la semana en hora local del servidor
    if (diasSemana.includes(dow)) {
      // Generar slots en el rango horario
      let slotMin = hIni * 60 + mIni;
      const finMin = hFin * 60 + mFin;
      while (slotMin + duracion <= finMin) {
        const slot = new Date(cursor);
        slot.setHours(Math.floor(slotMin / 60), slotMin % 60, 0, 0);
        // Solo si es futuro
        if (slot > ahora) slots.push(new Date(slot));
        slotMin += duracion;
      }
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return slots;
}

export default function CalendarioIAPage() {
  const [tab, setTab] = useState<Tab>('disponibilidad');

  // ── Config generador ──────────────────────────────────────────────────
  const [diasSeleccionados, setDiasSeleccionados] = useState<number[]>([1, 2, 3, 4, 5]); // Lun-Vie
  const [horaInicio, setHoraInicio] = useState('09:00');
  const [horaFin, setHoraFin] = useState('18:00');
  const [duracion, setDuracion] = useState(30);
  const [semanas, setSemanas] = useState(4);
  const [etiqueta, setEtiqueta] = useState('Diagnóstico inicial · 30 min');

  const [preview, setPreview] = useState<Date[]>([]);
  const [generando, setGenerando] = useState(false);
  const [genMsg, setGenMsg] = useState('');

  // ── Slots existentes ──────────────────────────────────────────────────
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // ── Reuniones / llamadas ──────────────────────────────────────────────
  const [reuniones, setReuniones] = useState<Reunion[]>([]);
  const [llamadas, setLlamadas] = useState<Contacto[]>([]);
  const [loading, setLoading] = useState(false);

  // Recalcular preview cuando cambia la config
  useEffect(() => {
    if (diasSeleccionados.length === 0) { setPreview([]); return; }
    const s = generarSlots({ diasSemana: diasSeleccionados, horaInicio, horaFin, duracion, semanas, etiqueta });
    setPreview(s);
  }, [diasSeleccionados, horaInicio, horaFin, duracion, semanas]);

  const loadSlots = useCallback(async () => {
    setLoadingSlots(true);
    const { data } = await supabase
      .from('slots_publicos')
      .select('id, inicio, duracion_min, disponible, etiqueta')
      .gte('inicio', new Date().toISOString())
      .order('inicio', { ascending: true })
      .limit(100);
    setSlots(data ?? []);
    setLoadingSlots(false);
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
    if (tab === 'disponibilidad') loadSlots();
    else if (tab === 'reuniones') loadReuniones();
    else loadLlamadas();
  }, [tab, loadSlots, loadReuniones, loadLlamadas]);

  function toggleDia(d: number) {
    setDiasSeleccionados(prev =>
      prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d].sort()
    );
  }

  async function generarYGuardar() {
    if (preview.length === 0) return;
    if (!confirm(`¿Crear ${preview.length} slots?\n\nDe: ${etiqueta}`)) return;

    setGenerando(true);
    setGenMsg('');

    const rows = preview.map(d => ({
      inicio: d.toISOString(),
      duracion_min: duracion,
      etiqueta,
      disponible: true,
    }));

    // Insert en lotes de 100
    let inserted = 0;
    for (let i = 0; i < rows.length; i += 100) {
      const { error, count } = await supabase
        .from('slots_publicos')
        .insert(rows.slice(i, i + 100))
        .select('id', { count: 'exact', head: true });
      if (error) {
        setGenMsg(`Error en lote ${i / 100 + 1}: ${error.message}`);
        setGenerando(false);
        return;
      }
      inserted += count ?? 0;
    }

    setGenMsg(`✓ ${rows.length} slots creados correctamente`);
    setGenerando(false);
    loadSlots();
  }

  async function eliminarSlot(id: string) {
    await supabase.from('slots_publicos').delete().eq('id', id);
    setSlots(prev => prev.filter(s => s.id !== id));
  }

  async function eliminarTodosFuturos() {
    if (!confirm('¿Eliminar TODOS los slots disponibles futuros?')) return;
    await supabase
      .from('slots_publicos')
      .delete()
      .eq('disponible', true)
      .gte('inicio', new Date().toISOString());
    loadSlots();
  }

  async function cambiarEstadoReunion(id: string, estado: string) {
    await supabase
      .from('reuniones_externas')
      .update({ estado, updated_at: new Date().toISOString() })
      .eq('id', id);
    setReuniones(prev => prev.map(r => r.id === id ? { ...r, estado } : r));
  }

  // ── Styles ─────────────────────────────────────────────────────────────
  const card: React.CSSProperties = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 10,
    padding: '16px 20px',
    marginBottom: 10,
  };
  const input: React.CSSProperties = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 6,
    color: '#F2EFE9',
    padding: '8px 12px',
    fontSize: 13,
    outline: 'none',
    colorScheme: 'dark',
    width: '100%',
  };
  const btnPrimary: React.CSSProperties = {
    background: 'rgba(26,111,255,0.9)',
    border: 'none', borderRadius: 7,
    color: '#fff', padding: '10px 22px',
    fontSize: 13, fontWeight: 700,
    cursor: 'pointer', display: 'flex',
    alignItems: 'center', gap: 7,
  };
  const label: React.CSSProperties = {
    display: 'block', fontSize: 11,
    color: 'rgba(242,239,233,0.45)',
    marginBottom: 5, fontWeight: 600,
    textTransform: 'uppercase', letterSpacing: '0.06em',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#080808', color: '#F2EFE9', padding: '24px 28px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(26,111,255,0.12)', border: '1px solid rgba(26,111,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bot size={20} color="rgba(26,111,255,0.9)" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(242,239,233,0.4)', textTransform: 'uppercase' }}>Admin · IA</p>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Calendario IA Soluciones</h1>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          {([
            { id: 'disponibilidad', label: 'Disponibilidad', Icon: Calendar },
            { id: 'reuniones',      label: 'Reuniones agendadas', Icon: Users },
            { id: 'llamadas',       label: 'Llamadas IA', Icon: Phone },
          ] as { id: Tab; label: string; Icon: React.ElementType }[]).map(({ id, label: lbl, Icon }) => (
            <button key={id} onClick={() => setTab(id)} style={{
              background: 'none', border: 'none',
              borderBottom: tab === id ? '2px solid rgba(26,111,255,1)' : '2px solid transparent',
              color: tab === id ? '#F2EFE9' : 'rgba(242,239,233,0.4)',
              padding: '8px 16px', fontSize: 13, fontWeight: tab === id ? 700 : 400,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, marginBottom: -1,
            }}>
              <Icon size={14} />{lbl}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════════
            TAB: DISPONIBILIDAD
        ══════════════════════════════════════════════════════════════ */}
        {tab === 'disponibilidad' && (
          <>
            {/* Generador de slots */}
            <div style={{ ...card, background: 'rgba(26,111,255,0.04)', border: '1px solid rgba(26,111,255,0.18)', marginBottom: 24 }}>
              <p style={{ margin: '0 0 18px', fontWeight: 800, fontSize: 15 }}>
                Configurar disponibilidad
              </p>

              {/* Días de la semana */}
              <div style={{ marginBottom: 18 }}>
                <span style={label}>Días disponibles</span>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {DIAS.map((d, i) => (
                    <button key={i} onClick={() => toggleDia(i)} style={{
                      padding: '7px 14px', borderRadius: 7, fontSize: 13, fontWeight: 700,
                      cursor: 'pointer', border: '1px solid',
                      background: diasSeleccionados.includes(i) ? 'rgba(26,111,255,0.2)' : 'rgba(255,255,255,0.03)',
                      borderColor: diasSeleccionados.includes(i) ? 'rgba(26,111,255,0.6)' : 'rgba(255,255,255,0.1)',
                      color: diasSeleccionados.includes(i) ? 'rgba(26,111,255,1)' : 'rgba(242,239,233,0.45)',
                    }}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Horario */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px 120px', gap: 14, marginBottom: 18 }}>
                <div>
                  <span style={label}>Hora inicio</span>
                  <input type="time" value={horaInicio} onChange={e => setHoraInicio(e.target.value)} style={input} />
                </div>
                <div>
                  <span style={label}>Hora fin</span>
                  <input type="time" value={horaFin} onChange={e => setHoraFin(e.target.value)} style={input} />
                </div>
                <div>
                  <span style={label}>Duración (min)</span>
                  <select value={duracion} onChange={e => setDuracion(Number(e.target.value))} style={input}>
                    <option value={15}>15 min</option>
                    <option value={30}>30 min</option>
                    <option value={45}>45 min</option>
                    <option value={60}>60 min</option>
                  </select>
                </div>
                <div>
                  <span style={label}>Semanas</span>
                  <select value={semanas} onChange={e => setSemanas(Number(e.target.value))} style={input}>
                    <option value={1}>1 semana</option>
                    <option value={2}>2 semanas</option>
                    <option value={4}>4 semanas</option>
                    <option value={8}>8 semanas</option>
                    <option value={12}>3 meses</option>
                  </select>
                </div>
              </div>

              {/* Etiqueta */}
              <div style={{ marginBottom: 20 }}>
                <span style={label}>Etiqueta del turno</span>
                <input
                  type="text"
                  value={etiqueta}
                  onChange={e => setEtiqueta(e.target.value)}
                  placeholder="Diagnóstico inicial · 30 min"
                  style={input}
                />
              </div>

              {/* Preview count + botón */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, padding: '10px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.07)' }}>
                  {preview.length === 0 ? (
                    <p style={{ margin: 0, fontSize: 13, color: 'rgba(242,239,233,0.35)' }}>Seleccioná al menos un día y un rango horario válido.</p>
                  ) : (
                    <>
                      <p style={{ margin: '0 0 2px', fontSize: 22, fontWeight: 800, color: 'rgba(26,111,255,1)' }}>{preview.length}</p>
                      <p style={{ margin: 0, fontSize: 12, color: 'rgba(242,239,233,0.45)' }}>
                        slots de {duracion} min · {semanas} sem · días: {diasSeleccionados.map(d => DIAS[d]).join(', ')}
                      </p>
                      {preview.length > 0 && (
                        <p style={{ margin: '4px 0 0', fontSize: 11, color: 'rgba(242,239,233,0.3)' }}>
                          Primero: {fmtShort(preview[0].toISOString())} — Último: {fmtShort(preview[preview.length - 1].toISOString())}
                        </p>
                      )}
                    </>
                  )}
                </div>
                <button
                  onClick={generarYGuardar}
                  disabled={generando || preview.length === 0}
                  style={{ ...btnPrimary, opacity: preview.length === 0 ? 0.4 : 1 }}
                >
                  <RefreshCw size={14} />
                  {generando ? 'Creando slots…' : `Crear ${preview.length} slots`}
                </button>
              </div>
              {genMsg && (
                <p style={{ margin: '12px 0 0', fontSize: 13, color: genMsg.startsWith('Error') ? '#ef4444' : '#22c55e', fontWeight: 600 }}>
                  {genMsg}
                </p>
              )}
            </div>

            {/* Slots existentes */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>
                Slots activos ({slots.filter(s => s.disponible).length} disponibles, {slots.filter(s => !s.disponible).length} reservados)
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={loadSlots} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: 'rgba(242,239,233,0.45)', padding: '5px 12px', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <RefreshCw size={12} /> Actualizar
                </button>
                {slots.some(s => s.disponible) && (
                  <button onClick={eliminarTodosFuturos} style={{ background: 'none', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, color: 'rgba(239,68,68,0.7)', padding: '5px 12px', fontSize: 12, cursor: 'pointer' }}>
                    Borrar todos los disponibles
                  </button>
                )}
              </div>
            </div>

            {loadingSlots ? (
              <p style={{ color: 'rgba(242,239,233,0.4)', fontSize: 13 }}>Cargando…</p>
            ) : slots.length === 0 ? (
              <div style={{ ...card, textAlign: 'center', padding: '40px 20px' }}>
                <p style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 700, color: 'rgba(242,239,233,0.5)' }}>Sin slots configurados</p>
                <p style={{ margin: 0, fontSize: 13, color: 'rgba(242,239,233,0.3)' }}>Usá el generador de arriba para crear la disponibilidad del equipo.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {slots.map(slot => (
                  <div key={slot.id} style={{ ...card, display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', marginBottom: 0 }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{fmtShort(slot.inicio)}</span>
                      <span style={{ fontSize: 12, color: 'rgba(242,239,233,0.4)', marginLeft: 10 }}>{slot.etiqueta ?? '—'} · {slot.duracion_min} min</span>
                    </div>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999,
                      background: slot.disponible ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                      color: slot.disponible ? '#22c55e' : '#ef4444',
                      border: `1px solid ${slot.disponible ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
                    }}>
                      {slot.disponible ? 'Disponible' : 'Reservado'}
                    </span>
                    {slot.disponible && (
                      <button onClick={() => eliminarSlot(slot.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(239,68,68,0.5)', padding: 4 }}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ══════════════════════════════════════════════════════════════
            TAB: REUNIONES
        ══════════════════════════════════════════════════════════════ */}
        {tab === 'reuniones' && (
          loading ? <p style={{ color: 'rgba(242,239,233,0.4)', fontSize: 13 }}>Cargando…</p>
          : reuniones.length === 0 ? (
            <div style={{ ...card, textAlign: 'center', padding: '40px 20px' }}>
              <p style={{ margin: 0, fontSize: 14, color: 'rgba(242,239,233,0.4)' }}>Sin reuniones agendadas todavía.</p>
            </div>
          ) : (
            reuniones.map(r => (
              <div key={r.id} style={card}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 220 }}>
                    <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: 15 }}>{r.nombre}</p>
                    <p style={{ margin: '0 0 6px', fontSize: 12, color: 'rgba(242,239,233,0.45)' }}>
                      {r.telefono ?? '—'}{r.email ? ` · ${r.email}` : ''}{r.empresa ? ` · ${r.empresa}` : ''}
                    </p>
                    <p style={{ margin: '0 0 4px', fontSize: 13 }}>{fmt(r.inicio)} · {r.duracion_min} min</p>
                    {r.motivo && <p style={{ margin: 0, fontSize: 12, color: 'rgba(242,239,233,0.4)', fontStyle: 'italic' }}>"{r.motivo}"</p>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999,
                      background: `${ESTADO_COLOR[r.estado] ?? '#6b7280'}20`,
                      color: ESTADO_COLOR[r.estado] ?? '#6b7280',
                      border: `1px solid ${ESTADO_COLOR[r.estado] ?? '#6b7280'}50`,
                    }}>{r.estado}</span>
                    <select value={r.estado} onChange={e => cambiarEstadoReunion(r.id, e.target.value)}
                      style={{ ...input, width: 'auto', fontSize: 11, padding: '4px 8px' }}>
                      {['pendiente', 'confirmada', 'completada', 'cancelada', 'no_show'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))
          )
        )}

        {/* ══════════════════════════════════════════════════════════════
            TAB: LLAMADAS
        ══════════════════════════════════════════════════════════════ */}
        {tab === 'llamadas' && (
          loading ? <p style={{ color: 'rgba(242,239,233,0.4)', fontSize: 13 }}>Cargando…</p>
          : llamadas.length === 0 ? (
            <div style={{ ...card, textAlign: 'center', padding: '40px 20px' }}>
              <p style={{ margin: 0, fontSize: 14, color: 'rgba(242,239,233,0.4)' }}>Sin llamadas registradas todavía.</p>
            </div>
          ) : (
            llamadas.map(c => (
              <div key={c.id} style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: 14 }}>
                      {c.nombre ?? 'Anónimo'}{c.empresa ? ` · ${c.empresa}` : ''}
                    </p>
                    <p style={{ margin: '0 0 6px', fontSize: 12, color: 'rgba(242,239,233,0.4)' }}>
                      {c.telefono ?? '—'}{c.email ? ` · ${c.email}` : ''}
                    </p>
                    <p style={{ margin: 0, fontSize: 13, color: 'rgba(242,239,233,0.7)', lineHeight: 1.5 }}>{c.resumen}</p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ margin: '0 0 4px', fontSize: 11, color: 'rgba(242,239,233,0.35)' }}>{fmt(c.created_at)}</p>
                    {c.duracion_seg && (
                      <p style={{ margin: 0, fontSize: 11, color: 'rgba(242,239,233,0.35)' }}>
                        {Math.floor(c.duracion_seg / 60)}:{String(c.duracion_seg % 60).padStart(2, '0')} min
                      </p>
                    )}
                    {c.reunion_id && <span style={{ fontSize: 11, color: '#22c55e', display: 'block', marginTop: 4 }}>✓ Agendó reunión</span>}
                  </div>
                </div>
              </div>
            ))
          )
        )}

        {/* Info webhooks */}
        <div style={{ marginTop: 40, padding: '18px 22px', background: 'rgba(26,111,255,0.03)', border: '1px solid rgba(26,111,255,0.12)', borderRadius: 10 }}>
          <p style={{ margin: '0 0 10px', fontWeight: 700, fontSize: 12, color: 'rgba(242,239,233,0.5)' }}>URLs webhooks · ElevenLabs</p>
          {[
            'consultar_disponibilidad → /api/webhooks/consultar-disponibilidad',
            'agendar_reunion         → /api/webhooks/agendar-reunion',
            'registrar_llamada       → /api/webhooks/registrar-llamada',
          ].map(t => (
            <code key={t} style={{ display: 'block', fontSize: 11, color: 'rgba(26,111,255,0.75)', marginBottom: 4 }}>{t}</code>
          ))}
        </div>
      </div>
    </div>
  );
}
