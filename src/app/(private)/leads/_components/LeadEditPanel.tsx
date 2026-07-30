'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

type Lead = {
  id: string;
  first_name: string;
  last_name: string | null;
  phone: string;
  email: string | null;
  country: string | null;
  notes: string | null;
  tags: string[];
};

type Props = {
  lead: Lead;
  onClose: () => void;
  onSaved: (updated: Partial<Lead>) => void;
};

const TAG_COLORS = [
  'bg-violet-900/60 text-violet-300 border-violet-700/50',
  'bg-sky-900/60 text-sky-300 border-sky-700/50',
  'bg-emerald-900/60 text-emerald-300 border-emerald-700/50',
  'bg-rose-900/60 text-rose-300 border-rose-700/50',
  'bg-amber-900/60 text-amber-300 border-amber-700/50',
  'bg-pink-900/60 text-pink-300 border-pink-700/50',
  'bg-teal-900/60 text-teal-300 border-teal-700/50',
  'bg-orange-900/60 text-orange-300 border-orange-700/50',
];

function tagColor(tag: string): string {
  let h = 0;
  for (let i = 0; i < tag.length; i++) h = (h * 31 + tag.charCodeAt(i)) >>> 0;
  return TAG_COLORS[h % TAG_COLORS.length];
}

export function LeadEditPanel({ lead, onClose, onSaved }: Props) {
  const [form, setForm] = useState({
    first_name: lead.first_name,
    last_name:  lead.last_name  ?? '',
    phone:      lead.phone,
    email:      lead.email      ?? '',
    country:    lead.country    ?? '',
    notes:      lead.notes      ?? '',
    tags:       [...(lead.tags ?? [])],
  });
  const [tagInput, setTagInput] = useState('');
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const tagRef = useRef<HTMLInputElement>(null);

  function addTag(raw: string) {
    const tag = raw.trim().toLowerCase().replace(/[,;]+$/, '');
    if (!tag || form.tags.includes(tag)) return;
    setForm(f => ({ ...f, tags: [...f.tags, tag] }));
    setTagInput('');
  }

  function removeTag(tag: string) {
    setForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }));
  }

  function onTagKey(e: KeyboardEvent<HTMLInputElement>) {
    if (['Enter', ',', ' '].includes(e.key)) {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === 'Backspace' && !tagInput && form.tags.length) {
      removeTag(form.tags[form.tags.length - 1]);
    }
  }

  async function save() {
    if (!form.first_name.trim()) { setError('El nombre es obligatorio'); return; }
    if (!form.phone.trim())      { setError('El teléfono es obligatorio'); return; }
    setSaving(true);
    setError(null);

    // Flush tag input if not empty
    const finalTags = tagInput.trim()
      ? [...new Set([...form.tags, tagInput.trim().toLowerCase()])]
      : form.tags;

    const body = {
      first_name: form.first_name.trim(),
      last_name:  form.last_name.trim()  || null,
      phone:      form.phone.trim(),
      email:      form.email.trim()      || null,
      country:    form.country.trim()    || null,
      notes:      form.notes             || null,
      tags:       finalTags,
    };

    const res = await fetch(`/api/leads/${lead.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      onSaved(body);
      onClose();
    } else {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? 'Error al guardar');
    }
    setSaving(false);
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-[rgba(212,175,55,0.15)] bg-[#0a0a0a] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[rgba(212,175,55,0.1)] px-5 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-brand-muted">Lead</p>
            <h2 className="text-base font-bold text-brand-text">
              {lead.first_name} {lead.last_name ?? ''}
            </h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-brand-muted hover:text-brand-text transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">

          {/* Datos personales */}
          <section>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-brand-gold">
              Datos del lead
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-brand-muted">Nombre *</label>
                <input
                  value={form.first_name}
                  onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))}
                  className="w-full rounded-lg border border-[rgba(212,175,55,0.2)] bg-[#111] px-3 py-2 text-sm text-brand-text placeholder:text-brand-muted focus:border-brand-gold/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-brand-muted">Apellido</label>
                <input
                  value={form.last_name}
                  onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))}
                  className="w-full rounded-lg border border-[rgba(212,175,55,0.2)] bg-[#111] px-3 py-2 text-sm text-brand-text placeholder:text-brand-muted focus:border-brand-gold/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-brand-muted">Teléfono *</label>
                <input
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full rounded-lg border border-[rgba(212,175,55,0.2)] bg-[#111] px-3 py-2 text-sm text-brand-text font-mono placeholder:text-brand-muted focus:border-brand-gold/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-brand-muted">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full rounded-lg border border-[rgba(212,175,55,0.2)] bg-[#111] px-3 py-2 text-sm text-brand-text placeholder:text-brand-muted focus:border-brand-gold/50 focus:outline-none"
                />
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-xs text-brand-muted">País</label>
                <input
                  value={form.country}
                  onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                  placeholder="Argentina, Venezuela, Colombia…"
                  className="w-full rounded-lg border border-[rgba(212,175,55,0.2)] bg-[#111] px-3 py-2 text-sm text-brand-text placeholder:text-brand-muted focus:border-brand-gold/50 focus:outline-none"
                />
              </div>
            </div>
          </section>

          {/* Etiquetas */}
          <section>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-brand-gold">
              Etiquetas
            </p>
            <div
              className="flex min-h-[42px] flex-wrap gap-1.5 rounded-lg border border-[rgba(212,175,55,0.2)] bg-[#111] px-3 py-2 cursor-text"
              onClick={() => tagRef.current?.focus()}
            >
              {form.tags.map(tag => (
                <span key={tag} className={cn('flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium', tagColor(tag))}>
                  {tag}
                  <button onClick={() => removeTag(tag)} className="opacity-60 hover:opacity-100 transition leading-none">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <input
                ref={tagRef}
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={onTagKey}
                onBlur={() => addTag(tagInput)}
                placeholder={form.tags.length === 0 ? 'Escribí una etiqueta y Enter…' : ''}
                className="flex-1 min-w-[120px] bg-transparent text-sm text-brand-text placeholder:text-brand-muted focus:outline-none"
              />
            </div>
            <p className="mt-1 text-[10px] text-brand-muted">Enter, coma o espacio para agregar. Backspace para eliminar la última.</p>
          </section>

          {/* Notas */}
          <section>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-brand-gold">
              Notas internas
            </p>
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={6}
              placeholder="Contexto del lead, objeciones, próximos pasos…"
              className="w-full resize-none rounded-lg border border-[rgba(212,175,55,0.2)] bg-[#111] px-3 py-2.5 text-sm text-brand-text placeholder:text-brand-muted focus:border-brand-gold/50 focus:outline-none leading-relaxed"
            />
          </section>

          {error && (
            <p className="rounded-lg border border-red-700/40 bg-red-900/20 px-4 py-3 text-sm text-red-300">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[rgba(212,175,55,0.1)] px-5 py-4 flex gap-3">
          <button
            onClick={save}
            disabled={saving}
            className="flex-1 rounded-lg bg-brand-gold py-2.5 text-sm font-bold text-black hover:bg-brand-gold/90 disabled:opacity-60 transition"
          >
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
          <button
            onClick={onClose}
            className="rounded-lg border border-[rgba(212,175,55,0.2)] px-4 py-2.5 text-sm text-brand-muted hover:text-brand-text transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    </>
  );
}
