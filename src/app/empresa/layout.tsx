import type { Metadata } from 'next';
import { CorpHeader } from './_header';
import { CorpFooter } from './_footer';
import { WhatsAppFloat } from './_whatsapp';

export const metadata: Metadata = {
  metadataBase: new URL('https://arete-soluciones-plataforma.vercel.app'),
  title: {
    default: 'Areté Soluciones',
    template: '%s — Areté Soluciones',
  },
  description:
    'Transformamos equipos comerciales en máquinas de cierre. Consultoría y formación en ventas de alto rendimiento para empresas que quieren escalar.',
  openGraph: {
    type: 'website',
    siteName: 'Areté Soluciones',
    locale: 'es_AR',
  },
};

export default function EmpresaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: '#050505', minHeight: '100vh', color: '#f2efe9' }}>
      <CorpHeader />
      <main style={{ paddingTop: '68px' }}>
        {children}
      </main>
      <CorpFooter />
      <WhatsAppFloat />
    </div>
  );
}
