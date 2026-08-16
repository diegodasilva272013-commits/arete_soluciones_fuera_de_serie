'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const STEPS = [
  { label: 'Buscando información del prospecto...', pct: 15 },
  { label: 'Construyendo perfil psicológico DISC...', pct: 35 },
  { label: 'Desarrollando estrategia de venta...', pct: 55 },
  { label: 'Generando secuencia de mensajes...', pct: 72 },
  { label: 'Refinando y optimizando mensajes...', pct: 88 },
  { label: 'Guardando prospecto...', pct: 95 },
  { label: '¡Análisis completo!', pct: 100 },
];

type Source = 'linkedin' | 'instagram' | 'manual';

const LANGUAGES = [
  { code: 'es', label: 'Español', flag: '🇦🇷' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
];

export default function NuevoProspectoPage() {
  const [source, setSource] = useState<Source>('linkedin');
  const [url, setUrl] = useState('');
  const [language, setLanguage] = useState('es');
  const [loading, setLoading] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState('');
  const router = useRouter();

  const [manual, setManual] = useState({
    full_name: '', company: '', headline: '', location: '',
    whatsapp_number: '', linkedin_url: '', instagram_url: '',
  });
  const [savingManual, setSavingManual] = useState(false);

  async function handleManualSave(e: React.FormEvent) {
    e.preventDefault();
    if (!manual.full_name.trim()) return;
    setSavingManual(true);
    setError('');
    try {
      const res = await fetch('/api/prospectos/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(manual),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar');
      router.push(`/prospectos/${data.prospectId}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setSavingManual(false);
    }
  }

  function normalizeInstagram(input: string): string {
    if (input.startsWith('@')) return `https://instagram.com/${input.slice(1)}`;
    if (!input.startsWith('http')) return `https://instagram.com/${input}`;
    return input;
  }

  function simulateSteps(onDone: () => void) {
    let i = 0;
    const next = () => {
      if (i < STEPS.length - 1) {
        i++;
        setStepIndex(i);
        setTimeout(next, 2800 + Math.random() * 1500);
      } else { onDone(); }
    };
    setStepIndex(0);
    setTimeout(next, 2500);
  }

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) { setError('Ingresá una URL válida'); return; }
    const normalizedUrl = source === 'instagram' ? normalizeInstagram(url) : url;

    setLoading(true);
    setError('');
    setStepIndex(0);

    let done = false;
    simulateSteps(() => { done = true; });

    try {
      const body = source === 'instagram'
        ? { instagramUrl: normalizedUrl, sourceType: 'instagram', profileText: '', language }
        : { linkedinUrl: normalizedUrl, sourceType: 'linkedin', profileText: '', language };

      const res = await fetch('/api/prospectos/analizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (res.status === 409) {
        setError(`⚠️ ${data.message}. Redirigiendo...`);
        setTimeout(() => router.push(`/prospectos/${data.prospectId}`), 1500);
        setLoading(false);
        return;
      }
      if (!res.ok) throw new Error(data.error || 'Error en el análisis');

      const wait = () => done ? router.push(`/prospectos/${data.prospectId}`) : setTimeout(wait, 300);
      wait();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setLoading(false);
    }
  }

  const accentColor = source === 'instagram'
    ? 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)'
    : 'linear-gradient(135deg, #1a6fff, #0f52cc)';

  return (
    <div className="min-h-screen bg-brand-black p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-brand-text">Nuevo Prospecto</h1>
          <p className="mt-1 text-sm text-brand-muted">
            Pegá el link del perfil — la IA busca toda la info y genera los mensajes personalizados
          </p>
        </div>

        <div className="rounded-2xl p-6 lg:p-8 border border-[rgba(26,111,255,0.15)] bg-[#0d0d0d]">
          {!loading ? (
            <>
              {/* Tabs de fuente */}
              <div className="flex gap-1 mb-6 p-1 rounded-xl bg-[#111]">
                {(['linkedin', 'instagram'] as Source[]).map(s => (
                  <button key={s} type="button"
                    onClick={() => { setSource(s); setUrl(''); setError(''); }}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all',
                      source === s ? 'bg-[#1a1a1a] shadow-sm' : 'text-brand-muted'
                    )}
                    style={{ color: source === s ? (s === 'instagram' ? '#e1306c' : '#1a6fff') : undefined }}>
                    {s === 'linkedin' ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                        <rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="2" width="20" height="20" rx="5" />
                        <circle cx="12" cy="12" r="4" />
                        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                      </svg>
                    )}
                    {s === 'linkedin' ? 'LinkedIn' : 'Instagram'}
                  </button>
                ))}
                <button type="button"
                  onClick={() => { setSource('manual'); setError(''); }}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all',
                    source === 'manual' ? 'bg-[#1a1a1a] shadow-sm text-brand-text' : 'text-brand-muted'
                  )}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Manual
                </button>
              </div>

              {/* Formulario manual */}
              {source === 'manual' && (
                <form onSubmit={handleManualSave} className="space-y-4">
                  <p className="text-xs text-brand-muted mb-2">Cargá el prospecto a mano. Solo el nombre es obligatorio.</p>
                  {[
                    { key: 'full_name', label: 'Nombre completo *', placeholder: 'Juan García' },
                    { key: 'company', label: 'Empresa', placeholder: 'Acme S.A.' },
                    { key: 'headline', label: 'Cargo / Descripción', placeholder: 'CEO en Acme' },
                    { key: 'location', label: 'Ubicación', placeholder: 'Buenos Aires, Argentina' },
                    { key: 'whatsapp_number', label: 'WhatsApp', placeholder: '+54 9 11 1234 5678' },
                    { key: 'linkedin_url', label: 'LinkedIn URL', placeholder: 'https://linkedin.com/in/...' },
                    { key: 'instagram_url', label: 'Instagram URL', placeholder: 'https://instagram.com/...' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-xs font-medium mb-1.5 text-brand-muted">{f.label}</label>
                      <input
                        type="text"
                        value={(manual as Record<string, string>)[f.key]}
                        onChange={e => setManual(prev => ({ ...prev, [f.key]: e.target.value }))}
                        placeholder={f.placeholder}
                        required={f.key === 'full_name'}
                        className="w-full px-4 py-3 rounded-xl text-sm bg-[#111] border border-[rgba(26,111,255,0.15)] text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-[#1a6fff] transition-colors"
                      />
                    </div>
                  ))}
                  {error && <p className="text-sm text-red-400 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">{error}</p>}
                  <button type="submit" disabled={savingManual || !manual.full_name.trim()}
                    className="w-full py-4 rounded-xl font-semibold text-sm text-white disabled:opacity-50 transition-all"
                    style={{ background: 'linear-gradient(135deg, #1a6fff, #0f52cc)' }}>
                    {savingManual ? 'Guardando...' : 'Crear prospecto'}
                  </button>
                </form>
              )}

              {/* Selector de idioma */}
              {source !== 'manual' && (
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-medium text-brand-muted">Idioma de los mensajes:</span>
                  <div className="flex gap-1">
                    {LANGUAGES.map(lang => (
                      <button key={lang.code} type="button" onClick={() => setLanguage(lang.code)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={{
                          background: language === lang.code ? 'rgba(26,111,255,0.15)' : '#111',
                          color: language === lang.code ? '#1a6fff' : '#6b7280',
                          border: language === lang.code ? '1px solid rgba(26,111,255,0.3)' : '1px solid rgba(255,255,255,0.06)',
                        }}>
                        {lang.flag} {lang.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Formulario URL */}
              {source !== 'manual' && (
                <form onSubmit={handleAnalyze} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium mb-3 text-brand-muted">
                      {source === 'instagram' ? 'URL o usuario de Instagram' : 'URL del perfil LinkedIn'}
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2"
                        style={{ color: source === 'instagram' ? '#e1306c' : '#1a6fff' }}>
                        {source === 'linkedin' ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                            <rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" />
                          </svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="2" y="2" width="20" height="20" rx="5" />
                            <circle cx="12" cy="12" r="4" />
                            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                          </svg>
                        )}
                      </div>
                      <input
                        type="text"
                        value={url}
                        onChange={e => setUrl(e.target.value)}
                        placeholder={source === 'instagram'
                          ? 'https://instagram.com/usuario o @usuario'
                          : 'https://linkedin.com/in/nombre-apellido'}
                        required
                        className="w-full pl-12 pr-4 py-4 rounded-xl text-sm bg-[#111] border border-[rgba(26,111,255,0.15)] text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-[#1a6fff] transition-colors"
                      />
                    </div>
                  </div>

                  {error && (
                    <p className="text-sm text-red-400 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">{error}</p>
                  )}

                  <button type="submit"
                    className="w-full py-4 rounded-xl font-semibold text-sm text-white transition-all"
                    style={{ background: accentColor }}>
                    <span className="flex items-center justify-center gap-2">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                      </svg>
                      Analizar con IA
                    </span>
                  </button>
                </form>
              )}

              {/* Qué hace la IA */}
              {source !== 'manual' && (
                <div className="mt-8 pt-6 border-t border-[rgba(26,111,255,0.08)]">
                  <p className="text-xs font-semibold mb-4 uppercase tracking-wider text-brand-muted">Qué hace la IA</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: '🧠', text: 'Perfil psicológico DISC' },
                      { icon: '💬', text: 'Replica su estilo de comunicación' },
                      { icon: '🎯', text: 'Ángulo de venta personalizado' },
                      { icon: '✉️', text: '6 mensajes de seguimiento' },
                      { icon: '🏢', text: 'Análisis de su empresa/negocio' },
                      { icon: '🔑', text: 'Pain points detectados' },
                    ].map(item => (
                      <div key={item.text} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#111] border border-[rgba(26,111,255,0.08)]">
                        <span>{item.icon}</span>
                        <span className="text-xs text-brand-muted">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Estado de carga */
            <div className="py-8">
              <div className="flex flex-col items-center mb-8">
                <div className="relative w-20 h-20 mb-6">
                  <div className="absolute inset-0 rounded-full" style={{ background: 'rgba(26,111,255,0.1)' }} />
                  <div className="absolute inset-0 rounded-full flex items-center justify-center"
                    style={{ background: accentColor }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"
                      className="animate-spin" style={{ animationDuration: '3s' }}>
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                    </svg>
                  </div>
                </div>
                <h2 className="text-lg font-bold text-brand-text mb-1">La IA está trabajando</h2>
                <p className="text-sm animate-pulse text-brand-gold">{STEPS[stepIndex].label}</p>
              </div>

              <div className="mb-6">
                <div className="flex justify-between text-xs mb-2 text-brand-muted">
                  <span>Progreso</span><span>{STEPS[stepIndex].pct}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#111] overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${STEPS[stepIndex].pct}%`, background: accentColor }} />
                </div>
              </div>

              <div className="space-y-2">
                {STEPS.map((step, i) => (
                  <div key={i}
                    className={cn('flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all',
                      i < stepIndex ? 'opacity-60' : i === stepIndex ? 'opacity-100' : 'opacity-25')}
                    style={{
                      background: i === stepIndex ? 'rgba(26,111,255,0.08)' : 'transparent',
                      border: i === stepIndex ? '1px solid rgba(26,111,255,0.2)' : '1px solid transparent',
                    }}>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs">
                      {i < stepIndex
                        ? <span className="text-green-400">✓</span>
                        : i === stepIndex
                          ? <span className="w-3 h-3 rounded-full animate-pulse bg-brand-gold" />
                          : <span className="w-2 h-2 rounded-full bg-[#333]" />}
                    </div>
                    <span style={{ color: i === stepIndex ? 'var(--text-primary)' : undefined }}
                      className={i !== stepIndex ? 'text-brand-muted' : 'text-brand-text'}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
