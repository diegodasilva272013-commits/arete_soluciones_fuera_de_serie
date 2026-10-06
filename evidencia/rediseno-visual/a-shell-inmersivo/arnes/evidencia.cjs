// Evidencia PR (a): shell inmersivo + fondo vivo + dock.
// Uso: node evidencia.cjs <baseRama> <baseMain> <outDir>
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const [BASE = 'http://localhost:3000', BASE_MAIN = 'http://localhost:3001', OUT = './out'] = process.argv.slice(2);
const MOCK = 'http://127.0.0.1:54399';
const PASS = 'prueba-local';
const DESK = { width: 1440, height: 900 };
const MOVIL = { width: 390, height: 844 };
const log = [];
const t0 = {};
function marca(video, texto) {
  const s = ((Date.now() - t0[video]) / 1000).toFixed(1);
  const mm = String(Math.floor(s / 60)).padStart(1, '0');
  const ss = String(Math.floor(s % 60)).padStart(2, '0');
  log.push(`${video}\t${mm}:${ss}\t${texto}`);
  console.log(`[${video} ${mm}:${ss}] ${texto}`);
}
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
fs.mkdirSync(path.join(OUT, 'video'), { recursive: true });
fs.mkdirSync(path.join(OUT, 'capturas'), { recursive: true });
fs.mkdirSync(path.join(OUT, 'antes-despues'), { recursive: true });

async function nuevoContexto(browser, nombre, viewport, extra = {}) {
  const ctx = await browser.newContext({
    viewport,
    deviceScaleFactor: 1,
    recordVideo: nombre ? { dir: path.join(OUT, 'video', '_tmp'), size: viewport } : undefined,
    ...extra,
  });
  if (nombre) t0[nombre] = Date.now();
  return ctx;
}
async function cerrarVideo(ctx, page, nombre) {
  const v = page.video();
  await ctx.close();
  if (v) fs.renameSync(await v.path(), path.join(OUT, 'video', `${nombre}.webm`));
}
async function login(page, base, email) {
  await page.goto(`${base}/login`);
  await page.waitForLoadState('networkidle');
  await esperar(2300); // el SplashLoader de la plataforma tapa el form ~1.8s + fade
  await page.fill('input[name=email]', email);
  await page.fill('input[name=password]', PASS);
  await Promise.all([page.waitForURL(/\/dashboard/, { timeout: 30000 }), page.click('button[type=submit]')]);
}
async function dial(valor) {
  await fetch(`${MOCK}/__mock/dial?valor=${valor}`);
}
function check(cond, texto) {
  const r = `${cond ? 'OK  ' : 'FALLA'} ${texto}`;
  log.push(`CHECK\t${r}`);
  console.log(r);
  if (!cond) process.exitCode = 1;
}

(async () => {
  const browser = await chromium.launch();
  await dial(40);

  // ── VIDEO 1: acceso (sin sesión, student, setter) + navegación desktop ──
  {
    const V = '01-acceso-y-navegacion-desktop';
    const ctx = await nuevoContexto(browser, V, DESK);
    const page = await ctx.newPage();

    marca(V, 'Sin sesión: abre /frecuencia');
    await page.goto(`${BASE}/frecuencia`);
    await page.waitForURL(/\/login/);
    check(/\/login\?redirectTo=%2Ffrecuencia|\/login\?redirectTo=\/frecuencia/.test(page.url()), `sin sesión → ${page.url().replace(BASE, '')}`);
    await esperar(1800);

    marca(V, 'Login como student');
    await login(page, BASE, 'student@prueba.local');
    await esperar(1200);
    check(!(await page.locator('aside a[href="/frecuencia"]').count()), 'student: el sidebar no muestra Frecuencia');
    marca(V, 'Student abre /frecuencia por URL');
    await page.goto(`${BASE}/frecuencia`);
    await page.waitForLoadState('networkidle');
    check(new URL(page.url()).pathname === '/dashboard', `student → rebota a ${new URL(page.url()).pathname}`);
    await esperar(1800);

    await ctx.clearCookies();
    marca(V, 'Login como setter');
    await login(page, BASE, 'setter@prueba.local');
    await esperar(1500);
    const linkSidebar = page.locator('aside a[href="/frecuencia"]');
    check((await linkSidebar.count()) === 1, 'setter: el sidebar muestra el link a Frecuencia');
    marca(V, 'Click en "Frecuencia" del sidebar de la plataforma');
    await linkSidebar.click();
    await page.waitForURL(/\/frecuencia\/dial/, { timeout: 30000 });
    check(true, `sidebar → ${new URL(page.url()).pathname}`);
    check((await page.locator('aside').count()) === 0, 'dentro de Frecuencia no hay sidebar de la plataforma');
    check((await page.locator('header:has-text("Frecuencia")').count()) === 1, 'header propio de Frecuencia');
    check((await page.locator('header input, header [aria-label="Cambiar tema"]').count()) === 0, 'no está la barra superior de la plataforma (buscador, tema)');
    marca(V, 'Pantalla completa: fondo vivo + header mínimo + dock');
    await esperar(3500);

    // Magnificación del dock: barrido del puntero sobre el dock
    marca(V, 'Magnificación del dock (barrido del puntero)');
    const dockBox = await page.locator('nav[aria-label="Navegación de Frecuencia"]').boundingBox();
    const y = dockBox.y + dockBox.height / 2;
    for (let x = dockBox.x - 40; x <= dockBox.x + dockBox.width + 40; x += 10) {
      await page.mouse.move(x, y);
      await esperar(12);
    }
    for (let x = dockBox.x + dockBox.width + 40; x >= dockBox.x + dockBox.width * 0.3; x -= 10) {
      await page.mouse.move(x, y);
      await esperar(12);
    }
    await page.screenshot({ path: path.join(OUT, 'capturas', 'desktop-dock-magnificado.png') });
    await esperar(600);

    for (const [href, nombre] of [['/frecuencia/hoy', 'Hoy'], ['/frecuencia/semana', 'Semana'], ['/frecuencia/areas', 'Áreas'], ['/frecuencia/dial', 'Dial']]) {
      marca(V, `Dock → ${nombre} (transición: sale con blur, entra en cascada)`);
      await page.click(`nav[aria-label="Navegación de Frecuencia"] a[href="${href}"]`);
      await page.waitForURL(new RegExp(href + '$'));
      await esperar(1900);
    }
    const activo = await page.locator('nav[aria-label="Navegación de Frecuencia"] a[aria-current="page"]').getAttribute('href');
    check(activo === '/frecuencia/dial', `ítem activo del dock = ${activo}`);

    marca(V, 'Click en "Salir a la plataforma"');
    await page.click('header a[href="/dashboard"]');
    await page.waitForURL(/\/dashboard$/);
    check(new URL(page.url()).pathname === '/dashboard', 'Salir a la plataforma → /dashboard');
    check((await page.locator('aside a[href="/frecuencia"]').count()) === 1, 'de vuelta en la plataforma con su sidebar');
    await esperar(2000);
    await cerrarVideo(ctx, page, V);
  }

  // ── VIDEO 2: el fondo sintoniza con el Dial ──
  {
    const V = '02-fondo-sintoniza-con-el-dial';
    const ctx = await nuevoContexto(browser, V, DESK);
    const page = await ctx.newPage();
    await login(page, BASE, 'setter@prueba.local');
    for (const [valor, nombre] of [[-95, 'escasez'], [0, 'medio'], [95, 'abundancia']]) {
      await dial(valor);
      marca(V, `Dial de hoy = ${valor} (${nombre}) → /frecuencia/hoy`);
      await page.goto(`${BASE}/frecuencia/hoy`);
      await page.waitForLoadState('networkidle');
      await esperar(3200);
      const s = await page.locator('[data-sintonia]').getAttribute('data-sintonia');
      check(Math.abs(Number(s) - (valor + 100) / 200) < 0.01, `data-sintonia=${s} para dial ${valor}`);
      await page.screenshot({ path: path.join(OUT, 'capturas', `desktop-fondo-${nombre}.png`) });
    }
    // En vivo: arrastrar la aguja y guardar → el fondo cambia sin recargar
    await dial(40);
    await page.goto(`${BASE}/frecuencia/dial`);
    await page.waitForLoadState('networkidle');
    await esperar(2600);
    const antes = await page.locator('[data-sintonia]').getAttribute('data-sintonia');
    marca(V, `En vivo: /frecuencia/dial (fondo ${antes}); arrastro la aguja a escasez y guardo`);
    const aguja = page.locator('[role=slider]');
    const ab = await aguja.boundingBox();
    await page.mouse.move(ab.x + ab.width / 2, ab.y + ab.height / 2);
    await page.mouse.down();
    for (let i = 1; i <= 30; i++) { await page.mouse.move(ab.x + ab.width / 2 - i * 20, ab.y + ab.height / 2); await esperar(16); }
    await page.mouse.up();
    await esperar(1200);
    await page.evaluate(() => { window.__sinRecarga = true; });
    await page.click('button:has-text("Guardar")');
    await esperar(3500);
    const despues = await page.locator('[data-sintonia]').getAttribute('data-sintonia');
    const sinRecarga = await page.evaluate(() => window.__sinRecarga === true);
    check(Number(despues) < 0.2 && sinRecarga, `en vivo: fondo ${antes} → ${despues} al guardar, sin recargar la página (${sinRecarga ? 'misma página' : 'HUBO RECARGA'})`);
    await page.screenshot({ path: path.join(OUT, 'capturas', 'desktop-dial-guardado-escasez.png') });
    // Datos del servidor se refrescan tras una server action con revalidatePath
    // (regresión del revisor: el contexto del router congelado los dejaba viejos).
    await dial(40);
    await page.goto(`${BASE}/frecuencia/hoy`);
    await page.waitForLoadState('networkidle');
    await esperar(2600);
    const valorAntes = (await page.locator('main, body').first().innerText()).match(/[+-]\d+\s*\n?\s*(ABUNDANCIA|ESCASEZ) FM/i)?.[0];
    await dial(-60); // otro dial en el "servidor"
    marca(V, 'Refresco tras server action: estaciono una idea en Hoy (revalidatePath) con el dial cambiado en el servidor');
    await page.evaluate(() => { window.__sinRecarga = true; });
    await page.fill('input[placeholder="Qué se te cruzó"], textarea[placeholder="Qué se te cruzó"]', 'Idea de prueba');
    await page.click('button:has-text("Estacionar")');
    await esperar(3000);
    const valorDespues = (await page.locator('body').innerText()).match(/[+-]\d+\s*\n?\s*(ABUNDANCIA|ESCASEZ) FM/i)?.[0];
    const sigue = await page.evaluate(() => window.__sinRecarga === true);
    check(/-60/.test(valorDespues || '') && sigue, `server action refresca la pantalla: dial mini "${(valorAntes||'').replace(/\s+/g,' ')}" → "${(valorDespues||'').replace(/\s+/g,' ')}" sin recargar`);
    await dial(40);
    await cerrarVideo(ctx, page, V);
  }

  // ── VIDEO 3: flujos (onboarding y cierre): sin dock, barra fija abajo ──
  {
    const V = '03-flujos-sin-dock-barra-fija-movil';
    const ctx = await nuevoContexto(browser, V, MOVIL, { isMobile: true, hasTouch: true });
    const page = await ctx.newPage();
    await login(page, BASE, 'nuevo@prueba.local');
    marca(V, 'Setter sin onboarding entra a /frecuencia → onboarding');
    await page.goto(`${BASE}/frecuencia`);
    await page.waitForURL(/onboarding/);
    await esperar(2500);
    check((await page.locator('nav[aria-label="Navegación de Frecuencia"]').count()) === 0, 'onboarding: sin dock');
    const barra = page.locator('button:has-text("Siguiente")').last();
    const bb = await barra.boundingBox();
    check(bb && bb.y + bb.height > MOVIL.height - 70, `onboarding: el CTA está en la barra fija de abajo (y=${bb && Math.round(bb.y)})`);
    await page.screenshot({ path: path.join(OUT, 'capturas', 'movil-onboarding-barra-fija.png') });
    marca(V, 'Scroll: la barra queda fija y no tapa contenido');
    await page.mouse.wheel(0, 2000);
    await esperar(1500);
    await page.screenshot({ path: path.join(OUT, 'capturas', 'movil-onboarding-scroll-final.png') });
    await ctx.clearCookies();
    await login(page, BASE, 'setter@prueba.local');
    marca(V, 'Cierre del día (flujo): sin dock, barra fija');
    await page.goto(`${BASE}/frecuencia/cierre`);
    await page.waitForLoadState('networkidle');
    await esperar(2500);
    check((await page.locator('nav[aria-label="Navegación de Frecuencia"]').count()) === 0, 'cierre: sin dock');
    await page.screenshot({ path: path.join(OUT, 'capturas', 'movil-cierre-barra-fija.png') });
    marca(V, 'Semana → "Armar mi semana": la propuesta es un flujo (sin dock, una sola barra fija)');
    await page.goto(`${BASE}/frecuencia/semana`);
    await page.waitForLoadState('networkidle');
    await esperar(2800);
    await page.tap('button:has-text("Armar mi semana")');
    await esperar(3000);
    const barras = await page.locator('[class*="barraFija_"]:not([class*="Interior"])').count();
    const gb = await page.locator('button:has-text("Guardar esta semana")').boundingBox();
    const arriba = gb && (await page.evaluate(([x, y]) => document.elementFromPoint(x, y)?.textContent, [gb.x + gb.width / 2, gb.y + gb.height / 2]));
    check(barras === 1 && /guardar esta semana/i.test(arriba || '') && (await page.locator('nav[aria-label="Navegación de Frecuencia"]').count()) === 0, `semana con propuesta: ${barras} barra fija, sin dock, "Guardar esta semana" recibe el toque`);
    await page.screenshot({ path: path.join(OUT, 'capturas', 'movil-semana-propuesta.png') });
    await page.tap('button:has-text("Descartar")');
    await esperar(1800);
    check((await page.locator('nav[aria-label="Navegación de Frecuencia"]').count()) === 1, 'semana: al descartar la propuesta vuelve el dock');
    marca(V, 'Volver a Hoy: vuelve el dock');
    await page.goto(`${BASE}/frecuencia/hoy`);
    await page.waitForLoadState('networkidle');
    await esperar(2000);
    check((await page.locator('nav[aria-label="Navegación de Frecuencia"]').count()) === 1, 'hoy: con dock');
    await cerrarVideo(ctx, page, V);
  }

  // ── VIDEO 4: navegación móvil 390×844 ──
  {
    const V = '04-navegacion-movil';
    const ctx = await nuevoContexto(browser, V, MOVIL, { isMobile: true, hasTouch: true });
    const page = await ctx.newPage();
    await login(page, BASE, 'setter@prueba.local');
    marca(V, 'Móvil: /frecuencia');
    await page.goto(`${BASE}/frecuencia`);
    await page.waitForURL(/\/frecuencia\/dial/);
    await esperar(2500);
    for (const [href, nombre] of [['/frecuencia/hoy', 'Hoy'], ['/frecuencia/semana', 'Semana'], ['/frecuencia/areas', 'Áreas'], ['/frecuencia/dial', 'Dial']]) {
      marca(V, `Dock → ${nombre}`);
      await page.tap(`nav[aria-label="Navegación de Frecuencia"] a[href="${href}"]`);
      await page.waitForURL(new RegExp(href + '$'));
      await esperar(1800);
    }
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    check(overflow <= 0, `móvil: sin scroll horizontal (sobra ${overflow}px)`);
    marca(V, 'Salir');
    await page.tap('header a[href="/dashboard"]');
    await page.waitForURL(/\/dashboard$/);
    await esperar(1500);
    await cerrarVideo(ctx, page, V);
  }

  // ── Capturas por pantalla, móvil y desktop ──
  for (const [vp, nombreVp] of [[MOVIL, 'movil'], [DESK, 'desktop']]) {
    const ctx = await browser.newContext({ viewport: vp, isMobile: vp === MOVIL, hasTouch: vp === MOVIL });
    const page = await ctx.newPage();
    await login(page, BASE, 'setter@prueba.local');
    for (const ruta of ['dial', 'hoy', 'semana', 'areas', 'objetivos', 'cierre']) {
      await page.goto(`${BASE}/frecuencia/${ruta}`);
      await page.waitForLoadState('networkidle');
      await esperar(2800); // splash de la plataforma (layout raíz) en cada carga completa
      await page.screenshot({ path: path.join(OUT, 'capturas', `${nombreVp}-${ruta}.png`) });
      if (ruta === 'dial' || ruta === 'hoy') {
        // ¿el dock tapa contenido? último elemento de la pantalla vs. borde superior del dock (con scroll al final)
        await page.mouse.wheel(0, 5000);
        await esperar(500);
        const r = await page.evaluate(() => {
          const dock = document.querySelector('nav[aria-label="Navegación de Frecuencia"]')?.getBoundingClientRect();
          const items = [...document.querySelectorAll('main, [class*="pantalla"] *')].filter((e) => e.offsetParent && e.children.length === 0);
          const ultimo = Math.max(...items.map((e) => e.getBoundingClientRect().bottom));
          return { dockTop: dock?.top, ultimo };
        });
        check(r.ultimo <= r.dockTop + 1, `${nombreVp}/${ruta}: con scroll al final el contenido termina (${Math.round(r.ultimo)}) antes del dock (${Math.round(r.dockTop)})`);
      }
    }
    await ctx.close();
  }

  // ── prefers-reduced-motion: fondo estático ──
  {
    const ctx = await browser.newContext({ viewport: DESK, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await login(page, BASE, 'setter@prueba.local');
    await page.goto(`${BASE}/frecuencia/hoy`);
    await page.waitForLoadState('networkidle');
    await esperar(1000);
    const canvas = await page.locator('[data-sintonia] canvas').count();
    const anim = await page.evaluate(() => [...document.querySelectorAll('[data-sintonia] *')].map((e) => getComputedStyle(e).animationName).filter((a) => a && a !== 'none'));
    check(canvas === 0 && anim.length === 0, `reduced-motion: sin WebGL (${canvas} canvas) y sin animación de grano (${anim.join(',') || 'ninguna'})`);
    await page.screenshot({ path: path.join(OUT, 'capturas', 'desktop-reduced-motion.png') });
    await ctx.close();
  }

  // ── Antes / después de la plataforma (main vs rama) ──
  for (const [vp, nombreVp] of [[DESK, 'desktop'], [MOVIL, 'movil']]) {
    for (const [base, cual] of [[BASE_MAIN, 'antes'], [BASE, 'despues']]) {
      const ctx = await browser.newContext({ viewport: vp, isMobile: vp === MOVIL, hasTouch: vp === MOVIL, reducedMotion: 'reduce' });
      const page = await ctx.newPage();
      await login(page, base, 'setter@prueba.local');
      for (const ruta of ['dashboard', 'leads']) {
        await page.goto(`${base}/${ruta}`);
        await page.waitForLoadState('networkidle');
        await page.evaluate(() => document.querySelectorAll('[class*="splash"], [data-splash]').forEach((e) => e.remove()));
        await esperar(2500);
        await page.screenshot({ path: path.join(OUT, 'antes-despues', `${ruta}-${nombreVp}-${cual}.png`), fullPage: true });
      }
      await ctx.close();
    }
  }

  await browser.close();
  fs.writeFileSync(path.join(OUT, 'log.tsv'), log.join('\n') + '\n');
  fs.rmSync(path.join(OUT, 'video', '_tmp'), { recursive: true, force: true });
})().catch((e) => {
  console.error(e);
  fs.writeFileSync(path.join(OUT, 'log.tsv'), log.join('\n') + '\n');
  process.exit(1);
});
