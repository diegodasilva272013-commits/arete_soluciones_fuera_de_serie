'use client';

import { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import {
  RefreshCw, Pencil, KeyRound, Trash2, X, Check, AlertTriangle,
} from 'lucide-react';

type User = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  created_at: string;
};

const ROLES = ['admin', 'setter', 'closer', 'mentor', 'student'];

const ROLE_BADGE: Record<string, string> = {
  admin:   'bg-red-500/15 text-red-300',
  setter:  'bg-blue-500/15 text-blue-300',
  closer:  'bg-violet-500/15 text-violet-300',
  mentor:  'bg-amber-500/15 text-amber-300',
  student: 'bg-white/10 text-white/50',
};

// ── Modal base ────────────────────────────────────────────────────────────────

function Modal({ title, onClose, children }: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111] p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-bold text-brand-text">{title}</h2>
          <button onClick={onClose} className="text-brand-muted hover:text-brand-text transition">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Edit modal ────────────────────────────────────────────────────────────────

function EditModal({ user, onClose, onSaved }: {
  user: User;
  onClose: () => void;
  onSaved: (updated: User) => void;
}) {
  const [fullName, setFullName] = useState(user.full_name ?? '');
  const [email,    setEmail]    = useState(user.email ?? '');
  const [role,     setRole]     = useState(user.role ?? 'student');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  async function save() {
    setLoading(true);
    setError('');
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user.id, full_name: fullName, email, role }),
    });
    const json = await res.json();
    if (!res.ok) { setError(json.error ?? 'Error al guardar'); setLoading(false); return; }
    onSaved({ ...user, full_name: fullName, email, role });
  }

  return (
    <Modal title="Editar usuario" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-xs text-brand-muted">Nombre completo</label>
          <input
            value={fullName}
            onChange={e => setFullName(e.target.value)}
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
        <div>
          <label className="mb-1 block text-xs text-brand-muted">Rol</label>
          <select
            value={role}
            onChange={e => setRole(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-[#111] px-3 py-2 text-sm text-brand-text focus:outline-none focus:border-brand-gold/50"
          >
            {ROLES.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        <div className="flex gap-2 pt-1">
          <button
            onClick={save}
            disabled={loading}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-gold py-2.5 text-sm font-bold text-black disabled:opacity-50 hover:opacity-90 transition"
          >
            <Check className="h-4 w-4" />
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </button>
          <button onClick={onClose} className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-brand-muted hover:text-brand-text transition">
            Cancelar
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ── Password modal ────────────────────────────────────────────────────────────

function PasswordModal({ user, onClose }: { user: User; onClose: () => void }) {
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [done,     setDone]     = useState(false);

  async function save() {
    if (password !== confirm) { setError('Las contraseñas no coinciden'); return; }
    if (password.length < 6)  { setError('Mínimo 6 caracteres'); return; }
    setLoading(true);
    setError('');
    const res = await fetch('/api/admin/users/set-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user.id, password }),
    });
    const json = await res.json();
    if (!res.ok) { setError(json.error ?? 'Error'); setLoading(false); return; }
    setDone(true);
    setTimeout(onClose, 1500);
  }

  return (
    <Modal title={`Cambiar contraseña — ${user.full_name ?? user.email}`} onClose={onClose}>
      {done ? (
        <div className="flex items-center gap-3 rounded-xl border border-green-500/30 bg-green-500/5 p-4">
          <Check className="h-5 w-5 text-green-400 shrink-0" />
          <p className="text-sm text-green-300">Contraseña actualizada.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-brand-muted">
            Ingresá la nueva contraseña directamente. No se necesita la anterior.
          </p>
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
              placeholder="Repetí la contraseña"
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
            <button onClick={onClose} className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-brand-muted hover:text-brand-text transition">
              Cancelar
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

// ── Delete confirm ────────────────────────────────────────────────────────────

function DeleteModal({ user, onClose, onDeleted }: {
  user: User;
  onClose: () => void;
  onDeleted: (id: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  async function del() {
    setLoading(true);
    const res = await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user.id }),
    });
    const json = await res.json();
    if (!res.ok) { setError(json.error ?? 'Error'); setLoading(false); return; }
    onDeleted(user.id);
  }

  return (
    <Modal title="Eliminar usuario" onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-brand-text">{user.full_name ?? user.email}</p>
            <p className="text-xs text-brand-muted mt-1">
              Esta acción es permanente y no se puede deshacer. Se elimina la cuenta de auth y todos sus datos asociados.
            </p>
          </div>
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        <div className="flex gap-2">
          <button
            onClick={del}
            disabled={loading}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 py-2.5 text-sm font-bold text-white disabled:opacity-50 hover:bg-red-400 transition"
          >
            <Trash2 className="h-4 w-4" />
            {loading ? 'Eliminando...' : 'Sí, eliminar'}
          </button>
          <button onClick={onClose} className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-brand-muted hover:text-brand-text transition">
            Cancelar
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminUsersPage() {
  const [users,   setUsers]   = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [editUser,     setEditUser]     = useState<User | null>(null);
  const [passwordUser, setPasswordUser] = useState<User | null>(null);
  const [deleteUser,   setDeleteUser]   = useState<User | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/users');
    const json = await res.json();
    setUsers(json.users ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return (
      (u.full_name ?? '').toLowerCase().includes(q) ||
      (u.email     ?? '').toLowerCase().includes(q) ||
      (u.role      ?? '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        eyebrow="Admin"
        title="Usuarios"
        description="Gestioná roles, datos y contraseñas del equipo."
      />

      {/* Toolbar */}
      <div className="mb-4 flex items-center gap-3">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre, email o rol..."
          className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-brand-text placeholder-white/25 focus:outline-none focus:border-brand-gold/50"
        />
        <button
          onClick={load}
          disabled={loading}
          className="rounded-xl border border-white/10 p-2 text-brand-muted hover:text-brand-text transition"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <RefreshCw className="h-6 w-6 animate-spin text-brand-muted" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/8">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8 bg-white/3 text-left">
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-brand-muted">Usuario</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-brand-muted">Email</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-brand-muted">Rol</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-brand-muted">Registrado</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-brand-muted">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-brand-muted">
                    {search ? 'Sin resultados.' : 'No hay usuarios.'}
                  </td>
                </tr>
              ) : filtered.map(u => (
                <tr key={u.id} className="hover:bg-white/2 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-gold/15 text-xs font-bold text-brand-gold">
                        {(u.full_name ?? u.email ?? '?').charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-brand-text">{u.full_name ?? '—'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-brand-muted">{u.email ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${ROLE_BADGE[u.role ?? ''] ?? 'bg-white/10 text-white/40'}`}>
                      {u.role ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-brand-muted">
                    {new Date(u.created_at).toLocaleDateString('es-AR')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setEditUser(u)}
                        title="Editar"
                        className="rounded-lg border border-white/10 p-1.5 text-brand-muted hover:text-brand-gold hover:border-brand-gold/30 transition"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setPasswordUser(u)}
                        title="Cambiar contraseña"
                        className="rounded-lg border border-white/10 p-1.5 text-brand-muted hover:text-blue-400 hover:border-blue-400/30 transition"
                      >
                        <KeyRound className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteUser(u)}
                        title="Eliminar"
                        className="rounded-lg border border-white/10 p-1.5 text-brand-muted hover:text-red-400 hover:border-red-400/30 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {editUser && (
        <EditModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onSaved={updated => {
            setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
            setEditUser(null);
          }}
        />
      )}
      {passwordUser && (
        <PasswordModal
          user={passwordUser}
          onClose={() => setPasswordUser(null)}
        />
      )}
      {deleteUser && (
        <DeleteModal
          user={deleteUser}
          onClose={() => setDeleteUser(null)}
          onDeleted={id => {
            setUsers(prev => prev.filter(u => u.id !== id));
            setDeleteUser(null);
          }}
        />
      )}
    </div>
  );
}
