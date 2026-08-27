'use client';

import { useState } from 'react';
import { ArrowRight, Phone, Mail, MessageCircle, MapPin } from 'lucide-react';
import s from '../corp.module.css';
import { RevealObserver } from '../_reveal';

const WA = 'https://wa.me/5491143215678?text=Hola%2C%20me%20interesa%20saber%20m%C3%A1s%20sobre%20Aret%C3%A9%20Soluciones';

type FormState = 'idle' | 'sending' | 'done' | 'error';

export default function ContactoPage() {
  const [form, setForm] = useState({ nombre: '', empresa: '', email: '', mensaje: '' });
  const [state, setState] = useState<FormState>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('sending');
    // Simulación — reemplazar con endpoint real cuando haya backend
    await new Promise(r => setTimeout(r, 1200));
    setState('done');
  };

  return (
    <>
      <RevealObserver revealClass={s.revealOn} />

      {/* Hero */}
      <div className={s.pageHero}>
        <div className={s.pageHeroInner}>
          <div className={`${s.pageHeroLabel} ${s.reveal}`} data-reveal="">
            <span className={s.pageHeroLabelLine} />
            <span className={s.pageHeroLabelText}>Contacto</span>
          </div>
          <h1 className={`${s.pageHeroTitle} ${s.reveal} ${s.revealDelay1}`} data-reveal="">
            Hablemos sin compromiso
          </h1>
          <p className={`${s.pageHeroSub} ${s.reveal} ${s.revealDelay2}`} data-reveal="">
            El primer paso es una conversación de 30 minutos para entender tu situación. Sin presión, sin guión de ventas.
          </p>
        </div>
      </div>

      {/* Contacto principal */}
      <section className={s.section}>
        <div className={s.inner}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'start' }}>

            {/* Opciones de contacto */}
            <div className={`${s.reveal}`} data-reveal="">
              <span className={s.eyebrow}>Cómo contactarnos</span>
              <h2 className={s.sectionTitle} style={{ fontSize: 'clamp(24px, 3vw, 36px)', marginBottom: 40 }}>
                Elegí el canal que te resulte más cómodo
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* WhatsApp — destacado */}
                <a
                  href={WA}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 20,
                    padding: '24px 28px',
                    background: 'rgba(37,211,102,0.06)',
                    border: '1px solid rgba(37,211,102,0.25)',
                    clipPath: 'polygon(12px 0,100% 0,100% calc(100% - 12px),calc(100% - 12px) 100%,0 100%,0 12px)',
                    textDecoration: 'none',
                    transition: 'background 0.2s',
                  }}
                >
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: '#25D366',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <MessageCircle size={22} color="white" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: 15, color: '#f2efe9' }}>WhatsApp</p>
                    <p style={{ margin: '0 0 4px', fontFamily: 'ui-monospace, monospace', fontSize: 12, color: '#25D366' }}>+54 9 11 4321-5678</p>
                    <p style={{ margin: 0, fontSize: 12, color: 'rgba(242,239,233,0.4)' }}>Respuesta en menos de 2 horas · Lun–Vie 9 a 18 hs</p>
                  </div>
                  <ArrowRight size={18} color="rgba(37,211,102,0.7)" />
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
                    transition: 'background 0.2s, border-color 0.2s',
                  }}
                >
                  <div style={{
                    width: 48,
                    height: 48,
                    background: 'rgba(26,111,255,0.1)',
                    border: '1px solid rgba(26,111,255,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    clipPath: 'polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px)',
                  }}>
                    <Phone size={20} color="#1a6fff" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: 15, color: '#f2efe9' }}>Llamada directa</p>
                    <p style={{ margin: '0 0 4px', fontFamily: 'ui-monospace, monospace', fontSize: 12, color: 'rgba(242,239,233,0.6)' }}>+54 11 4321-5678</p>
                    <p style={{ margin: 0, fontSize: 12, color: 'rgba(242,239,233,0.4)' }}>Lun–Vie de 9 a 18 hs (ARG)</p>
                  </div>
                  <ArrowRight size={18} color="rgba(242,239,233,0.25)" />
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
                    transition: 'background 0.2s, border-color 0.2s',
                  }}
                >
                  <div style={{
                    width: 48,
                    height: 48,
                    background: 'rgba(26,111,255,0.1)',
                    border: '1px solid rgba(26,111,255,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    clipPath: 'polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px)',
                  }}>
                    <Mail size={20} color="#1a6fff" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: 15, color: '#f2efe9' }}>Email</p>
                    <p style={{ margin: '0 0 4px', fontFamily: 'ui-monospace, monospace', fontSize: 12, color: 'rgba(242,239,233,0.6)' }}>hola@aretesoluciones.com</p>
                    <p style={{ margin: 0, fontSize: 12, color: 'rgba(242,239,233,0.4)' }}>Respuesta en 24 horas hábiles</p>
                  </div>
                  <ArrowRight size={18} color="rgba(242,239,233,0.25)" />
                </a>

                {/* Ubicación */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 20,
                  padding: '20px 28px',
                  border: '1px solid rgba(242,239,233,0.05)',
                }}>
                  <div style={{ width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <MapPin size={20} color="rgba(242,239,233,0.3)" />
                  </div>
                  <div>
                    <p style={{ margin: '0 0 2px', fontWeight: 600, fontSize: 14, color: 'rgba(242,239,233,0.6)' }}>Buenos Aires, Argentina</p>
                    <p style={{ margin: 0, fontSize: 12, color: 'rgba(242,239,233,0.3)' }}>Operamos 100% de forma remota · Toda Latinoamérica</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulario */}
            <div className={`${s.reveal} ${s.revealDelay1}`} data-reveal="">
              <div style={{
                padding: '40px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(242,239,233,0.07)',
                clipPath: 'polygon(20px 0,100% 0,100% calc(100% - 20px),calc(100% - 20px) 100%,0 100%,0 20px)',
              }}>
                <h3 style={{ margin: '0 0 8px', fontWeight: 700, fontSize: 20, color: '#f2efe9' }}>Envianos un mensaje</h3>
                <p style={{ margin: '0 0 32px', fontSize: 14, color: 'rgba(242,239,233,0.4)' }}>Te respondemos en menos de 24 horas hábiles.</p>

                {state === 'done' ? (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(26,111,255,0.12)', border: '1px solid rgba(26,111,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a6fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                    <p style={{ margin: '0 0 8px', fontWeight: 700, fontSize: 17, color: '#f2efe9' }}>¡Mensaje enviado!</p>
                    <p style={{ margin: 0, fontSize: 14, color: 'rgba(242,239,233,0.5)' }}>Te respondemos en menos de 24 horas.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {[
                      { id: 'nombre', label: 'Nombre completo', type: 'text', placeholder: 'Tu nombre' },
                      { id: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Nombre de tu empresa' },
                      { id: 'email', label: 'Email', type: 'email', placeholder: 'tu@empresa.com' },
                    ].map(field => (
                      <div key={field.id}>
                        <label style={{ display: 'block', marginBottom: 8, fontFamily: 'ui-monospace, monospace', fontSize: 9, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'rgba(242,239,233,0.45)' }}>
                          {field.label}
                        </label>
                        <input
                          type={field.type}
                          required
                          placeholder={field.placeholder}
                          value={(form as any)[field.id]}
                          onChange={e => setForm(f => ({ ...f, [field.id]: e.target.value }))}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(242,239,233,0.1)',
                            color: '#f2efe9',
                            fontSize: 14,
                            outline: 'none',
                            boxSizing: 'border-box',
                            fontFamily: 'inherit',
                          }}
                        />
                      </div>
                    ))}
                    <div>
                      <label style={{ display: 'block', marginBottom: 8, fontFamily: 'ui-monospace, monospace', fontSize: 9, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'rgba(242,239,233,0.45)' }}>
                        ¿En qué podemos ayudarte?
                      </label>
                      <textarea
                        required
                        rows={4}
                        placeholder="Contanos brevemente tu situación y qué estás buscando..."
                        value={form.mensaje}
                        onChange={e => setForm(f => ({ ...f, mensaje: e.target.value }))}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(242,239,233,0.1)',
                          color: '#f2efe9',
                          fontSize: 14,
                          outline: 'none',
                          resize: 'vertical',
                          boxSizing: 'border-box',
                          fontFamily: 'inherit',
                        }}
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
