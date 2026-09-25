import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import s from '../corp.module.css';
import { waUrl, WA_MSG_GENERAL } from '../_content';

export const metadata: Metadata = {
  title: 'Gracias por tu consulta',
  robots: { index: false, follow: false },
};

const WA = waUrl(WA_MSG_GENERAL);

export default function GraciasPage() {
  return (
    <section className={s.pageHero}>
      <div className={s.pageHeroInner} style={{ textAlign: 'center' }}>
        <div className={s.kicker} style={{ justifyContent: 'center' }}>
          <span className={s.kickerLine} />
          <span className={s.kickerLabel}>Consulta recibida</span>
        </div>
        <h1 className={s.heroTitle}>Gracias.</h1>
        <p className={s.heroSub}>
          Recibimos tu consulta y te contactamos a la brevedad.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginTop: 8 }}>
          <Link href="/empresa" className={s.btnPrimary}>
            Volver al inicio <ArrowRight size={14} />
          </Link>
          <a href={WA} target="_blank" rel="noopener noreferrer" className={s.btnGhost}>
            Escribinos por WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
