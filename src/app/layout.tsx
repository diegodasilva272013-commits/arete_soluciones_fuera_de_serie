import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { brand } from '@/constants/branding';
import { PWARegister } from '@/components/pwa-register';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://arete-soluciones-plataforma.vercel.app'),
  title: {
    default: brand.full,
    template: `%s — ${brand.name}`,
  },
  description: 'Comunidad privada de alto rendimiento para vendedores que solucionan problemas.',
  applicationName: brand.name,
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/Aretea_fuera _de_serie_logo.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/Aretea_fuera _de_serie_logo.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    type: 'website',
    url: 'https://arete-soluciones-plataforma.vercel.app',
    siteName: brand.name,
    title: brand.full,
    description: brand.description,
    locale: 'es_AR',
    images: [
      {
        url: 'https://arete-soluciones-plataforma.vercel.app/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Areté Soluciones — Fuera de Serie',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: brand.full,
    description: brand.description,
    images: ['https://arete-soluciones-plataforma.vercel.app/opengraph-image'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: brand.name,
  },
};

export const viewport: Viewport = {
  themeColor: brand.colors.background,
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} dark`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('cac:theme');if(t==='light')document.documentElement.classList.add('light');if(sessionStorage.getItem('cac:splash'))document.documentElement.classList.add('splash-done');}catch(e){}",
          }}
        />
        {/* Splash inline (no depende de React): aparece al instante */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              #cac-splash{position:fixed;inset:0;z-index:99999;background:#060606;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:28px;transition:opacity .6s ease}
              #cac-splash.cac-hide{opacity:0;pointer-events:none}
              html.splash-done #cac-splash{display:none!important}
              @keyframes cac-ring{0%,100%{transform:scale(1);opacity:.5}50%{transform:scale(1.12);opacity:.15}}
              @keyframes cac-logo-in{from{opacity:0;transform:scale(.88)}to{opacity:1;transform:scale(1)}}
              @keyframes cac-text-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
              #cac-splash .sp-ring{position:absolute;width:220px;height:220px;border-radius:50%;border:1.5px solid rgba(212,175,55,.35);animation:cac-ring 2.8s ease-in-out infinite}
              #cac-splash .sp-ring2{position:absolute;width:260px;height:260px;border-radius:50%;border:1px solid rgba(26,111,255,.2);animation:cac-ring 2.8s ease-in-out infinite .5s}
              #cac-splash .sp-logo{width:170px;height:170px;object-fit:contain;animation:cac-logo-in .7s cubic-bezier(.22,1,.36,1) both;border-radius:24px}
              #cac-splash .sp-name{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:13px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:rgba(212,175,55,.8);animation:cac-text-in .7s ease .3s both}
              #cac-splash .sp-dot{display:inline-block;width:4px;height:4px;border-radius:50%;background:rgba(26,111,255,.6);margin:0 2px;animation:cac-ring 1.2s ease-in-out infinite}
              #cac-splash .sp-dot:nth-child(2){animation-delay:.2s}
              #cac-splash .sp-dot:nth-child(3){animation-delay:.4s}
              #cac-splash .sp-dots{display:flex;align-items:center;margin-top:8px;animation:cac-text-in .5s ease .6s both}
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning className="min-h-screen bg-brand-black text-brand-text antialiased">
        {/* muted debe estar en el HTML nativo para que iOS/Android autoplay funcione */}
        <div
          id="cac-splash"
          aria-hidden="true"
          dangerouslySetInnerHTML={{
            __html: `
              <div class="sp-ring"></div>
              <div class="sp-ring2"></div>
              <img class="sp-logo" src="/icon-512.png" alt="Areté" />
              <div>
                <div class="sp-name">Areté Soluciones</div>
                <div class="sp-dots">
                  <span class="sp-dot"></span>
                  <span class="sp-dot"></span>
                  <span class="sp-dot"></span>
                </div>
              </div>
            `,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                var s=document.getElementById('cac-splash');
                if(!s)return;
                var done=false;
                function hide(){if(done)return;done=true;s.classList.add('cac-hide');}
                try{if(sessionStorage.getItem('cac:splash')){hide();return;}}catch(e){}
                function finish(){try{sessionStorage.setItem('cac:splash','1');}catch(e){}hide();}
                setTimeout(finish,2500);
                s.addEventListener('click',finish);
              })();
            `,
          }}
        />
        {children}
        <PWARegister />
      </body>
    </html>
  );
}
