'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { copy } from '../../_copy';
import base from '../../frecuencia.module.css';
import s from '../_equipo.module.css';
import type { EquipoConMiembros } from '../_datos';
import { agregarMiembro, buscarPersonas, cambiarLider, crearEquipo, sacarMiembro, type Persona } from './_actions';

const t = copy.equipo.admin;

/** Buscador de personas: escribe, ve resultados reales, elige una. */
function BuscadorPersona({ onElegir, excluir = [], etiqueta }: { onElegir: (p: Persona) => void; excluir?: string[]; etiqueta: string }) {
  const [q, setQ] = useState('');
  const [res, setRes] = useState<Persona[] | null>(null);
  useEffect(() => {
    if (q.trim().length < 2) {
      setRes(null);
      return;
    }
    let vigente = true;
    const id = setTimeout(async () => {
      const r = await buscarPersonas(q);
      if (vigente) setRes(r.filter((p) => !excluir.includes(p.id)));
    }, 250);
    return () => {
      vigente = false;
      clearTimeout(id);
    };
  }, [q]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className={s.buscador}>
      <input className={base.input} value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.buscarPlaceholder} aria-label={etiqueta} maxLength={60} />
      {res && (
        <div className={s.resultados} role="listbox">
          {res.length === 0 && <p className={base.ayuda} style={{ padding: 12 }}>{t.sinResultados}</p>}
          {res.map((p) => (
            <button
              key={p.id}
              type="button"
              className={s.resultado}
              onClick={() => {
                onElegir(p);
                setQ('');
                setRes(null);
              }}
            >
              <span>
                {p.nombre} <span className={s.filaMeta}>{p.email}</span>
              </span>
              <span className={s.filaMeta}>{t.elegir}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function AdminEquipos({ equipos }: { equipos: EquipoConMiembros[] }) {
  const router = useRouter();
  const [pendiente, empezar] = useTransition();
  const [nombre, setNombre] = useState('');
  const [lider, setLider] = useState<Persona | null>(null);
  const [error, setError] = useState<string | null>(null);

  function ejecutar(fn: () => Promise<{ ok?: boolean; error?: string }>, alTerminar?: () => void) {
    setError(null);
    empezar(async () => {
      const r = await fn();
      if (r.error) {
        setError(r.error);
        return;
      }
      alTerminar?.();
      router.refresh();
    });
  }

  return (
    <>
      <section className={`${s.tarjeta}`} style={{ marginTop: 28 }} aria-label={t.nuevoTitulo}>
        <p className={s.etiqueta}>{t.nuevoTitulo}</p>
        <div className={base.campo} style={{ marginTop: 14 }}>
          <label className={base.campoLabel} htmlFor="eq-nombre">{t.nombreLabel}</label>
          <input id="eq-nombre" className={base.input} value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder={t.nombrePlaceholder} maxLength={80} />
        </div>
        <div className={base.campo}>
          <span className={base.campoLabel}>{t.liderLabel}</span>
          {lider ? (
            <div className={s.elegido}>
              <span>{lider.nombre}</span>
              <button type="button" className={s.mini} onClick={() => setLider(null)}>{t.quitarEleccion}</button>
            </div>
          ) : (
            <BuscadorPersona etiqueta={t.liderLabel} onElegir={setLider} />
          )}
        </div>
        <div className={base.filaBotones}>
          <button
            type="button"
            className={base.btn}
            disabled={pendiente}
            onClick={() => {
              if (!nombre.trim()) return setError(t.faltaNombre);
              if (!lider) return setError(t.faltaLider);
              ejecutar(() => crearEquipo({ nombre, liderId: lider.id }), () => {
                setNombre('');
                setLider(null);
              });
            }}
          >
            {pendiente ? t.creando : t.crear}
          </button>
        </div>
        {error && <p className={s.error} role="alert">{error}</p>}
      </section>

      {equipos.length === 0 ? (
        <p className={s.vacio}>{t.sinEquipos}</p>
      ) : (
        <div className={s.lista}>
          {equipos.map((e) => (
            <section key={e.id} className={s.tarjeta} aria-label={e.nombre}>
              <h2 className={s.tarjetaTitulo}>{e.nombre}</h2>
              <div style={{ marginTop: 12 }}>
                {e.miembros.map((m) => (
                  <div key={m.userId} className={s.fila}>
                    <span className={s.filaNombre}>
                      {m.nombre} {m.esLider && <span className={s.filaMeta}>· {t.esLider}</span>}
                    </span>
                    {!m.esLider && (
                      <span className={s.acciones}>
                        <button type="button" className={s.mini} disabled={pendiente} onClick={() => ejecutar(() => cambiarLider({ equipoId: e.id, userId: m.userId }))}>
                          {t.hacerLider}
                        </button>
                        <button type="button" className={s.mini} disabled={pendiente} onClick={() => ejecutar(() => sacarMiembro({ equipoId: e.id, userId: m.userId }))}>
                          {t.sacar}
                        </button>
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <div className={base.campo} style={{ marginTop: 14 }}>
                <span className={base.campoLabel}>{t.agregarMiembro}</span>
                <BuscadorPersona
                  etiqueta={`${t.agregarMiembro} · ${e.nombre}`}
                  excluir={e.miembros.map((m) => m.userId)}
                  onElegir={(p) => ejecutar(() => agregarMiembro({ equipoId: e.id, userId: p.id }))}
                />
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
