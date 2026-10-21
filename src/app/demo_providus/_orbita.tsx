/**
 * DEMO PROVIDUS — panel de marca de los ingresos.
 * El logo real queda al centro, en una placa de aluminio con la luz del video, y alrededor
 * giran los temas de la operación: la promotora, los datos, el tiempo real, el vivo, los
 * canales (Instagram, WhatsApp, llamada) y el CRM. Todo en la paleta del logo; los íconos
 * son propios (línea fina, mismo trazo) para que no desentonen como los de logos de terceros.
 * El giro es CSS puro: sin JavaScript, sin video, y se detiene con "reducir movimiento".
 */

const t = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.3, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const;

const ICONOS: Record<string, React.ReactNode> = {
  promotora: (
    <svg {...t}><circle cx="12" cy="9.2" r="4.1" /><path d="M7.9 8.4c.4-2.6 2.2-4.1 4.5-4.1 2.2 0 3.7 1.2 3.9 3.2-1.4-.1-2.7-.8-3.5-1.9-.5 1.5-2.2 2.6-4.9 2.8Z" /><path d="M4.6 20.2c.9-3.5 3.7-5.5 7.4-5.5s6.5 2 7.4 5.5" /></svg>
  ),
  datos: (
    <svg {...t}><ellipse cx="12" cy="6" rx="7" ry="2.8" /><path d="M5 6v6c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8V6M5 12v6c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8v-6" /></svg>
  ),
  tiempoReal: (
    <svg {...t}><path d="M3 12h3.4l2.2-6 4 12 2.4-6H21" /></svg>
  ),
  envivo: (
    <svg {...t}><circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none" /><path d="M7.6 7.6a6.2 6.2 0 0 0 0 8.8M16.4 7.6a6.2 6.2 0 0 1 0 8.8M4.8 4.8a10.2 10.2 0 0 0 0 14.4M19.2 4.8a10.2 10.2 0 0 1 0 14.4" /></svg>
  ),
  instagram: (
    <svg {...t}><rect x="3.8" y="3.8" width="16.4" height="16.4" rx="4.8" /><circle cx="12" cy="12" r="3.8" /><circle cx="16.9" cy="7.1" r=".9" fill="currentColor" stroke="none" /></svg>
  ),
  whatsapp: (
    <svg {...t}><path d="M4 20l1.2-4.1A8.2 8.2 0 1 1 8.2 19L4 20Z" /><path d="M9.2 8.8c.2-.5.6-.6 1-.2l.7 1.1c.2.3.1.6-.2.9l-.4.4c.6 1.1 1.5 2 2.7 2.6l.5-.5c.3-.3.6-.3.9-.1l1.1.7c.4.3.3.7-.1 1.1-.7.8-1.7.9-3 .3-2.3-1-4-2.9-4.5-4.7-.2-.7-.1-1.2.3-1.6Z" /></svg>
  ),
  llamada: (
    <svg {...t}><path d="M6.4 3.8 9 3.5l1.4 3.6-1.7 1.3a11 11 0 0 0 5 5l1.3-1.7 3.6 1.4-.3 2.6a2.6 2.6 0 0 1-2.8 2.3A15.3 15.3 0 0 1 4.1 6.6a2.6 2.6 0 0 1 2.3-2.8Z" /></svg>
  ),
  crm: (
    <svg {...t}><rect x="3.6" y="4.4" width="4.8" height="15.2" rx="1.4" /><rect x="9.6" y="4.4" width="4.8" height="9.6" rx="1.4" /><rect x="15.6" y="4.4" width="4.8" height="12.4" rx="1.4" /></svg>
  ),
};

/** radio (px lógicos), duración (s), desfase (s), sentido y tamaño de cada insignia. */
const ORBITA: { clave: keyof typeof ICONOS; etiqueta: string; radio: number; dur: number; desfase: number; inverso?: boolean; tam: number }[] = [
  { clave: 'whatsapp', etiqueta: 'WhatsApp', radio: 168, dur: 38, desfase: 0, tam: 52 },
  { clave: 'llamada', etiqueta: 'Llamada', radio: 168, dur: 38, desfase: 19, tam: 52 },
  { clave: 'promotora', etiqueta: 'Promotora', radio: 236, dur: 54, desfase: 0, inverso: true, tam: 64 },
  { clave: 'datos', etiqueta: 'Datos', radio: 236, dur: 54, desfase: 18, inverso: true, tam: 56 },
  { clave: 'instagram', etiqueta: 'Instagram', radio: 236, dur: 54, desfase: 36, inverso: true, tam: 52 },
  { clave: 'envivo', etiqueta: 'En vivo', radio: 304, dur: 72, desfase: 0, tam: 56 },
  { clave: 'tiempoReal', etiqueta: 'Tiempo real', radio: 304, dur: 72, desfase: 24, tam: 52 },
  { clave: 'crm', etiqueta: 'CRM', radio: 304, dur: 72, desfase: 48, tam: 60 },
];

export function PanelMarca() {
  return (
    <div className="pv-orbita-marco" role="img" aria-label="Providus: promotoras, datos, tiempo real, WhatsApp, Instagram, llamadas y CRM conectados">
      <div className="pv-orbita-escala">
        {[168, 236, 304].map((r, i) => (
          <span key={r} className="pv-anillo" style={{ width: r * 2, height: r * 2, ['--i' as string]: i }} />
        ))}
        {ORBITA.map((o) => (
          <span key={o.clave} className="pv-giro" style={{ ['--r' as string]: `${o.radio}px`, ['--d' as string]: `${o.dur}s`, ['--o' as string]: `${-o.desfase}s`, ['--ang' as string]: `${Math.round((o.desfase / o.dur) * 360 * (o.inverso ? -1 : 1))}deg`, animationDirection: o.inverso ? 'reverse' : 'normal' }}>
            <span className="pv-insignia" title={o.etiqueta} style={{ width: o.tam, height: o.tam, animationDirection: o.inverso ? 'normal' : 'reverse' }}>
              <span className="pv-insignia-ico" style={{ width: o.tam * 0.46, height: o.tam * 0.46 }}>{ICONOS[o.clave]}</span>
            </span>
          </span>
        ))}
        <div className="pv-placa">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/demo-providus/hero-final.jpg" alt="" className="pv-placa-img" />
          <span className="pv-luz" aria-hidden="true" />
        </div>
      </div>
      <p className="pv-orbita-pie">Cada contacto, identificado y en vivo.</p>
    </div>
  );
}
