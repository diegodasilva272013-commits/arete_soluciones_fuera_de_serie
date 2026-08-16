import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { BrandLogo } from '@/components/brand/brand-logo';

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: '#050505' }}>

      {/* Ambient light — sutil, no genérico */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div style={{ position:'absolute', right:'-5%', top:'10%', width:'500px', height:'500px', borderRadius:'50%', background:'#1a6fff', opacity:'0.045', filter:'blur(120px)' }} />
        <div style={{ position:'absolute', left:'30%', top:'-10%', width:'400px', height:'400px', borderRadius:'50%', background:'#1a6fff', opacity:'0.03', filter:'blur(100px)' }} />
      </div>

      {/* ── NAV ── */}
      <header style={{ position:'relative', zIndex:20, display:'flex', alignItems:'center', justifyContent:'space-between', maxWidth:'1152px', margin:'0 auto', padding:'20px 32px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <BrandLogo size="md" priority />
          <div>
            <p style={{ fontSize:'14px', fontWeight:700, color:'#f5f5f5', letterSpacing:'-0.01em' }}>Areté Soluciones</p>
            <p style={{ fontSize:'10px', fontWeight:600, letterSpacing:'0.22em', textTransform:'uppercase', color:'#1a6fff', marginTop:'1px' }}>Fuera de Serie</p>
          </div>
        </div>
        <nav style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <Link href="/login" style={{ padding:'9px 20px', borderRadius:'999px', border:'1px solid rgba(255,255,255,0.08)', fontSize:'13px', fontWeight:500, color:'rgba(255,255,255,0.5)', textDecoration:'none', transition:'all .2s' }}>
            Iniciar sesión
          </Link>
          <Link href="/register" style={{ padding:'9px 20px', borderRadius:'999px', background:'#1a6fff', fontSize:'13px', fontWeight:700, color:'#fff', textDecoration:'none', boxShadow:'0 4px 20px rgba(26,111,255,0.35)' }}>
            Crear cuenta
          </Link>
        </nav>
      </header>

      {/* ── HERO ── */}
      <section style={{ position:'relative', zIndex:10, maxWidth:'1152px', margin:'0 auto', padding:'40px 32px 80px', display:'grid', gridTemplateColumns:'1fr auto', alignItems:'center', gap:'60px', minHeight:'85vh' }}>

        {/* ── Columna de texto — editorial, sin clichés ── */}
        <div style={{ display:'flex', flexDirection:'column', justifyContent:'center' }}>

          {/* Eyebrow */}
          <p style={{ fontSize:'11px', fontWeight:700, letterSpacing:'0.25em', textTransform:'uppercase', color:'rgba(26,111,255,0.8)', marginBottom:'28px', display:'flex', alignItems:'center', gap:'10px' }}>
            <span style={{ display:'inline-block', width:'28px', height:'1.5px', background:'#1a6fff', opacity:0.6, borderRadius:'2px' }} />
            Sala privada · Solo por invitación
          </p>

          {/* Headline — masiva, sin "domina" ni clichés */}
          <h1 style={{ margin:0, lineHeight:'0.95', letterSpacing:'-0.04em', fontWeight:900, color:'#ffffff' }}>
            <span style={{ display:'block', fontSize:'clamp(52px, 7vw, 88px)', color:'rgba(255,255,255,0.15)' }}>CAMINO</span>
            <span style={{ display:'block', fontSize:'clamp(52px, 7vw, 88px)' }}>AL</span>
            <span style={{ display:'block', fontSize:'clamp(52px, 7vw, 88px)', color:'#1a6fff', textShadow:'0 0 80px rgba(26,111,255,0.35)' }}>CLOSING</span>
          </h1>

          {/* Línea divisora */}
          <div style={{ display:'flex', alignItems:'center', gap:'16px', margin:'32px 0' }}>
            <div style={{ height:'1px', width:'48px', background:'rgba(255,255,255,0.12)' }} />
            <p style={{ margin:0, fontSize:'15px', fontWeight:400, color:'rgba(255,255,255,0.38)', lineHeight:'1.6', letterSpacing:'-0.01em' }}>
              Plataforma privada de entrenamiento<br />para vendedores de alto rendimiento.
            </p>
          </div>

          {/* CTAs */}
          <div style={{ display:'flex', alignItems:'center', gap:'12px', marginTop:'8px' }}>
            <Link href="/register" style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'14px 28px', borderRadius:'999px', background:'#1a6fff', fontSize:'14px', fontWeight:700, color:'#fff', textDecoration:'none', boxShadow:'0 8px 32px rgba(26,111,255,0.4)', letterSpacing:'-0.01em' }}>
              Entrar
              <ArrowRight style={{ width:'16px', height:'16px' }} />
            </Link>
            <Link href="/login" style={{ padding:'14px 24px', borderRadius:'999px', border:'1px solid rgba(255,255,255,0.07)', fontSize:'14px', fontWeight:500, color:'rgba(255,255,255,0.35)', textDecoration:'none', letterSpacing:'-0.01em' }}>
              Ya tengo cuenta
            </Link>
          </div>

          {/* Minimal trust signal */}
          <p style={{ marginTop:'28px', fontSize:'11px', letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.15)', fontWeight:500 }}>
            Acceso verificado &nbsp;·&nbsp; Contenido exclusivo &nbsp;·&nbsp; Comunidad activa
          </p>
        </div>

        {/* ── Phone frame ── */}
        <div style={{ position:'relative', flexShrink:0 }}>

          {/* Glow */}
          <div style={{ position:'absolute', inset:'-15%', borderRadius:'60px', background:'#1a6fff', opacity:'0.15', filter:'blur(60px)', pointerEvents:'none' }} />

          {/* Teléfono */}
          <div style={{
            position:'relative',
            width:'272px',
            height:'560px',
            borderRadius:'50px',
            background:'linear-gradient(160deg,#1c1c1e,#0a0a0a)',
            boxShadow:'0 0 0 1px rgba(255,255,255,0.07), 0 60px 140px rgba(0,0,0,0.95), inset 0 1px 0 rgba(255,255,255,0.07)',
            padding:'10px',
          }}>

            {/* Botones físicos */}
            <div style={{ position:'absolute', right:'-4px', top:'95px', width:'4px', height:'48px', borderRadius:'0 3px 3px 0', background:'#1a1a1c' }} />
            <div style={{ position:'absolute', left:'-4px', top:'80px', width:'4px', height:'34px', borderRadius:'3px 0 0 3px', background:'#1a1a1c' }} />
            <div style={{ position:'absolute', left:'-4px', top:'124px', width:'4px', height:'62px', borderRadius:'3px 0 0 3px', background:'#1a1a1c' }} />

            {/* Pantalla */}
            <div style={{ position:'relative', width:'100%', height:'100%', borderRadius:'42px', overflow:'hidden', background:'#000' }}>

              {/* Notch */}
              <div style={{ position:'absolute', top:'10px', left:'50%', transform:'translateX(-50%)', width:'88px', height:'24px', borderRadius:'20px', background:'#0a0a0a', zIndex:10, boxShadow:'inset 0 0 0 1px rgba(255,255,255,0.04)' }} />

              {/* Video — muted nativo */}
              <div style={{ position:'absolute', inset:0 }} dangerouslySetInnerHTML={{ __html:
                `<video src="/video_pagina.mp4" autoplay muted playsinline loop style="width:100%;height:100%;object-fit:cover;display:block;"></video>`
              }} />

              {/* Overlays */}
              <div style={{ position:'absolute', inset:'0 0 auto 0', height:'90px', background:'linear-gradient(to bottom,rgba(0,0,0,0.5),transparent)', zIndex:2, pointerEvents:'none' }} />
              <div style={{ position:'absolute', inset:'auto 0 0 0', height:'90px', background:'linear-gradient(to top,rgba(0,0,0,0.55),transparent)', zIndex:2, pointerEvents:'none' }} />
            </div>
          </div>

          {/* Badge */}
          <div style={{
            position:'absolute', bottom:'-16px', left:'50%', transform:'translateX(-50%)',
            display:'flex', alignItems:'center', gap:'8px', whiteSpace:'nowrap',
            background:'rgba(8,8,8,0.96)', border:'1px solid rgba(255,255,255,0.07)',
            borderRadius:'999px', padding:'8px 18px',
            boxShadow:'0 8px 32px rgba(0,0,0,0.7)',
          }}>
            <span style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#22c55e', boxShadow:'0 0 8px #22c55e', flexShrink:0 }} />
            <span style={{ fontSize:'12px', fontWeight:600, color:'rgba(255,255,255,0.7)', letterSpacing:'0.02em' }}>Comunidad activa</span>
          </div>
        </div>

      </section>

      {/* ── Strip inferior — minimal, sin cards rellenas ── */}
      <section style={{ position:'relative', zIndex:10, maxWidth:'1152px', margin:'0 auto', padding:'0 32px 80px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1px', border:'1px solid rgba(255,255,255,0.05)', borderRadius:'20px', overflow:'hidden' }}>
          {[
            { n: '01', t: 'Entrenamiento real', d: 'Apertura, manejo de objeciones y cierre con estructura clara.' },
            { n: '02', t: 'Comunidad privada', d: 'Feedback directo, llamadas compartidas y red de closers activos.' },
            { n: '03', t: 'Mentorías en vivo', d: 'Roleplays y revisiones personalizadas cada semana.' },
          ].map((f) => (
            <div key={f.n} style={{ padding:'32px 28px', background:'rgba(255,255,255,0.015)' }}>
              <p style={{ margin:'0 0 16px', fontSize:'11px', fontWeight:700, letterSpacing:'0.2em', color:'rgba(26,111,255,0.6)' }}>{f.n}</p>
              <p style={{ margin:'0 0 8px', fontSize:'14px', fontWeight:700, color:'rgba(255,255,255,0.85)', letterSpacing:'-0.01em' }}>{f.t}</p>
              <p style={{ margin:0, fontSize:'13px', lineHeight:'1.6', color:'rgba(255,255,255,0.28)' }}>{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ position:'relative', zIndex:10, borderTop:'1px solid rgba(255,255,255,0.04)', padding:'24px 32px', textAlign:'center', fontSize:'11px', color:'rgba(255,255,255,0.18)', letterSpacing:'0.05em' }}>
        © {new Date().getFullYear()} Areté Soluciones · Todos los derechos reservados
      </footer>

    </div>
  );
}
