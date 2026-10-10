#!/usr/bin/env node
/**
 * C8 — Test de aislamiento de Frecuencia (RLS) + residuo cero.
 *
 * Crea cuentas de prueba (admin, líder, dos miembros, una persona ajena al equipo y una sin rol habilitado),
 * hace TODAS las comprobaciones con la SESIÓN de cada cuenta (anon key + login: RLS real) y al final borra todo
 * y verifica que no queda nada. La service role se usa SOLO para crear/borrar las cuentas de prueba y para
 * contar el residuo; ninguna comprobación de acceso la usa.
 *
 * Uso:
 *   NEXT_PUBLIC_SUPABASE_URL=... NEXT_PUBLIC_SUPABASE_ANON_KEY=... SUPABASE_SERVICE_ROLE_KEY=... \
 *     node scripts/frecuencia-c8.mjs
 * Sale con código 0 si TODO da OK (incluido residuo cero) y 1 si no.
 */

import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'node:crypto';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !ANON || !SERVICE) {
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY y/o SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}
const DOMINIO = 'frecuencia-test.aretesoluciones.space';
const sinSesion = () => createClient(URL, ANON, { auth: { persistSession: false, autoRefreshToken: false } });
const admin = createClient(URL, SERVICE, { auth: { persistSession: false, autoRefreshToken: false } });

let total = 0;
let fallas = 0;
function check(nombre, condicion, detalle = '') {
  total++;
  if (condicion) console.log(`  OK   ${nombre}`);
  else {
    fallas++;
    console.log(`  FALLA ${nombre}${detalle ? ' → ' + detalle : ''}`);
  }
}
const filas = (r) => (r.error ? -1 : (r.data?.length ?? 0));
const seccion = (t) => console.log(`\n${t}`);

const cuentas = {};
async function crear(alias, rol) {
  const email = `c8-${alias}-${Date.now()}-${randomBytes(3).toString('hex')}@${DOMINIO}`;
  const password = randomBytes(18).toString('base64url');
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { full_name: `C8 ${alias}`, onboarding_done: true } });
  if (error) throw error;
  if (rol !== 'student') {
    const r = await admin.from('profiles').update({ role: rol }).eq('id', data.user.id);
    if (r.error) throw r.error;
  }
  const c = sinSesion();
  const l = await c.auth.signInWithPassword({ email, password });
  if (l.error) throw l.error;
  cuentas[alias] = { id: data.user.id, email, c };
}

const TABLAS_INTIMAS = ['frecuencia_preferencias', 'frecuencia_identidad', 'frecuencia_mapa_energia', 'frecuencia_dial', 'frecuencia_espejo', 'frecuencia_conversaciones', 'frecuencia_mensajes', 'frecuencia_areas', 'frecuencia_objetivos', 'frecuencia_tareas', 'frecuencia_ideas', 'frecuencia_revisiones', 'frecuencia_imagenes', 'frecuencia_criterios'];
const TABLAS_LIDER_LEE = ['frecuencia_bloques', 'frecuencia_evidencia', 'frecuencia_compromisos'];
const TODAS_FRECUENCIA = [...TABLAS_INTIMAS, ...TABLAS_LIDER_LEE, 'frecuencia_delegaciones', 'frecuencia_equipos', 'frecuencia_equipo_miembros', 'frecuencia_knowledge_blocks'];

async function main() {
  console.log('C8 — aislamiento de Frecuencia');
  // admin, lider (rol setter), m1, m2 (miembros), ajeno (otro setter sin equipo), sinrol (student: rol no habilitado)
  await crear('admin', 'admin');
  await crear('lider', 'setter');
  await crear('m1', 'setter');
  await crear('m2', 'setter');
  await crear('ajeno', 'setter');
  await crear('sinrol', 'student');
  const { admin: AD, lider: LI, m1: M1, m2: M2, ajeno: AJ, sinrol: SR } = cuentas;
  const hoy = new Date().toISOString().slice(0, 10);
  const mes = hoy.slice(0, 7) + '-01';

  seccion('1. Equipos: solo admin crea; el resto no');
  const eqAjeno = await AJ.c.from('frecuencia_equipos').insert({ nombre: 'colado', lider_id: AJ.id });
  check('no admin NO crea equipo', !!eqAjeno.error);
  const eq = await AD.c.from('frecuencia_equipos').insert({ nombre: 'C8 equipo', lider_id: LI.id }).select('id').single();
  check('admin crea equipo', !eq.error, eq.error?.message);
  const equipoId = eq.data?.id;
  check('el líder queda como miembro automáticamente', filas(await AD.c.from('frecuencia_equipo_miembros').select('*').eq('equipo_id', equipoId).eq('user_id', LI.id)) === 1);
  for (const m of [M1, M2]) check(`admin agrega miembro ${m.email.slice(3, 5)}`, !(await AD.c.from('frecuencia_equipo_miembros').insert({ equipo_id: equipoId, user_id: m.id })).error);
  check('no admin NO se agrega a un equipo', !!(await AJ.c.from('frecuencia_equipo_miembros').insert({ equipo_id: equipoId, user_id: AJ.id })).error);
  check('no admin NO agrega a otra persona', !!(await M1.c.from('frecuencia_equipo_miembros').insert({ equipo_id: equipoId, user_id: AJ.id })).error);
  check('no admin NO cambia el líder', filas(await M1.c.from('frecuencia_equipos').update({ lider_id: M1.id }).eq('id', equipoId).select('id')) === 0);
  check('no admin NO borra el equipo', filas(await LI.c.from('frecuencia_equipos').delete().eq('id', equipoId).select('id')) === 0);
  check('miembro ve su equipo', filas(await M1.c.from('frecuencia_equipos').select('id').eq('id', equipoId)) === 1);
  check('persona ajena NO ve el equipo', filas(await AJ.c.from('frecuencia_equipos').select('id').eq('id', equipoId)) === 0);
  check('persona ajena NO ve los miembros', filas(await AJ.c.from('frecuencia_equipo_miembros').select('*').eq('equipo_id', equipoId)) === 0);

  seccion('2. Siembra de datos de m1 (cada persona escribe lo suyo)');
  const sembrar = async (nombre, p) => { const r = await p; check(`m1 crea ${nombre}`, !r.error, r.error?.message); return r.data; };
  await sembrar('preferencias', M1.c.from('frecuencia_preferencias').upsert({ user_id: M1.id, hora_despertar: '06:30' }, { onConflict: 'user_id' }));
  await sembrar('identidad', M1.c.from('frecuencia_identidad').upsert({ user_id: M1.id, quien_soy: 'C8-secreto' }, { onConflict: 'user_id' }));
  await sembrar('mapa de energía', M1.c.from('frecuencia_mapa_energia').insert({ user_id: M1.id, franjas: [], fecha_diagnostico: new Date().toISOString() }));
  await sembrar('dial', M1.c.from('frecuencia_dial').insert({ user_id: M1.id, fecha: hoy, momento: 'manana', frecuencia: -50 }));
  await sembrar('espejo', M1.c.from('frecuencia_espejo').insert({ user_id: M1.id, fecha: hoy, momento: 'manana', como_me_veo: 'C8-secreto' }));
  const conv = await sembrar('conversación', M1.c.from('frecuencia_conversaciones').insert({ user_id: M1.id, canal: 'texto' }).select('id').single());
  await sembrar('mensaje', M1.c.from('frecuencia_mensajes').insert({ conversacion_id: conv?.id, user_id: M1.id, rol: 'user', contenido: 'C8-secreto' }));
  await sembrar('área', M1.c.from('frecuencia_areas').insert({ user_id: M1.id, area_key: 'salud', nivel_actual: 3 }));
  const obj = await sembrar('objetivo', M1.c.from('frecuencia_objetivos').insert({ user_id: M1.id, titulo: 'C8 objetivo' }).select('id').single());
  const tarea = await sembrar('tarea', M1.c.from('frecuencia_tareas').insert({ user_id: M1.id, objetivo_id: obj?.id, titulo: 'C8 tarea', protocolo: ['paso'] }).select('id').single());
  await sembrar('idea', M1.c.from('frecuencia_ideas').insert({ user_id: M1.id, texto: 'C8-secreto' }));
  await sembrar('revisión', M1.c.from('frecuencia_revisiones').insert({ user_id: M1.id, semana: hoy }));
  await sembrar('imagen', M1.c.from('frecuencia_imagenes').insert({ user_id: M1.id, objetivo_id: obj?.id, prompt: 'C8', estado: 'error' }));
  const crit = await sembrar('criterio', M1.c.from('frecuencia_criterios').insert({ user_id: M1.id, ambito: 'personal', titulo: 'C8 criterio', que_se_decide: 'a', que_entra: 'b', que_no_entra: 'c', costo_si_sale_mal: 'd', reversible: false }).select('id').single());
  const bloque = await sembrar('bloque', M1.c.from('frecuencia_bloques').insert({ user_id: M1.id, tarea_id: tarea?.id, tipo: 'EJECUTAR', inicio: new Date().toISOString(), fin: new Date(Date.now() + 3600e3).toISOString() }).select('id').single());
  await sembrar('evidencia', M1.c.from('frecuencia_evidencia').insert({ user_id: M1.id, bloque_id: bloque?.id, fecha: hoy, texto: 'C8 evidencia', tipo: 'ENTRENAMIENTO_CUMPLIDO' }));
  const comp = await sembrar('compromiso (co-conductor m2)', M1.c.from('frecuencia_compromisos').insert({ user_id: M1.id, co_conductor_id: M2.id, texto_mensual: 'C8 compromiso', mes, avance: 10 }).select('id').single());
  const deleg = await sembrar('delegación a m2', M1.c.from('frecuencia_delegaciones').insert({ tarea_id: tarea?.id, de_user_id: M1.id, a_user_id: M2.id, criterio_id: crit?.id, fecha: hoy }).select('id').single());

  seccion('3. Datos ÍNTIMOS de m1: nadie más los lee (ni líder, ni admin, ni compañero, ni ajeno, ni sin rol)');
  for (const t of TABLAS_INTIMAS) {
    const col = 'user_id';
    check(`dueño lee ${t}`, filas(await M1.c.from(t).select('*').eq(col, M1.id)) >= 1);
    for (const [quien, cu] of [['líder', LI], ['admin', AD], ['compañero m2', M2], ['ajeno', AJ], ['sin rol', SR]]) {
      // Excepciones legítimas por delegación a m2: la tarea y el criterio delegados SÍ los lee m2 (se prueba aparte).
      if (quien === 'compañero m2' && (t === 'frecuencia_tareas' || t === 'frecuencia_criterios')) continue;
      check(`${quien} NO lee ${t} de m1`, filas(await cu.c.from(t).select('*').eq(col, M1.id)) === 0);
    }
  }
  check('storage: nadie ve la carpeta de m1', (await LI.c.storage.from('frecuencia-imagenes').list(M1.id)).data?.length === 0);

  seccion('4. Lo que el LÍDER sí lee (solo lectura) de su equipo, y lo que no');
  for (const t of TABLAS_LIDER_LEE) {
    check(`líder lee ${t} de m1`, filas(await LI.c.from(t).select('*').eq('user_id', M1.id)) >= 1);
    check(`admin NO lee ${t} de m1`, filas(await AD.c.from(t).select('*').eq('user_id', M1.id)) === 0);
    check(`ajeno NO lee ${t} de m1`, filas(await AJ.c.from(t).select('*').eq('user_id', M1.id)) === 0);
    check(`sin rol NO lee ${t} de m1`, filas(await SR.c.from(t).select('*').eq('user_id', M1.id)) === 0);
  }
  check('líder lee las delegaciones de m1', filas(await LI.c.from('frecuencia_delegaciones').select('*').eq('de_user_id', M1.id)) === 1);
  check('líder NO edita bloques de m1', filas(await LI.c.from('frecuencia_bloques').update({ estado: 'CUMPLIDO' }).eq('user_id', M1.id).select('id')) === 0);
  check('líder NO borra evidencia de m1', filas(await LI.c.from('frecuencia_evidencia').delete().eq('user_id', M1.id).select('id')) === 0);
  check('líder NO edita el compromiso de m1', filas(await LI.c.from('frecuencia_compromisos').update({ texto_mensual: 'x' }).eq('id', comp?.id).select('id')) === 0);
  check('líder NO mueve el avance (no es co-conductor)', !!(await LI.c.rpc('frecuencia_actualizar_avance_compromiso', { p_compromiso_id: comp?.id, p_avance: 99 })).error);
  check('líder NO escribe en nombre de m1', !!(await LI.c.from('frecuencia_evidencia').insert({ user_id: M1.id, fecha: hoy, texto: 'colado', tipo: 'X' })).error);

  seccion('5. Delegaciones y co-conductor');
  check('m2 (receptor) lee la tarea delegada', filas(await M2.c.from('frecuencia_tareas').select('id').eq('id', tarea?.id)) === 1);
  check('m2 lee el criterio delegado', filas(await M2.c.from('frecuencia_criterios').select('id').eq('id', crit?.id)) === 1);
  check('m2 NO lee otras cosas de m1 (objetivo)', filas(await M2.c.from('frecuencia_objetivos').select('id').eq('user_id', M1.id)) === 0);
  check('m2 NO edita la tarea', filas(await M2.c.from('frecuencia_tareas').update({ titulo: 'x' }).eq('id', tarea?.id).select('id')) === 0);
  check('m2 NO edita el criterio', filas(await M2.c.from('frecuencia_criterios').update({ titulo: 'x' }).eq('id', crit?.id).select('id')) === 0);
  check('m2 NO marca "volvió"', filas(await M2.c.from('frecuencia_delegaciones').update({ volvio: true }).eq('id', deleg?.id).select('id')) === 0);
  check('m1 (quien delega) SÍ marca "volvió"', filas(await M1.c.from('frecuencia_delegaciones').update({ volvio: true }).eq('id', deleg?.id).select('id')) === 1);
  await M1.c.from('frecuencia_delegaciones').update({ volvio: false }).eq('id', deleg?.id);
  check('ajeno NO ve la delegación', filas(await AJ.c.from('frecuencia_delegaciones').select('id').eq('id', deleg?.id)) === 0);
  check('ajeno NO ve la tarea delegada', filas(await AJ.c.from('frecuencia_tareas').select('id').eq('id', tarea?.id)) === 0);
  check('delegar a quien no comparte equipo se rechaza', !!(await M1.c.from('frecuencia_delegaciones').insert({ tarea_id: tarea?.id, de_user_id: M1.id, a_user_id: AJ.id, criterio_id: crit?.id, fecha: hoy })).error);
  check('delegar sin criterio se rechaza', !!(await M1.c.from('frecuencia_delegaciones').insert({ tarea_id: tarea?.id, de_user_id: M1.id, a_user_id: LI.id, fecha: hoy })).error);
  check('delegarse a sí mismo se rechaza', !!(await M1.c.from('frecuencia_delegaciones').insert({ tarea_id: tarea?.id, de_user_id: M1.id, a_user_id: M1.id, criterio_id: crit?.id, fecha: hoy })).error);
  check('delegar "en nombre de" otra persona se rechaza', !!(await M2.c.from('frecuencia_delegaciones').insert({ tarea_id: tarea?.id, de_user_id: M1.id, a_user_id: M2.id, criterio_id: crit?.id, fecha: hoy })).error);
  check('co-conductor m2 lee el compromiso', filas(await M2.c.from('frecuencia_compromisos').select('id').eq('id', comp?.id)) === 1);
  check('co-conductor NO edita el texto', filas(await M2.c.from('frecuencia_compromisos').update({ texto_mensual: 'x' }).eq('id', comp?.id).select('id')) === 0);
  check('co-conductor NO edita el avance directo', filas(await M2.c.from('frecuencia_compromisos').update({ avance: 1 }).eq('id', comp?.id).select('id')) === 0);
  check('co-conductor SÍ mueve el avance por la función', !(await M2.c.rpc('frecuencia_actualizar_avance_compromiso', { p_compromiso_id: comp?.id, p_avance: 60 })).error);
  check('el avance quedó en 60', (await M1.c.from('frecuencia_compromisos').select('avance').eq('id', comp?.id).single()).data?.avance === 60);
  check('ajeno NO mueve el avance', !!(await AJ.c.rpc('frecuencia_actualizar_avance_compromiso', { p_compromiso_id: comp?.id, p_avance: 5 })).error);

  seccion('6. Nadie escribe en la cuenta de otra persona');
  for (const [t, fila] of [['frecuencia_ideas', { texto: 'colado' }], ['frecuencia_objetivos', { titulo: 'colado' }], ['frecuencia_dial', { fecha: hoy, momento: 'noche', frecuencia: 1 }], ['frecuencia_espejo', { fecha: hoy, momento: 'noche' }], ['frecuencia_areas', { area_key: 'familia', nivel_actual: 1 }]]) {
    check(`m2 NO inserta ${t} con user_id de m1`, !!(await M2.c.from(t).insert({ user_id: M1.id, ...fila })).error);
    check(`ajeno NO inserta ${t} con user_id de m1`, !!(await AJ.c.from(t).insert({ user_id: M1.id, ...fila })).error);
  }
  check('m2 NO edita la idea de m1', filas(await M2.c.from('frecuencia_ideas').update({ texto: 'x' }).eq('user_id', M1.id).select('id')) === 0);
  check('m2 NO borra el objetivo de m1', filas(await M2.c.from('frecuencia_objetivos').delete().eq('user_id', M1.id).select('id')) === 0);

  seccion('7. Contenido del método (knowledge_blocks): todos leen, solo admin escribe');
  check('autenticado lee knowledge_blocks', filas(await M1.c.from('frecuencia_knowledge_blocks').select('clave').limit(1)) === 1);
  check('no admin NO escribe knowledge_blocks', !!(await M1.c.from('frecuencia_knowledge_blocks').insert({ clave: 'c8-colado', valor: {} })).error);
  check('no admin NO edita knowledge_blocks', filas(await M1.c.from('frecuencia_knowledge_blocks').update({ valor: {} }).eq('clave', 'criterio').select('clave')) === 0);
  const kb = await AD.c.from('frecuencia_knowledge_blocks').insert({ clave: 'c8-temporal', valor: { a: 1 } });
  check('admin SÍ escribe knowledge_blocks', !kb.error, kb.error?.message);
  await admin.from('frecuencia_knowledge_blocks').delete().eq('clave', 'c8-temporal');

  seccion('8. Sin sesión (anon): nada');
  const anon = sinSesion();
  for (const t of TODAS_FRECUENCIA) {
    const r = await anon.from(t).select('*').limit(1);
    check(`anon NO lee ${t}`, !!r.error || (r.data?.length ?? 0) === 0);
  }

  seccion('9. Archivos (bucket frecuencia-imagenes): cada persona solo en su carpeta');
  const png = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  const sube = await M1.c.storage.from('frecuencia-imagenes').upload(`${M1.id}/c8.png`, png, { contentType: 'image/png' });
  check('m1 sube a su carpeta', !sube.error, sube.error?.message);
  check('m1 lee su archivo', (await M1.c.storage.from('frecuencia-imagenes').list(M1.id)).data?.length === 1);
  check('m2 NO sube a la carpeta de m1', !!(await M2.c.storage.from('frecuencia-imagenes').upload(`${M1.id}/c8-colado.png`, png, { contentType: 'image/png' })).error);
  check('líder NO ve la carpeta de m1', (await LI.c.storage.from('frecuencia-imagenes').list(M1.id)).data?.length === 0);
  check('admin NO ve la carpeta de m1', (await AD.c.storage.from('frecuencia-imagenes').list(M1.id)).data?.length === 0);
  check('m2 NO descarga el archivo de m1', !!(await M2.c.storage.from('frecuencia-imagenes').download(`${M1.id}/c8.png`)).error);
  await M1.c.storage.from('frecuencia-imagenes').remove([`${M1.id}/c8.png`]);

  seccion('10. Limpieza y RESIDUO CERO');
  const ids = Object.values(cuentas).map((c) => c.id);
  await admin.from('frecuencia_equipos').delete().eq('id', equipoId);
  for (const c of Object.values(cuentas)) {
    await admin.from('personas').delete().eq('user_id', c.id);
    const r = await admin.auth.admin.deleteUser(c.id);
    check(`borrada la cuenta ${c.email.slice(0, 12)}…`, !r.error, r.error?.message);
  }
  const cuenta = async (t, col) => { const r = await admin.from(t).select('*', { count: 'exact', head: true }).in(col, ids); return r.error ? -1 : r.count; };
  for (const t of [...TABLAS_INTIMAS, ...TABLAS_LIDER_LEE, 'frecuencia_equipo_miembros']) check(`residuo 0 en ${t}`, (await cuenta(t, 'user_id')) === 0);
  check('residuo 0 en frecuencia_delegaciones', (await cuenta('frecuencia_delegaciones', 'de_user_id')) === 0 && (await cuenta('frecuencia_delegaciones', 'a_user_id')) === 0);
  check('residuo 0 en frecuencia_equipos', (await cuenta('frecuencia_equipos', 'lider_id')) === 0);
  check('residuo 0 en profiles', (await cuenta('profiles', 'id')) === 0);
  check('residuo 0 en personas', (await cuenta('personas', 'user_id')) === 0);
  let vivos = 0;
  for (const id of ids) if ((await admin.auth.admin.getUserById(id)).data?.user) vivos++;
  check('residuo 0 en auth.users', vivos === 0);
  const restos = (await admin.storage.from('frecuencia-imagenes').list(cuentas.m1.id)).data?.length ?? 0;
  check('residuo 0 en el bucket de imágenes', restos === 0);
  check('no quedó la clave temporal del método', filas(await admin.from('frecuencia_knowledge_blocks').select('clave').in('clave', ['c8-temporal', 'c8-colado'])) === 0);
}

try {
  await main();
} catch (e) {
  fallas++;
  console.error('\nERROR inesperado:', e?.message ?? e);
  // Aun si algo falló a medias, se intenta borrar lo creado.
  for (const c of Object.values(cuentas)) {
    await admin.from('frecuencia_equipos').delete().eq('lider_id', c.id).catch?.(() => {});
    await admin.from('personas').delete().eq('user_id', c.id).catch?.(() => {});
    await admin.auth.admin.deleteUser(c.id).catch?.(() => {});
  }
}
console.log(`\nC8: ${total - fallas}/${total} OK${fallas ? ` — ${fallas} FALLA(S)` : ''}`);
process.exit(fallas ? 1 : 0);
