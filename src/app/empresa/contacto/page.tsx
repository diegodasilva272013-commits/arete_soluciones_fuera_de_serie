import type { Metadata } from 'next';
import { Phone, Mail, MessageCircle, MapPin } from 'lucide-react';
import s from '../corp.module.css';
import { RevealObserver } from '../_reveal';
import { waLink, EMAIL, WA_NUMBER_DISPLAY, PHONE_TEL, PHONE_DISPLAY } from '../constants';
import { ContactForm } from '@/components/empresa/ContactForm';
import { ArrowIcon } from '@/components/empresa/ArrowLink';

export const metadata: Metadata = {
  title: 'Contacto — Areté Soluciones',
  description: 'Hablemos de tu operación. WhatsApp, teléfono, email o el formulario — elegí el canal que prefieras.',
};

const WA = waLink('Hola, quiero saber más sobre el diagnóstico de Areté Soluciones');

// El formulario solo se muestra si hay un proveedor de mail configurado.
// Nunca se simula un envío — si no hay RESEND_API_KEY, queda solo WhatsApp.
const FORM_ENABLED = Boolean(process.env.RESEND_API_KEY);

export default function ContactoPage() {
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
          <div className={FORM_ENABLED ? s.splitGrid : undefined} style={FORM_ENABLED ? undefined : { maxWidth: 640, margin: '0 auto' }}>

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
                    <p style={{ margin: '0 0 4px', fontFamily: 'ui-monospace, monospace', fontSize: 12, color: '#25D366' }}>{WA_NUMBER_DISPLAY}</p>
                    <p style={{ margin: 0, fontSize: 12, color: 'rgba(242,239,233,0.38)' }}>Respuesta en menos de 2 horas, lunes a viernes de 9 a 18</p>
                  </div>
                  <ArrowIcon />
                </a>

                {/* Teléfono */}
                <a
                  href={`tel:${PHONE_TEL}`}
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
                    <p style={{ margin: '0 0 4px', fontFamily: 'ui-monospace, monospace', fontSize: 12, color: 'rgba(242,239,233,0.55)' }}>{PHONE_DISPLAY}</p>
                    <p style={{ margin: 0, fontSize: 12, color: 'rgba(242,239,233,0.38)' }}>Lunes a viernes de 9 a 18 (Argentina)</p>
                  </div>
                  <ArrowIcon />
                </a>

                {/* Email */}
                <a
                  href={`mailto:${EMAIL}`}
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
                    <p style={{ margin: '0 0 4px', fontFamily: 'ui-monospace, monospace', fontSize: 12, color: 'rgba(242,239,233,0.55)' }}>{EMAIL}</p>
                    <p style={{ margin: 0, fontSize: 12, color: 'rgba(242,239,233,0.38)' }}>Respuesta en 24 horas hábiles</p>
                  </div>
                  <ArrowIcon />
                </a>

                {/* Ubicación */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '20px 28px', border: '1px solid rgba(242,239,233,0.04)' }}>
                  <div style={{ width: 46, height: 46, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <MapPin size={18} color="rgba(242,239,233,0.25)" />
                  </div>
                  <div>
                    <p style={{ margin: '0 0 2px', fontWeight: 600, fontSize: 14, color: 'rgba(242,239,233,0.55)' }}>Buenos Aires, Argentina</p>
                    <p style={{ margin: 0, fontSize: 12, color: 'rgba(242,239,233,0.28)' }}>Operamos 100% remoto, en toda Latinoamérica</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulario — solo si hay proveedor de mail configurado */}
            {FORM_ENABLED && (
              <div className={`${s.reveal} ${s.revealDelay1}`} data-reveal="">
                <div style={{ padding: '40px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(242,239,233,0.07)', clipPath: 'polygon(20px 0,100% 0,100% calc(100% - 20px),calc(100% - 20px) 100%,0 100%,0 20px)' }}>
                  <h2 style={{ margin: '0 0 8px', fontWeight: 700, fontSize: 20, color: 'var(--hueso)' }}>Envianos un mensaje</h2>
                  <p style={{ margin: '0 0 32px', fontSize: 14, color: 'rgba(242,239,233,0.38)' }}>Te respondemos en menos de 24 horas hábiles.</p>
                  <ContactForm />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
