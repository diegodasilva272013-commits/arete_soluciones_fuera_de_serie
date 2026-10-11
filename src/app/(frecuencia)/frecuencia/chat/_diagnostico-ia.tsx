'use client';

import { useState } from 'react';
import { probarNvidia } from './_diagnostico-actions';

/** Panel solo para admin: dice si la clave de NVIDIA llegó al servidor y permite probar la conexión de verdad. */
export function DiagnosticoIA({ clave, variables, modelos }: { clave: boolean; variables: string[]; modelos: number }) {
  const [res, setRes] = useState<{ ok: boolean; detalle: string } | null>(null);
  const [ocupado, setOcupado] = useState(false);
  return (
    <section style={{ marginTop: 20, padding: 14, border: '1px solid rgba(255,255,255,0.15)', fontFamily: 'var(--f-mono), monospace', fontSize: 12, color: '#F2EFE9' }} aria-label="Diagnóstico de la IA">
      <p style={{ margin: 0, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#5C9AFF' }}>Diagnóstico (solo admin)</p>
      <p style={{ margin: '8px 0 0' }}>Clave de NVIDIA en el servidor: <strong style={{ color: clave ? '#7be07b' : '#ff6b6b' }}>{clave ? 'detectada' : 'NO detectada'}</strong></p>
      {!clave && <p style={{ margin: '4px 0 0' }}>Variables con "nvidia" en el nombre que llegan: {variables.length ? variables.join(', ') : 'ninguna'}. Revisá en Vercel que esté en Production y redeployá.</p>}
      <p style={{ margin: '4px 0 0' }}>Modelos de chat cargados en la base: {modelos}</p>
      <button
        type="button"
        disabled={ocupado}
        onClick={async () => {
          setOcupado(true);
          try { setRes(await probarNvidia()); } catch { setRes({ ok: false, detalle: 'No se pudo ejecutar la prueba.' }); } finally { setOcupado(false); }
        }}
        style={{ marginTop: 10, padding: '8px 12px', background: 'transparent', color: '#F2EFE9', border: '1px solid #5C9AFF', cursor: 'pointer' }}
      >
        {ocupado ? 'Probando…' : 'Probar conexión con NVIDIA'}
      </button>
      {res && <p role="status" style={{ margin: '8px 0 0', color: res.ok ? '#7be07b' : '#ff6b6b' }}>{res.detalle}</p>}
    </section>
  );
}
