import { describe, expect, it } from 'vitest';
import { claveCorrecta, firmar, hashearClave, verificar } from './sesion';

const SECRETO = 'secreto-de-prueba-0123456789';

describe('cookie de sesión', () => {
  it('una sesión firmada se verifica y devuelve lo mismo', () => {
    const exp = Date.now() + 60_000;
    const v = firmar({ t: 'p', id: 'abc', exp }, SECRETO);
    expect(verificar(v, Date.now(), SECRETO)).toEqual({ t: 'p', id: 'abc', exp });
    const a = firmar({ t: 'a', exp }, SECRETO);
    expect(verificar(a, Date.now(), SECRETO)).toEqual({ t: 'a', exp });
  });
  it('rechaza una cookie alterada, con otra firma o vencida', () => {
    const exp = Date.now() + 60_000;
    const v = firmar({ t: 'p', id: 'abc', exp }, SECRETO);
    const [cuerpo, firma] = v.split('.');
    const otroCuerpo = Buffer.from(JSON.stringify({ t: 'a', exp })).toString('base64url');
    expect(verificar(`${otroCuerpo}.${firma}`, Date.now(), SECRETO)).toBeNull(); // quiere pasar de promotora a admin
    expect(verificar(`${cuerpo}.${firma.slice(0, -2)}xx`, Date.now(), SECRETO)).toBeNull();
    expect(verificar(v, Date.now(), 'otro-secreto-distinto-123456')).toBeNull();
    expect(verificar(v, exp + 1, SECRETO)).toBeNull();
    expect(verificar(undefined, Date.now(), SECRETO)).toBeNull();
    expect(verificar('basura', Date.now(), SECRETO)).toBeNull();
  });
});

describe('claves de promotoras', () => {
  it('la clave correcta pasa y la incorrecta no', async () => {
    const h = await hashearClave('laura2026');
    expect(h.startsWith('scrypt$')).toBe(true);
    expect(h).not.toContain('laura2026');
    expect(await claveCorrecta('laura2026', h)).toBe(true);
    expect(await claveCorrecta('laura2027', h)).toBe(false);
    expect(await claveCorrecta('', h)).toBe(false);
  });
  it('la misma clave da hashes distintos (sal propia)', async () => {
    expect(await hashearClave('igual')).not.toBe(await hashearClave('igual'));
  });
  it('un valor guardado inválido nunca autentica', async () => {
    expect(await claveCorrecta('x', 'texto-plano')).toBe(false);
    expect(await claveCorrecta('x', 'scrypt$$')).toBe(false);
  });
});
