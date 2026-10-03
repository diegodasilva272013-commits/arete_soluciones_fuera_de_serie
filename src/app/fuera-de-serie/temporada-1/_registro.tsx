'use client';

import { useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { ArrowUpRight, Check } from 'lucide-react';
import c from '@/app/empresa/corp.module.css';
import s from './t1.module.css';

type Estado = 'idle' | 'enviando' | 'listo';

const EASE = [0.16, 0.84, 0.28, 1] as const;

/** Formulario de inscripción. Al enviarse, hace crossfade + blur a la confirmación. */
export function RegistroForm({ compacto = false }: { compacto?: boolean }) {
  const [estado, setEstado] = useState<Estado>('idle');
  const [error, setError] = useState('');
  const [nombre, setNombre] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.reportValidity()) return;
    setError('');
    setEstado('enviando');

    const datos = Object.fromEntries(new FormData(form)) as Record<string, string>;
    try {
      const res = await fetch('/api/fuera-de-serie/temporada-1/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...datos, edad: Number(datos.edad) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? 'No pudimos guardar tu registro.');
      setNombre(datos.nombre);
      setEstado('listo');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos guardar tu registro.');
      setEstado('idle');
    }
  }

  const enviando = estado === 'enviando';

  return (
    <MotionConfig reducedMotion="user">
      <div className={compacto ? undefined : s.formCard}>
        <div className={s.xfade}>
          <AnimatePresence initial={false} mode="popLayout">
            {estado !== 'listo' ? (
              <motion.form
                key="form"
                onSubmit={onSubmit}
                exit={{ opacity: 0, filter: 'blur(12px)', scale: 0.98 }}
                transition={{ duration: 0.5, ease: EASE }}
              >
                <div className={s.formGrid}>
                  <label>
                    <span className={c.formLabel}>Nombre *</span>
                    <input name="nombre" required autoComplete="given-name" maxLength={80} className={c.formInput} disabled={enviando} />
                  </label>
                  <label>
                    <span className={c.formLabel}>Apellido *</span>
                    <input name="apellido" required autoComplete="family-name" maxLength={80} className={c.formInput} disabled={enviando} />
                  </label>
                  <label>
                    <span className={c.formLabel}>Edad *</span>
                    <input name="edad" required type="number" inputMode="numeric" min={14} max={99} className={c.formInput} disabled={enviando} />
                  </label>
                  <label>
                    <span className={c.formLabel}>Teléfono *</span>
                    <input name="telefono" required type="tel" autoComplete="tel" placeholder="+54 9 11 1234-5678" className={c.formInput} disabled={enviando} />
                  </label>
                  <label className={s.formFull}>
                    <span className={c.formLabel}>Mail * · ahí te llega el link de Zoom</span>
                    <input name="email" required type="email" autoComplete="email" className={c.formInput} disabled={enviando} />
                  </label>
                  <label className={s.formFull}>
                    <span className={c.formLabel}>¿Qué esperás de las clases? ¿Por qué querés participar? *</span>
                    <textarea
                      name="motivo"
                      required
                      minLength={10}
                      maxLength={2000}
                      rows={4}
                      className={`${c.formInput} ${c.formTextarea}`}
                      style={{ minHeight: 'auto' }}
                      disabled={enviando}
                    />
                  </label>
                </div>

                {/* Honeypot: invisible para personas */}
                <div className={s.honeypot} aria-hidden="true">
                  <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
                </div>

                {error && <p className={s.formError} role="alert">{error}</p>}

                <button type="submit" className={c.btnPrimary} style={{ marginTop: 28, width: '100%', justifyContent: 'center' }} disabled={enviando}>
                  {enviando ? 'Enviando…' : <>Reservar mi lugar <ArrowUpRight size={14} /></>}
                </button>
                <p className={s.formNote}>Usamos tus datos solo para mandarte la información de la temporada.</p>
              </motion.form>
            ) : (
              <motion.div
                key="ok"
                className={s.success}
                role="status"
                initial={{ opacity: 0, filter: 'blur(12px)', scale: 1.02 }}
                animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
                transition={{ duration: 0.7, ease: EASE }}
              >
                <div className={s.successIcon}><Check size={32} /></div>
                <span className={c.kickerLabel}>Inscripción confirmada</span>
                <h3 className={c.sectionTitle} style={{ marginTop: 14 }}>
                  Ya estás adentro, <em>{nombre}.</em>
                </h3>
                <p className={c.sectionSub} style={{ maxWidth: '46ch', margin: '0 auto' }}>
                  Te mandamos un mail de confirmación. En estos días te llega a ese mismo mail el link de Zoom para las clases. Primera clase: lunes 5 de octubre, 20 h.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </MotionConfig>
  );
}
