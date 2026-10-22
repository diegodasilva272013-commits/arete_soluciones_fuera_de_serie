'use client';

/**
 * DEMO PROVIDUS — pantallas de ingreso, armadas como el demo de modern-animated-sign-in:
 * izquierda con el Ripple y los íconos que giran alrededor de "Providus" (y abajo las cargas
 * de ejemplo entrando en vivo), derecha con el formulario animado. En el celular la izquierda
 * se reemplaza por el video del logo. Dos variantes:
 *  - LoginPromotora: usuario + clave de cada promotora.
 *  - LoginAdmin: una sola clave, para la central y el panel de administración.
 */

import { useState } from 'react';
import { AuthTabs, Ripple, TechOrbitDisplay } from '@/components/ui/modern-animated-sign-in';
import { CargasEnVivo, ICONOS_ORBITA } from './_panel';

function Pantalla({ children }: { children: React.ReactNode }) {
  return (
    <div className="pv-login dark bg-background text-foreground">
      {/* Celular: la misma órbita, achicada, y la última carga abajo */}
      <div className="lg:hidden">
        <div className="relative h-[330px] w-full overflow-hidden bg-[#21190f]">
          <div className="absolute left-1/2 top-1/2 h-[680px] w-[720px] -translate-x-1/2 -translate-y-1/2 scale-[0.48] sm:scale-[0.6]">
            <Ripple mainCircleSize={100} className="max-w-full" />
            <TechOrbitDisplay iconsArray={ICONOS_ORBITA} text="Providus" textClassName="text-9xl" />
          </div>
        </div>
        <div className="flex justify-center bg-[#21190f] px-5 pb-6">
          <CargasEnVivo />
        </div>
      </div>
      <section className="flex max-lg:justify-center">
        {/* Izquierda */}
        <span className="relative flex h-dvh w-1/2 flex-col bg-[#21190f] shadow-[inset_-1px_0_0_rgba(227,197,142,0.14)] max-lg:hidden">
          <span className="relative flex-1">
            <Ripple mainCircleSize={100} className="max-w-full" />
            <TechOrbitDisplay iconsArray={ICONOS_ORBITA} text="Providus" textClassName="text-8xl xl:text-9xl" />
          </span>
          <span className="flex justify-center px-10 pb-10">
            <CargasEnVivo />
          </span>
        </span>
        {/* Derecha */}
        <span className="flex w-1/2 flex-col items-center justify-center max-lg:w-full max-lg:px-[10%] lg:h-dvh">{children}</span>
      </section>
    </div>
  );
}

const mensaje = (err: unknown) =>
  err instanceof TypeError ? `No se pudo conectar con el servidor (${err.message}).` : err instanceof Error ? err.message : String(err);

async function pedirIngreso(url: string, cuerpo: Record<string, string>) {
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cuerpo) });
  const d = (await r.json().catch(() => null)) as { ok?: boolean; detalle?: string } | null;
  if (!r.ok || !d?.ok) throw new Error(d?.detalle || `El servidor respondió ${r.status}.`);
}

/** Usuario + clave de la promotora. `alListo` se llama cuando el servidor ya dejó la sesión abierta. */
export function LoginPromotora({ alListo }: { alListo: () => void }) {
  const [usuario, setUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function entrar() {
    setCargando(true);
    setError(null);
    try {
      await pedirIngreso('/api/demo-providus/auth/login', { usuario, clave });
      alListo();
    } catch (err) {
      setError(mensaje(err));
    } finally {
      setCargando(false);
    }
  }

  return (
    <Pantalla>
      <AuthTabs
        formFields={{
          header: 'Ingreso de promotoras',
          subHeader: 'Entrá con tu usuario y tu clave. Cada carga queda a tu nombre.',
          fields: [
            { label: 'Usuario', name: 'usuario', required: true, type: 'text', placeholder: 'tu.usuario', autoComplete: 'username', onChange: (e) => setUsuario(e.target.value) },
            { label: 'Clave', name: 'clave', required: true, type: 'password', placeholder: 'Tu clave', autoComplete: 'current-password', onChange: (e) => setClave(e.target.value) },
          ],
          submitButton: 'Ingresar',
          textVariantButton: 'Soy del equipo de Providus',
        }}
        goTo={() => { window.location.href = '/demo_providus/admin'; }}
        handleSubmit={() => void entrar()}
        loading={cargando}
        errorField={error}
      />
    </Pantalla>
  );
}

/** Clave de administración (central y panel). */
export function LoginAdmin({ titulo, alListo }: { titulo: string; alListo: () => void }) {
  const [clave, setClave] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function entrar() {
    setCargando(true);
    setError(null);
    try {
      await pedirIngreso('/api/demo-providus/auth/admin', { clave });
      alListo();
    } catch (err) {
      setError(mensaje(err));
    } finally {
      setCargando(false);
    }
  }

  return (
    <Pantalla>
      <AuthTabs
        formFields={{
          header: titulo,
          subHeader: 'Acceso para el equipo de Providus. Pedí la clave de administración.',
          fields: [{ label: 'Clave de administración', name: 'clave', required: true, type: 'password', placeholder: 'Clave', autoComplete: 'current-password', onChange: (e) => setClave(e.target.value) }],
          submitButton: 'Ingresar',
          textVariantButton: 'Soy promotora',
        }}
        goTo={() => { window.location.href = '/demo_providus'; }}
        handleSubmit={() => void entrar()}
        loading={cargando}
        errorField={error}
      />
    </Pantalla>
  );
}
