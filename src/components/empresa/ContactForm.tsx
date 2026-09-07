'use client';

import { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import s from '../../app/empresa/corp.module.css';

type FormState = 'idle' | 'sending' | 'done' | 'error';

/**
 * Formulario real: POSTea a /empresa/api/contacto y refleja la respuesta
 * real del servidor. Nunca simula un envío — si el fetch falla o el
 * servidor devuelve error, se muestra el estado de error real, con qué
 * pasó y qué hacer (WhatsApp).
 */
export function ContactForm() {
  const [form, setForm] = useState({ nombre: '', empresa: '', email: '', mensaje: '' });
  const [state, setState] = useState<FormState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('sending');
    setErrorMsg('');
    try {
      const res = await fetch('/empresa/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorMsg(data.error || 'No pudimos enviar el mensaje.');
        setState('error');
        return;
      }
      setState('done');
    } catch {
      setErrorMsg('No pudimos conectar con el servidor.');
      setState('error');
    }
  };

  return (
    <AnimatePresence mode="wait">
      {state === 'done' ? (
        <m.div
          key="done"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          style={{ textAlign: 'center', padding: '40px 0' }}
        >
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(var(--azul-rgb),0.12)', border: '1px solid rgba(var(--azul-rgb),0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--azul)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <p style={{ margin: '0 0 8px', fontWeight: 700, fontSize: 17, color: 'var(--hueso)' }}>Mensaje recibido</p>
          <p style={{ margin: 0, fontSize: 14, color: 'rgba(242,239,233,0.45)' }}>Te respondemos antes de las 24 horas hábiles.</p>
        </m.div>
      ) : (
        <m.form
          key="form"
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
        >
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
                required={field.id !== 'empresa'}
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
              rows={7}
              placeholder="Contanos brevemente tu situación y qué estás buscando..."
              value={form.mensaje}
              onChange={e => setForm(f => ({ ...f, mensaje: e.target.value }))}
              className={`${s.formInput} ${s.formTextarea}`}
            />
          </div>

          {state === 'error' && (
            <p role="alert" style={{ margin: 0, fontSize: 13, color: '#FF6B6B', lineHeight: 1.5 }}>
              {errorMsg} Escribinos por WhatsApp mientras tanto, es más rápido.
            </p>
          )}

          <button
            type="submit"
            disabled={state === 'sending'}
            className={s.btnPrimary}
            style={{ justifyContent: 'center', opacity: state === 'sending' ? 0.7 : 1, cursor: state === 'sending' ? 'wait' : 'pointer', border: 'none', width: '100%' }}
          >
            {state === 'sending' ? 'Enviando...' : 'Enviar mensaje'}
          </button>
        </m.form>
      )}
    </AnimatePresence>
  );
}
