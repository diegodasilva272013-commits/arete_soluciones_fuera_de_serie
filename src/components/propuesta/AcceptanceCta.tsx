'use client';

import { useState, useTransition } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import s from '@/app/empresa/corp.module.css';

// Banda final "¿Arrancamos?" / botón que dispara la notificación de
// aceptación y pasa a un estado de éxito. Igual a la de Providus, con los
// textos y la server action genericizados por props.
export function AcceptanceCta({
  title = '¿Arrancamos?',
  sub,
  buttonLabel = 'Acepto la propuesta',
  successTitle = 'Propuesta aceptada',
  successSub = 'El equipo de Areté fue notificado. Los contactamos en las próximas horas para coordinar el inicio.',
  notifyAcceptance,
}: {
  title?: string;
  sub: string;
  buttonLabel?: string;
  successTitle?: string;
  successSub?: string;
  notifyAcceptance: () => Promise<{ ok: boolean }>;
}) {
  const [accepted, setAccepted] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [pending, start] = useTransition();

  const handleAccept = () => {
    setAccepting(true);
    start(async () => { await notifyAcceptance(); setAccepted(true); setAccepting(false); });
  };

  return (
    <section className={s.ctaBand}>
      <div className={s.inner}>
        {accepted ? (
          <div className={s.reveal} data-reveal="" style={{ maxWidth: 560, margin: '0 auto', padding: '48px 40px', background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.22)', clipPath: 'polygon(16px 0,100% 0,100% calc(100% - 16px),calc(100% - 16px) 100%,0 100%,0 16px)' }}>
            <div style={{ width: 56, height: 56, margin: '0 auto 24px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', clipPath: 'polygon(10px 0,100% 0,100% calc(100% - 10px),calc(100% - 10px) 100%,0 100%,0 10px)' }}>
              <Check size={22} color="#22c55e" />
            </div>
            <h2 className={s.ctaTitle} style={{ fontSize: 'clamp(26px,4vw,42px)' }}>{successTitle}</h2>
            <p className={s.ctaSub}>{successSub}</p>
          </div>
        ) : (
          <div className={s.reveal} data-reveal="">
            <h2 className={s.ctaTitle}>{title}</h2>
            <p className={s.ctaSub}>{sub}</p>
            <div className={s.ctaRow}>
              <button onClick={handleAccept} disabled={accepting || pending} className={s.btnPrimary} style={{ fontSize: 12, padding: '18px 40px', cursor: accepting || pending ? 'wait' : 'pointer', opacity: accepting || pending ? 0.6 : 1 }}>
                {accepting || pending ? 'Enviando…' : buttonLabel}{!accepting && !pending && <ArrowRight size={14} />}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
