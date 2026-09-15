import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase-server';
import {
  Users, Users2, Handshake, ListChecks, BarChart2, Inbox,
  Megaphone, Target, ClipboardCheck, ClipboardList, Bell,
  TrendingUp, Wifi, AlertTriangle, CalendarDays, Bot,
  GraduationCap, FolderOpen, UserPlus, Shield, BookOpen,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

// ── Secciones del centro de control ──────────────────────────────────────────

const SECCIONES = [
  {
    grupo: 'Pipeline de ventas',
    color: '#1a6fff',
    items: [
      { href: '/admin/leads-dashboard', label: 'Leads',         Icon: BarChart2,    desc: 'Dashboard de leads, estados y métricas' },
      { href: '/admin/inbox',           label: 'Inbox Global',  Icon: Inbox,        desc: 'Conversaciones entrantes de toda la operación' },
      { href: '/admin/campanas',        label: 'Campañas',      Icon: Megaphone,    desc: 'Campañas de prospección masiva' },
      { href: '/admin/prospeccion',     label: 'Prospección',   Icon: Target,       desc: 'Plantillas y gestión de outreach' },
    ],
  },
  {
    grupo: 'Equipo',
    color: '#a78bfa',
    items: [
      { href: '/admin/setters',          label: 'Setters',        Icon: Users2,       desc: 'Gestión de setters, rendimiento y asignación' },
      { href: '/admin/equipos',          label: 'Equipos Dupla',  Icon: Handshake,    desc: 'Configuración de duplas setter-closer' },
      { href: '/admin/duplas',           label: 'Tareas Duplas',  Icon: ListChecks,   desc: 'Tareas diarias del sistema de duplas' },
      { href: '/admin/strikes',          label: 'Strikes',        Icon: AlertTriangle,desc: 'Registro de strikes del equipo' },
      { href: '/admin/agenda',           label: 'Agenda Closers', Icon: CalendarDays, desc: 'Disponibilidad y reuniones de closers' },
    ],
  },
  {
    grupo: 'IA y Agente de Voz',
    color: '#34d399',
    items: [
      { href: '/admin/calendario-ia',   label: 'Calendario IA',  Icon: Bot,          desc: 'Slots, reuniones y llamadas del agente de voz' },
      { href: '/admin/evolution',       label: 'Evolution API',  Icon: Wifi,         desc: 'Instancias de WhatsApp conectadas' },
    ],
  },
  {
    grupo: 'Formación y Contenido',
    color: '#f59e0b',
    items: [
      { href: '/admin/users',           label: 'Usuarios',        Icon: Users,        desc: 'Gestión de usuarios, roles y accesos' },
      { href: '/admin/courses',         label: 'Cursos',          Icon: BookOpen,     desc: 'Cursos publicados en la plataforma' },
      { href: '/admin/classes',         label: 'Clases',          Icon: GraduationCap,desc: 'Clases y contenido de los cursos' },
      { href: '/admin/sesiones-curso',  label: 'Mentorías',       Icon: GraduationCap,desc: 'Sesiones de mentoría en curso' },
      { href: '/admin/reclutamiento',   label: 'Reclutamiento',   Icon: UserPlus,     desc: 'Postulantes al equipo Areté' },
      { href: '/resources',             label: 'Recursos',        Icon: FolderOpen,   desc: 'Biblioteca de recursos para el equipo' },
    ],
  },
  {
    grupo: 'Comunicación',
    color: '#fb923c',
    items: [
      { href: '/admin/comunicados',     label: 'Comunicados',     Icon: Bell,         desc: 'Avisos y anuncios para toda la plataforma' },
      { href: '/admin/forms',           label: 'Formularios',     Icon: ClipboardCheck,desc: 'Formularios de evaluación y seguimiento' },
      { href: '/admin/conversaciones',  label: 'Evaluaciones',    Icon: ClipboardList, desc: 'Análisis de conversaciones del equipo' },
    ],
  },
  {
    grupo: 'Evolución',
    color: '#e879f9',
    items: [
      { href: '/admin/evolucion/equipo', label: 'Evolución CAC',  Icon: TrendingUp,   desc: 'Seguimiento de evolución del equipo CAC' },
      { href: '/admin/evolucion',        label: 'Diego 2030',     Icon: Shield,       desc: 'Módulo de objetivos y evolución personal' },
    ],
  },
];

// ── Stats ─────────────────────────────────────────────────────────────────────

async function getStats() {
  try {
    const admin = createSupabaseAdminClient() as ReturnType<typeof createSupabaseAdminClient>;
    const [
      { count: usuarios },
      { count: leads },
      { count: setters },
      { count: reunionesHoy },
      { count: reclutamiento },
      { count: llamadasIA },
    ] = await Promise.all([
      admin.from('profiles').select('*', { count: 'exact', head: true }),
      admin.from('leads').select('*', { count: 'exact', head: true }),
      admin.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'setter'),
      admin.from('reuniones').select('*', { count: 'exact', head: true })
        .gte('inicio', new Date(new Date().setHours(0,0,0,0)).toISOString())
        .lte('inicio', new Date(new Date().setHours(23,59,59,999)).toISOString()),
      admin.from('reclutamiento_postulantes').select('*', { count: 'exact', head: true }).eq('estado', 'nuevo'),
      admin.from('contactos_ia').select('*', { count: 'exact', head: true }),
    ]);
    return {
      usuarios: usuarios ?? 0,
      leads: leads ?? 0,
      setters: setters ?? 0,
      reunionesHoy: reunionesHoy ?? 0,
      reclutamiento: reclutamiento ?? 0,
      llamadasIA: llamadasIA ?? 0,
    };
  } catch {
    return { usuarios: 0, leads: 0, setters: 0, reunionesHoy: 0, reclutamiento: 0, llamadasIA: 0 };
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function AdminPage() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const admin = createSupabaseAdminClient() as any;
  const { data: profile } = await admin.from('profiles').select('role, full_name').eq('id', user.id).single();
  if (profile?.role !== 'admin') redirect('/dashboard');

  const stats = await getStats();

  const KPI = [
    { label: 'Usuarios totales',    value: stats.usuarios,      color: '#1a6fff' },
    { label: 'Leads en sistema',    value: stats.leads,         color: '#a78bfa' },
    { label: 'Setters activos',     value: stats.setters,       color: '#34d399' },
    { label: 'Reuniones hoy',       value: stats.reunionesHoy,  color: '#f59e0b' },
    { label: 'Postulantes nuevos',  value: stats.reclutamiento, color: '#fb923c' },
    { label: 'Llamadas IA total',   value: stats.llamadasIA,    color: '#e879f9' },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '4px 0 48px' }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(26,111,255,0.8)', textTransform: 'uppercase' }}>
          Panel Admin
        </p>
        <h1 style={{ margin: '0 0 6px', fontSize: 28, fontWeight: 900, color: '#F2EFE9' }}>
          Centro de control
        </h1>
        <p style={{ margin: 0, fontSize: 14, color: 'rgba(242,239,233,0.45)' }}>
          Bienvenido, {profile?.full_name?.split(' ')[0] ?? 'Admin'}. Todo el sistema desde acá.
        </p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 40 }}>
        {KPI.map(k => (
          <div key={k.label} style={{
            padding: '16px 18px',
            background: 'rgba(255,255,255,0.025)',
            border: `1px solid ${k.color}30`,
            borderRadius: 10,
          }}>
            <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, color: k.color, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {k.label}
            </p>
            <p style={{ margin: 0, fontSize: 30, fontWeight: 900, color: '#F2EFE9', lineHeight: 1 }}>
              {k.value}
            </p>
          </div>
        ))}
      </div>

      {/* Secciones */}
      {SECCIONES.map(sec => (
        <div key={sec.grupo} style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ width: 3, height: 18, borderRadius: 2, background: sec.color }} />
            <p style={{ margin: 0, fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', color: sec.color, textTransform: 'uppercase' }}>
              {sec.grupo}
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
            {sec.items.map(item => {
              const Icon = item.Icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 14,
                    padding: '14px 16px',
                    background: 'rgba(255,255,255,0.025)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 10,
                    textDecoration: 'none',
                    transition: 'border-color 0.15s, background 0.15s',
                  }}
                  onMouseOver={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = `${sec.color}50`;
                    (e.currentTarget as HTMLElement).style.background = `${sec.color}08`;
                  }}
                  onMouseOut={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)';
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.025)';
                  }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                    background: `${sec.color}15`,
                    border: `1px solid ${sec.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={16} color={sec.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: '0 0 3px', fontSize: 13, fontWeight: 700, color: '#F2EFE9' }}>
                      {item.label}
                    </p>
                    <p style={{ margin: 0, fontSize: 11, color: 'rgba(242,239,233,0.4)', lineHeight: 1.4 }}>
                      {item.desc}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
