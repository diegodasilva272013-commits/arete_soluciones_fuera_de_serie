'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import AnimatedGradient from '@/components/ui/animated-gradient';
import s from '@/app/empresa/corp.module.css';

// Versión genérica del PasswordGate de Providus: recibe el título y la
// server action de verificación por props en vez de tenerlos fijos, para
// poder reusarse en cualquier propuesta sin duplicar el componente entero.
export function PasswordGate({
  title,
  kickerLabel = 'Propuesta técnica confidencial',
  checkPassword,
}: {
  title: string;
  kickerLabel?: string;
  checkPassword: (pwd: string) => Promise<{ ok: boolean }>;
}) {
  const [pwd, setPwd] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    start(async () => {
      const res = await checkPassword(pwd);
      if (res.ok) { router.refresh(); }
      else { setError(true); setShake(true); setPwd(''); setTimeout(() => setShake(false), 500); }
    });
  };

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', position: 'relative', overflow: 'hidden', isolation: 'isolate' }}>
      <AnimatedGradient config={{ preset: 'Prism' }} />
      <div style={{
        position: 'relative', zIndex: 1, width: '100%', maxWidth: 420,
        background: 'rgba(5,5,5,0.92)', border: '1px solid var(--linea)',
        padding: '52px 44px', backdropFilter: 'blur(24px)',
        clipPath: 'polygon(20px 0,100% 0,100% calc(100% - 20px),calc(100% - 20px) 100%,0 100%,0 20px)',
        animation: shake ? 'propGateShake 0.4s ease' : 'none',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Image src="/LOGO_ARETE.png" alt="Areté" width={160} height={46} style={{ height: 36, width: 'auto', objectFit: 'contain', margin: '0 auto 20px' }} priority />
          <p className={s.kickerLabel} style={{ marginBottom: 8 }}>{kickerLabel}</p>
          <h1 style={{ margin: 0, fontFamily: 'var(--f-display), Montserrat, sans-serif', fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--hueso)' }}>{title}</h1>
        </div>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 10, fontWeight: 500, color: 'var(--ceniza)', letterSpacing: '0.26em', textTransform: 'uppercase', fontFamily: 'var(--f-mono), monospace' }}>Clave de acceso</label>
          <input type="password" value={pwd} onChange={e => { setPwd(e.target.value); setError(false); }} placeholder="••••••••" required autoFocus
            style={{ display: 'block', width: '100%', boxSizing: 'border-box', padding: '15px 18px', background: 'rgba(242,239,233,0.03)', border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'var(--linea)'}`, color: 'var(--hueso)', fontSize: 16, outline: 'none', fontFamily: 'inherit', letterSpacing: '0.1em', transition: 'border-color 0.2s' }} />
          {error && <p style={{ margin: 0, fontSize: 12, color: 'rgba(239,68,68,0.85)', fontFamily: 'var(--f-mono), monospace' }}>Clave incorrecta. Revisá con el equipo de Areté.</p>}
          <button type="submit" disabled={pending || !pwd} className={s.btnPrimary} style={{ marginTop: 12, justifyContent: 'center', opacity: !pwd ? 0.45 : 1, cursor: pending ? 'wait' : !pwd ? 'default' : 'pointer' }}>
            {pending ? 'Verificando…' : 'Ver propuesta'}{!pending && <ArrowRight size={13} />}
          </button>
        </form>
      </div>
      <style>{`@keyframes propGateShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}`}</style>
    </div>
  );
}
