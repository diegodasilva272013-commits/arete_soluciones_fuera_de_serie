'use client';

import { useState } from 'react';
import { ArrowRight, Phone, Mail, MessageCircle, MapPin } from 'lucide-react';
import s from '../corp.module.css';
import { RevealObserver } from '../_reveal';

const WA = 'https://wa.me/5491143215678?text=Hola%2C%20quiero%20saber%20m%C3%A1s%20sobre%20el%20diagn%C3%B3stico%20de%20Aret%C3%A9%20Soluciones';

type FormState = 'idle' | 'sending' | 'done' | 'error';

export default function ContactoPage() {
  const [form, setForm] = useState({ nombre: '', empresa: '', email: '', mensaje: '' });
  const [state, setState] = useState<FormState>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('sending');
    // TODO: reemplazar con endpoint real
    await new Promise(r => setTimeout(r, 1200));
    setState('done');
  };

  return (
    <>
      <RevealObserver revealClass={s.revealOn} />

      {/* Hero */}
      <section className={s.pageHero}>
        <div className={s.pageHeroInner}>
          <div className={`${s.kicker} ${s.reveal}`} data-reveal="">
            <span className={s.kickerLine} />
            <span className={s.kickerLabel}>Contacto</span>
          </div>
          <h1 className={`${s.heroTitle} ${s.reveal} ${s.revealDelay1}`} data-reveal="">
            Hablemos
          </h1>
          <p className={`${s.heroSub} ${s.reveal} ${s.revealDelay2}`} data-reveal="">
            El diagnóstico empieza con una conversación de 30 minutos para entender la situación. Sin costo, sin compromiso.
          </p>
        </div>
      </section>

      {/* Contacto */}
      <section className={s.section}>
        <div className={s.inner}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'start' }}>

            {/* Canales */}
            <div className={`${s.reveal}`} data-reveal="">
              <p className={s.kickerLabel} style={{ marginBottom: 28 }}>Cómo contactarnos</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

                {/* WhatsApp */}
                <a
                  href={WA}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 20,
                    padding: '24px 28px',
                    background: 'rgba(37,211,102,0.05)',
                    border: '1px solid rgba(37,211,102,0.22)',
                    clipPath: 'polygon(12px 0,100% 0,100% calc(100% - 12px),calc(100% - 12px) 100%,0 100%,0 12px)',
                    textDecoration: 'none',
                    transition: 'background 0.2s',
                  }}
                >
                  <div style={{ width: 46, height: 46, borderRadius: '50%', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <MessageCircle size={20} color="white" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: 15, color: 'var(--hueso)' }}>WhatsApp</p>
                    <p style={{ margin: '0 0 4px', fontFamily: 'ui-monospace, monospace', fontSize: 12, color: '#25D366' }}>+54 9 11 4321-5678</p>
                    <p style={{ margin: 0, fontSize: 12, color: 'rgba(242,239,233,0.38)' }}>Respuesta en menos de 2 horas · Lun–Vie 9 a 18 hs</p>
                  </div>
                  <ArrowRight size={16} color="rgba(37,211,102,0.6)" />
                </a>

                {/* Teléfono */}
                <a
                  href="tel:+541143215678"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 20,
                    padding: '24px 28px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(242,239,233,0.08)',
                    clipPath: 'polygon(12px 0,100% 0,100% calc(100% - 12px),calc(100% - 12px) 100%,0 100%,0 12px)',
                    textDecoration: 'none',
                  }}
                >
                  <div style={{ width: 46, height: 46, background: 'rgba(var(--azul-rgb),0.1)', border: '1px solid rgba(var(--azul-rgb),0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, clipPath: 'polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px)' }}>
                    <Phone size={18} color="var(--azul)" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: 15, color: 'var(--hueso)' }}>Llamada directa</p>
                    <p style={{ margin: '0 0 4px', fontFamily: 'ui-monospace, monospace', fontSize: 12, color: 'rgba(242,239,233,0.55)' }}>+54 11 4321-5678</p>
                    <p style={{ margin: 0, fontSize: 12, color: 'rgba(242,239,233,0.38)' }}>Lun–Vie de 9 a 18 hs (ARG)</p>
                  </div>
                  <ArrowRight size={16} color="rgba(242,239,233,0.22)" />
                </a>

                {/* Email */}
                <a
                  href="mailto:hola@aretesoluciones.com"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 20,
                    padding: '24px 28px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(242,239,233,0.08)',
                    clipPath: 'polygon(12px 0,100% 0,100% calc(100% - 12px),calc(100% - 12px) 100%,0 100%,0 12px)',
                    textDecoration: 'none',
                  }}
                >
                  <div style={{ width: 46, height: 46, background: 'rgba(var(--azul-rgb),0.1)', border: '1px solid rgba(var(--azul-rgb),0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, clipPath: 'polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px)' }}>
                    <Mail size={18} color="var(--azul)" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: 15, color: 'var(--hueso)' }}>Email</p>
                    <p style={{ margin: '0 0 4px', fontFamily: 'ui-monospace, monospace', fontSize: 12, color: 'rgba(242,239,233,0.55)' }}>hola@aretesoluciones.com</p>
                    <p style={{ margin: 0, fontSize: 12, color: 'rgba(242,239,233,0.38)' }}>Respuesta en 24 horas hábiles</p>
                  </div>
                  <ArrowRight size={16} color="rgba(242,239,233,0.22)" />
                </a>

                {/* Ubicación */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '20px 28px', border: '1px solid rgba(242,239,233,0.04)' }}>
                  <div style={{ width: 46, height: 46, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <MapPin size={18} color="rgba(242,239,233,0.25)" />
                  </div>
                  <div>
                    <p style={{ margin: '0 0 2px', fontWeight: 600, fontSize: 14, color: 'rgba(242,239,233,0.55)' }}>Buenos Aires, Argentina</p>
                    <p style={{ margin: 0, fontSize: 12, color: 'rgba(242,239,233,0.28)' }}>Operamos 100% remoto · Toda Latinoamérica</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulario */}
            <div className={`${s.reveal} ${s.revealDelay1}`} data-reveal="">
              <div style={{ padding: '40px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(242,239,233,0.07)', clipPath: 'polygon(20px 0,100% 0,100% calc(100% - 20px),calc(100% - 20px) 100%,0 100%,0 20px)' }}>
                <h2 style={{ margin: '0 0 8px', fontWeight: 700, fontSize: 20, color: 'var(--hueso)' }}>Envianos un mensaje</h2>
                <p style={{ margin: '0 0 32px', fontSize: 14, color: 'rgba(242,239,233,0.38)' }}>Te respondemos en menos de 24 horas hábiles.</p>

                {state === 'done' ? (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(var(--azul-rgb),0.12)', border: '1px solid rgba(var(--azul-rgb),0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--azul)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                    <p style={{ margin: '0 0 8px', fontWeight: 700, fontSize: 17, color: 'var(--hueso)' }}>Mensaje recibido</p>
                    <p style={{ margin: 0, fontSize: 14, color: 'rgba(242,239,233,0.45)' }}>Te respondemos antes de las 24 horas hábiles.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {[
                      { id: 'nombre', label: 'Nombre completo', type: 'text', placeholder: 'Tu nombre' },
                      { id: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Nombre de tu empresa' },
                      { id: 'email', label: 'Email', type: 'email', placeholder: 'tu@empresa.com' },
                    ].map(field => (
                      <div key={field.id}>
                        <label htmlFor={`contacto-${field.id}`} className={s.formLabel}>
                          {field.label}
                        </label>
                        <input
                          id={`contacto-${field.id}`}
                          type={field.type}
                          required
                          placeholder={field.placeholder}
                          value={(form as Record<string, string>)[field.id]}
                          onChange={e => setForm(f => ({ ...f, [field.id]: e.target.value }))}
                          className={s.formInput}
                        />
                      </div>
                    ))}
                    <div>
                      <label htmlFor="contacto-mensaje" className={s.formLabel}>
                        ¿En qué podemos ayudar?
                      </label>
                      <textarea
                        id="contacto-mensaje"
                        required
                        rows={4}
                        placeholder="Contanos brevemente tu situación y qué estás buscando..."
                        value={form.mensaje}
                        onChange={e => setForm(f => ({ ...f, mensaje: e.target.value }))}
                        className={`${s.formInput} ${s.formTextarea}`}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={state === 'sending'}
                      className={s.btnPrimary}
                      style={{ justifyContent: 'center', opacity: state === 'sending' ? 0.7 : 1, cursor: state === 'sending' ? 'wait' : 'pointer', border: 'none', width: '100%' }}
                    >
                      {state === 'sending' ? 'Enviando...' : 'Enviar mensaje'}
                      {state !== 'sending' && <ArrowRight size={15} />}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
