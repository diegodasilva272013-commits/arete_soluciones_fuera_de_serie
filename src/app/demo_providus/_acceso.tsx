'use client';

/**
 * DEMO PROVIDUS — pantallas de ingreso. A la izquierda el video del logo con las cargas de
 * ejemplo entrando en vivo; a la derecha el formulario animado (modern-animated-sign-in) en
 * bronce oscuro. Dos variantes:
 *  - LoginPromotora: usuario + clave de cada promotora.
 *  - LoginAdmin: una sola clave, para la central y el panel de administración.
 */

import { useState } from 'react';
import { AnimatedForm } from '@/components/ui/modern-animated-sign-in';
import { PanelMarca } from './_panel';

export function PantallaAcceso({ children }: { children: React.ReactNode }) {
  return (
    <div className="lg:grid lg:min-h-dvh lg:grid-cols-[minmax(0,1.15fr)_minmax(500px,0.85fr)]">
      <aside className="relative aspect-[5/4] w-full lg:sticky lg:top-0 lg:aspect-auto lg:h-dvh">
        <PanelMarca />
      </aside>
      <main className="relative -mt-8 flex w-full flex-col items-center overflow-hidden rounded-t-[32px] bg-[var(--pv-bronce-950)] px-6 pb-12 pt-10 shadow-[inset_0_1px_0_rgba(227,197,142,0.22)] lg:mt-0 lg:min-h-dvh lg:justify-center lg:rounded-none lg:px-14 lg:py-14 lg:shadow-[inset_1px_0_0_rgba(227,197,142,0.16)]">
        <div className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full bg-[radial-gradient(closest-side,rgba(227,197,142,0.14),transparent)]" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-[420px] w-[420px] rounded-full bg-[radial-gradient(closest-side,rgba(201,75,39,0.13),transparent)]" aria-hidden="true" />
        <div className="relative flex w-full flex-col items-center">{children}</div>
      </main>
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

function Cambio({ href, texto }: { href: string; texto: string }) {
  return (
    <a href={href} className="mt-3 inline-flex min-h-11 items-center gap-2 text-[13px] font-medium text-[#b4a892] transition-colors hover:text-[#e3c58e]">
      {texto}
      <span aria-hidden="true">&rarr;</span>
    </a>
  );
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
    <PantallaAcceso>
      <AnimatedForm
        header="Ingreso de promotoras"
        subHeader="Entrá con tu usuario y tu clave. Cada carga queda a tu nombre."
        fields={[
          { label: 'Usuario', name: 'usuario', type: 'text', required: true, placeholder: 'tu.usuario', autoComplete: 'username', onChange: (e) => setUsuario(e.target.value) },
          { label: 'Clave', name: 'clave', type: 'password', required: true, placeholder: '••••••', autoComplete: 'current-password', onChange: (e) => setClave(e.target.value) },
        ]}
        submitButton="Ingresar"
        loading={cargando}
        errorField={error}
        onSubmit={() => void entrar()}
      />
      <Cambio href="/demo_providus/admin" texto="Soy del equipo de Providus" />
    </PantallaAcceso>
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
    <PantallaAcceso>
      <AnimatedForm
        header={titulo}
        subHeader="Acceso para el equipo de Providus. Pedí la clave de administración."
        fields={[{ label: 'Clave de administración', name: 'clave', type: 'password', required: true, placeholder: '••••••••', autoComplete: 'current-password', onChange: (e) => setClave(e.target.value) }]}
        submitButton="Ingresar"
        loading={cargando}
        errorField={error}
        onSubmit={() => void entrar()}
      />
      <Cambio href="/demo_providus" texto="Soy promotora" />
    </PantallaAcceso>
  );
}
