// Supabase SIMULADO para pruebas locales (Auth + PostgREST mínimos).
// No toca ninguna base real: todo vive en memoria. Uso: node server.mjs [puerto]
import http from 'node:http';
import fs from 'node:fs';
import { randomUUID } from 'node:crypto';

const PORT = Number(process.argv[2] || 54399);
const KB = JSON.parse(fs.readFileSync(new URL('./kb.json', import.meta.url)));
const TZ = 'America/Argentina/Buenos_Aires';

const USERS = {
  'setter@prueba.local': { id: '00000000-0000-4000-8000-0000000000a1', role: 'setter', nombre: 'Setter de Prueba' },
  'student@prueba.local': { id: '00000000-0000-4000-8000-0000000000b2', role: 'student', nombre: 'Student de Prueba' },
  'nuevo@prueba.local': { id: '00000000-0000-4000-8000-0000000000c3', role: 'setter', nombre: 'Setter Nuevo' },
};
const SETTER = USERS['setter@prueba.local'].id;

function hoyLocal() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}
// HH:MM hora local AR (UTC-3, sin horario de verano) → ISO UTC de hoy
function hoyA(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  const [Y, M, D] = hoyLocal().split('-').map(Number);
  return new Date(Date.UTC(Y, M - 1, D, h + 3, m)).toISOString();
}

const ahora = new Date().toISOString();
const db = {
  profiles: Object.entries(USERS).map(([email, u]) => ({ id: u.id, email, role: u.role, full_name: u.nombre, avatar_url: null, created_at: ahora })),
  frecuencia_knowledge_blocks: KB,
  frecuencia_dial: [{ id: randomUUID(), user_id: SETTER, fecha: hoyLocal(), momento: 'manana', frecuencia: Number(process.env.DIAL ?? 40), energias_escasez: {}, acciones_subida: [], created_at: ahora }],
  frecuencia_identidad: [{ id: randomUUID(), user_id: SETTER, quien_creia_ser: 'Alguien que no termina', quien_soy: 'Alguien que vuelve', como_me_ven: 'Constante', quien_quiero_ser: 'Alguien que cumple', no_negociables: ['Entrenar a la mañana'], estandar_minimo: ['Dormir 7 horas'] }],
  frecuencia_areas: KB.find((k) => k.clave === 'areas_vida').valor.map((a, i) => ({ id: randomUUID(), user_id: SETTER, area_key: a.key, nivel_actual: 3 + (i % 6), es_palanca: i === 2, es_manzana_podrida: i === 5 })),
  frecuencia_preferencias: [{ id: randomUUID(), user_id: SETTER, timezone: TZ, hora_despertar: '06:30', franjas: null }],
  frecuencia_mapa_energia: [{ id: randomUUID(), user_id: SETTER }],
  frecuencia_espejo: [{ id: randomUUID(), user_id: SETTER, created_at: ahora }],
  frecuencia_objetivos: [{ id: '11111111-1111-4111-8111-111111111111', user_id: SETTER, titulo: 'Cerrar el mes sin sobresaltos', area_key: 'libertad_financiera', fecha_limite: null, created_at: ahora }],
  frecuencia_tareas: [
    { id: '22222222-2222-4222-8222-222222222222', user_id: SETTER, objetivo_id: '11111111-1111-4111-8111-111111111111', titulo: 'Llamar a 3 prospectos', protocolo: null, tipo_energia: 'profundo', duracion_min: 60, dosis_actual: 1, dosis_objetivo: 1, desbloquea: null, veces_postergada: 0, area_key: 'libertad_financiera', estado: 'PENDIENTE', created_at: ahora },
  ],
  frecuencia_bloques: [
    { id: randomUUID(), user_id: SETTER, tarea_id: null, tipo: 'NO_NEGOCIABLE', inicio: hoyA('07:00'), fin: hoyA('08:00'), estado: 'CUMPLIDO', inicio_real: null, fin_real: null, interrupciones: 0 },
    { id: randomUUID(), user_id: SETTER, tarea_id: '22222222-2222-4222-8222-222222222222', tipo: 'EJECUTAR', inicio: hoyA('09:00'), fin: hoyA('11:00'), estado: 'PROGRAMADO', inicio_real: null, fin_real: null, interrupciones: 0 },
    { id: randomUUID(), user_id: SETTER, tarea_id: null, tipo: 'IMPREVISTOS', inicio: hoyA('15:00'), fin: hoyA('16:00'), estado: 'PROGRAMADO', inicio_real: null, fin_real: null, interrupciones: 0 },
  ],
  frecuencia_evidencia: [],
  frecuencia_ideas: [],
  notifications: [],
};

function userPorToken(req) {
  const m = /Bearer (.+)/.exec(req.headers.authorization || '');
  const tok = m?.[1] || '';
  const email = Object.keys(USERS).find((e) => tok === `tok-${USERS[e].id}`);
  return email ? { email, ...USERS[email] } : null;
}
function authUser(u) {
  return {
    id: u.id, aud: 'authenticated', role: 'authenticated', email: u.email, email_confirmed_at: ahora,
    app_metadata: { provider: 'email' }, user_metadata: { onboarding_done: true, full_name: u.nombre },
    created_at: ahora, updated_at: ahora,
  };
}
function sesion(u) {
  return { access_token: `tok-${u.id}`, refresh_token: `ref-${u.id}`, token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, user: authUser(u) };
}

function aplicarFiltros(rows, params) {
  let out = rows;
  for (const [k, v] of params) {
    if (['select', 'order', 'limit', 'offset', 'on_conflict', 'columns'].includes(k)) continue;
    const i = v.indexOf('.');
    const op = v.slice(0, i);
    const val = v.slice(i + 1);
    const cmp = (r) => {
      const x = r[k];
      switch (op) {
        case 'eq': return String(x) === val;
        case 'neq': return String(x) !== val;
        case 'gte': return x >= val;
        case 'gt': return x > val;
        case 'lte': return x <= val;
        case 'lt': return x < val;
        case 'is': return val === 'null' ? x == null : String(x) === val;
        case 'in': return val.replace(/[()]/g, '').split(',').map((s) => s.replace(/"/g, '')).includes(String(x));
        case 'like': case 'ilike': return new RegExp('^' + val.replace(/[%*]/g, '.*') + '$', 'i').test(String(x ?? ''));
        default: return true; // filtros que este mock no entiende: no filtran
      }
    };
    if (k in (out[0] ?? {}) || ['eq', 'is'].includes(op)) out = out.filter(cmp);
  }
  const order = params.get('order');
  if (order) {
    const [col, dir] = order.split(',')[0].split('.');
    out = [...out].sort((a, b) => (a[col] > b[col] ? 1 : a[col] < b[col] ? -1 : 0) * (dir === 'desc' ? -1 : 1));
  }
  const limit = params.get('limit');
  if (limit) out = out.slice(0, Number(limit));
  return out;
}

function leerCuerpo(req) {
  return new Promise((res) => {
    let b = '';
    req.on('data', (c) => (b += c));
    req.on('end', () => { try { res(b ? JSON.parse(b) : null); } catch { res(null); } });
  });
}

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': '*',
  'access-control-allow-methods': 'GET,POST,PATCH,DELETE,HEAD,OPTIONS',
  'access-control-expose-headers': 'content-range',
};
function enviar(res, status, body, headers = {}) {
  res.writeHead(status, { 'content-type': 'application/json', ...CORS, ...headers });
  res.end(body === undefined ? '' : JSON.stringify(body));
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const p = url.pathname;
  if (req.method === 'OPTIONS') { res.writeHead(204, CORS); return res.end(); }
  try {
    // ── control del mock (solo para la prueba) ──
    if (p === '/__mock/dial') {
      const v = Number(url.searchParams.get('valor'));
      db.frecuencia_dial[0].frecuencia = v;
      return enviar(res, 200, { ok: true, frecuencia: v });
    }

    // ── Auth ──
    if (p === '/auth/v1/token') {
      const body = await leerCuerpo(req);
      const gt = url.searchParams.get('grant_type');
      if (gt === 'password') {
        const u = USERS[body?.email];
        if (!u || body?.password !== 'prueba-local') return enviar(res, 400, { error: 'invalid_grant', error_description: 'Invalid login credentials' });
        return enviar(res, 200, sesion({ email: body.email, ...u }));
      }
      if (gt === 'refresh_token') {
        const email = Object.keys(USERS).find((e) => body?.refresh_token === `ref-${USERS[e].id}`);
        if (!email) return enviar(res, 400, { error: 'invalid_grant' });
        return enviar(res, 200, sesion({ email, ...USERS[email] }));
      }
    }
    if (p === '/auth/v1/user') {
      const u = userPorToken(req);
      return u ? enviar(res, 200, authUser(u)) : enviar(res, 401, { message: 'invalid JWT' });
    }
    if (p === '/auth/v1/logout') return enviar(res, 204);
    if (p.startsWith('/auth/v1/admin')) return enviar(res, 200, { users: [] });

    // ── PostgREST ──
    if (p.startsWith('/rest/v1/rpc/')) return enviar(res, 200, null);
    if (p.startsWith('/rest/v1/')) {
      const tabla = p.slice('/rest/v1/'.length);
      const filas = (db[tabla] ??= []);
      const accept = req.headers.accept || '';
      const prefer = req.headers.prefer || '';

      if (req.method === 'GET' || req.method === 'HEAD') {
        const rows = aplicarFiltros(filas, url.searchParams);
        const headers = { 'content-range': rows.length ? `0-${rows.length - 1}/${rows.length}` : `*/0` };
        if (req.method === 'HEAD') { res.writeHead(200, { ...CORS, ...headers }); return res.end(); }
        if (accept.includes('vnd.pgrst.object')) {
          return rows.length === 1 ? enviar(res, 200, rows[0], headers) : enviar(res, 406, { code: 'PGRST116', message: 'JSON object requested, multiple (or no) rows returned' });
        }
        return enviar(res, 200, rows, headers);
      }
      if (req.method === 'POST') {
        const body = await leerCuerpo(req);
        const nuevas = (Array.isArray(body) ? body : [body]).filter(Boolean).map((r) => ({ id: randomUUID(), created_at: new Date().toISOString(), ...r }));
        for (const n of nuevas) {
          const conflicto = url.searchParams.get('on_conflict');
          const idx = conflicto ? filas.findIndex((f) => conflicto.split(',').every((c) => String(f[c]) === String(n[c]))) : -1;
          if (idx >= 0) filas[idx] = { ...filas[idx], ...n, id: filas[idx].id, created_at: filas[idx].created_at };
          else filas.push(n);
        }
        if (prefer.includes('return=representation')) return enviar(res, 201, accept.includes('vnd.pgrst.object') ? nuevas[0] : nuevas);
        return enviar(res, 201);
      }
      if (req.method === 'PATCH') {
        const body = await leerCuerpo(req);
        const rows = aplicarFiltros(filas, url.searchParams);
        rows.forEach((r) => Object.assign(r, body));
        return prefer.includes('return=representation') ? enviar(res, 200, accept.includes('vnd.pgrst.object') ? rows[0] ?? null : rows) : enviar(res, 204);
      }
      if (req.method === 'DELETE') {
        const rows = aplicarFiltros(filas, url.searchParams);
        db[tabla] = filas.filter((f) => !rows.includes(f));
        return enviar(res, 204);
      }
    }
    if (p.startsWith('/storage/v1/')) return enviar(res, 200, []);
    if (p.startsWith('/realtime/')) return enviar(res, 404, {});
    return enviar(res, 404, { message: `mock: ruta no soportada ${req.method} ${p}` });
  } catch (e) {
    return enviar(res, 500, { message: String(e) });
  }
}).listen(PORT, '127.0.0.1', () => console.log(`supabase-mock en http://127.0.0.1:${PORT}`));
