'use client';

import { useState } from 'react';
import { Pencil, X, Check } from 'lucide-react';

export function EditUserButton({
  userId,
  currentName,
  currentEmail,
}: {
  userId: string;
  currentName: string | null;
  currentEmail: string | null;
}) {
  const [open,    setOpen]    = useState(false);
  const [name,    setName]    = useState(currentName  ?? '');
  const [email,   setEmail]   = useState(currentEmail ?? '');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [done,    setDone]    = useState(false);

  async function save() {
    setLoading(true);
    setError('');
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: userId, full_name: name, email }),
    });
    const json = await res.json();
    if (!res.ok) { setError(json.error ?? 'Error'); setLoading(false); return; }
    setDone(true);
    setTimeout(() => { setOpen(false); setDone(false); }, 1200);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Editar nombre/email"
        className="grid h-7 w-7 place-items-center rounded border border-[rgba(212,175,55,0.18)] bg-[#0d0d0d] text-brand-muted hover:border-brand-gold hover:text-brand-gold transition"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111] p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-bold text-brand-text">Editar usuario</h2>
              <button onClick={() => setOpen(false)} className="text-brand-muted hover:text-brand-text transition">
                <X className="h-4 w-4" />
              </button>
            </div>

            {done ? (
              <div className="flex items-center gap-3 rounded-xl border border-green-500/30 bg-green-500/5 p-4">
                <Check className="h-5 w-5 text-green-400 shrink-0" />
                <p className="text-sm text-green-300">Datos actualizados.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs text-brand-muted">Nombre completo</label>
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-brand-text placeholder-white/25 focus:outline-none focus:border-brand-gold/50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-brand-muted">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-brand-text placeholder-white/25 focus:outline-none focus:border-brand-gold/50"
                  />
                </div>
                {error && <p className="text-xs text-red-400">{error}</p>}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={save}
                    disabled={loading}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-gold py-2.5 text-sm font-bold text-black disabled:opacity-50 hover:opacity-90 transition"
                  >
                    <Check className="h-4 w-4" />
                    {loading ? 'Guardando...' : 'Guardar'}
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
