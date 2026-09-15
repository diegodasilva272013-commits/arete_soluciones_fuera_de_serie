'use client';

import { useState } from 'react';
import { KeyRound, X, Check } from 'lucide-react';

export function PasswordUserButton({
  userId,
  userName,
}: {
  userId: string;
  userName: string | null;
}) {
  const [open,     setOpen]     = useState(false);
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [done,     setDone]     = useState(false);

  function reset() { setPassword(''); setConfirm(''); setError(''); setDone(false); }

  async function save() {
    if (password !== confirm) { setError('Las contraseñas no coinciden'); return; }
    if (password.length < 6)  { setError('Mínimo 6 caracteres'); return; }
    setLoading(true);
    setError('');
    const res = await fetch('/api/admin/users/set-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: userId, password }),
    });
    const json = await res.json();
    if (!res.ok) { setError(json.error ?? 'Error'); setLoading(false); return; }
    setDone(true);
    setTimeout(() => { setOpen(false); reset(); }, 1500);
  }

  return (
    <>
      <button
        onClick={() => { reset(); setOpen(true); }}
        title="Cambiar contraseña"
        className="grid h-7 w-7 place-items-center rounded border border-blue-900/40 bg-blue-950/20 text-blue-400 hover:border-blue-700 hover:bg-blue-900/30 transition"
      >
        <KeyRound className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111] p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-bold text-brand-text">
                Cambiar contraseña — {userName ?? 'usuario'}
              </h2>
              <button onClick={() => setOpen(false)} className="text-brand-muted hover:text-brand-text transition">
                <X className="h-4 w-4" />
              </button>
            </div>

            {done ? (
              <div className="flex items-center gap-3 rounded-xl border border-green-500/30 bg-green-500/5 p-4">
                <Check className="h-5 w-5 text-green-400 shrink-0" />
                <p className="text-sm text-green-300">Contraseña actualizada.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-brand-muted">Nueva contraseña directa. No se necesita la anterior.</p>
                <div>
                  <label className="mb-1 block text-xs text-brand-muted">Nueva contraseña</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-brand-text placeholder-white/25 focus:outline-none focus:border-brand-gold/50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-brand-muted">Confirmar contraseña</label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="Repetir contraseña"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-brand-text placeholder-white/25 focus:outline-none focus:border-brand-gold/50"
                  />
                </div>
                {error && <p className="text-xs text-red-400">{error}</p>}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={save}
                    disabled={loading || !password || !confirm}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-gold py-2.5 text-sm font-bold text-black disabled:opacity-50 hover:opacity-90 transition"
                  >
                    <KeyRound className="h-4 w-4" />
                    {loading ? 'Guardando...' : 'Cambiar contraseña'}
                  </button>
                  <button onClick={() => setOpen(false)} className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-brand-muted hover:text-brand-text transition">
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
