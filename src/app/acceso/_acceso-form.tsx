'use client';

import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { loginAction } from '../(auth)/actions';
import type { AuthActionState } from '../(auth)/types';

const initial: AuthActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-gold w-full justify-center" disabled={pending}>
      {pending ? 'Entrando…' : 'Entrar'}
    </button>
  );
}

export function AccesoForm() {
  const [state, formAction] = useFormState(loginAction, initial);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label className="mb-1 block text-xs uppercase tracking-widest text-white/50">
          Email
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="tu@email.com"
            className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white placeholder-white/40 transition-colors focus:border-[var(--azul)] focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs uppercase tracking-widest text-white/50">
          Contraseña
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-10 pr-10 text-sm text-white placeholder-white/40 transition-colors focus:border-[var(--azul)] focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 transition-colors hover:text-white focus:outline-none"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {state.error && (
        <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {state.error}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
