'use client';

/**
 * EN EL AIRE — el bloque de foco a pantalla completa. Vive como overlay
 * DENTRO de Hoy (no es una ruta propia): así "sobrevivir a un reload"
 * es gratis — hoy/page.tsx ya detecta en el servidor si hay un bloque
 * EN_EL_AIRE y arranca el overlay directo, leyendo inicio_real de la
 * base. El cronómetro nunca usa localStorage: cada segundo vuelve a
 * calcular transcurrido = ahora - inicio_real (de la base).
 */

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, useReducedMotion } from 'framer-motion';
import { registrarInterrupcion, terminarBloque } from '../actions';
import { copy } from '../_copy';
import s from './_en-el-aire.module.css';

const VolumetricStudio = dynamic(() => import('@/components/ui/volumetric-studio').then((m) => m.VolumetricStudio), { ssr: false });

function useFondoAnimado(prefiereReducido: boolean | null): boolean {
  const [potenciaSuficiente, setPotenciaSuficiente] = useState(true);
  useEffect(() => {
    const cores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency : undefined;
    setPotenciaSuficiente(typeof cores !== 'number' || cores > 4);
  }, []);
  return !prefiereReducido && potenciaSuficiente;
}

function formatearDuracion(totalSegundos: number): string {
  const h = Math.floor(totalSegundos / 3600);
  const m = Math.floor((totalSegundos % 3600) / 60);
  const sg = totalSegundos % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(sg)}` : `${pad(m)}:${pad(sg)}`;
}

export interface EnElAireProps {
  bloqueId: string;
  titulo: string;
  protocolo: string[];
  reglasFoco: string[];
  inicioReal: string;
  interrupcionesIniciales: number;
  mostrarDosMinutos: boolean;
  textoDosMinutos: string;
  onTerminar: (cumplido: boolean) => void;
}

export function EnElAire({
  bloqueId,
  titulo,
  protocolo,
  reglasFoco,
  inicioReal,
  interrupcionesIniciales,
  mostrarDosMinutos,
  textoDosMinutos,
  onTerminar,
}: EnElAireProps) {
  const prefiereReducido = useReducedMotion();
  const fondoAnimado = useFondoAnimado(prefiereReducido);
  const [ahora, setAhora] = useState(() => Date.now());
  const [interrupciones, setInterrupciones] = useState(interrupcionesIniciales);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const segundosTranscurridos = Math.max(0, Math.floor((ahora - new Date(inicioReal).getTime()) / 1000));

  async function meInterrumpieron() {
    setInterrupciones((n) => n + 1);
    await registrarInterrupcion(bloqueId);
  }

  async function terminar(cumplido: boolean) {
    if (!cumplido && !window.confirm(copy.enElAire.confirmarSalir)) return;
    setGuardando(true);
    const r = await terminarBloque(bloqueId, cumplido);
    setGuardando(false);
    if (!r.error) onTerminar(cumplido);
  }

  return (
    <motion.div className={s.overlay} layoutId="bloque-en-foco" transition={prefiereReducido ? { duration: 0 } : undefined}>
      {fondoAnimado ? <VolumetricStudio className={s.fondoAnimado} /> : <div className={s.fondoEstatico} />}
      <div className={s.contenido}>
        <div className={s.onAir}>
          <span className={s.onAirPunto} />
          <span className={s.onAirLabel}>{copy.enElAire.onAir}</span>
        </div>

        {mostrarDosMinutos && (
          <div className={s.dosMinutos}>
            <p className={s.dosMinutosLabel}>{copy.enElAire.dosMinutosLabel}</p>
            <p className={s.dosMinutosTexto}>{textoDosMinutos}</p>
          </div>
        )}

        <div className={s.cronometro}>{formatearDuracion(segundosTranscurridos)}</div>
        <h1 className={s.tareaTitulo}>{titulo}</h1>

        {protocolo.length > 0 && (
          <div className={s.protocolo}>
            {protocolo.map((paso, i) => (
              <div key={i} className={s.protocoloPaso}>
                <span className={s.protocoloNumero}>{String(i + 1).padStart(2, '0')}</span>
                <span>{paso}</span>
              </div>
            ))}
          </div>
        )}

        {reglasFoco.length > 0 && (
          <div className={s.reglasFoco}>
            <p className={s.reglasFocoTitulo}>{copy.enElAire.reglasFocoTitulo}</p>
            {reglasFoco.map((regla, i) => (
              <p key={i} className={s.reglaFoco}>
                {regla}
              </p>
            ))}
          </div>
        )}

        <p className={s.interrupciones}>{copy.enElAire.interrupciones(interrupciones)}</p>

        <div className={s.acciones}>
          <button type="button" className={s.btnTermine} onClick={() => terminar(true)} disabled={guardando}>
            {copy.enElAire.termine}
          </button>
          <div className={s.filaSecundaria}>
            <button type="button" className={s.btnInterrupcion} onClick={meInterrumpieron} disabled={guardando}>
              {copy.enElAire.meInterrumpieron}
            </button>
            <button type="button" className={s.btnSalir} onClick={() => terminar(false)} disabled={guardando}>
              {copy.enElAire.salir}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
