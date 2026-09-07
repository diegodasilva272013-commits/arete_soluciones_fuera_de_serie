import Link from 'next/link';
import Image from 'next/image';
import s from './_footer.module.css';
import { waLink, EMAIL, WA_NUMBER_DISPLAY } from './constants';
import { ArrowLink } from '@/components/empresa/ArrowLink';

const NAV = [
  { href: '/empresa',             label: 'Inicio'      },
  { href: '/empresa/servicios',   label: 'Servicios'   },
  { href: '/empresa/metodologia', label: 'Metodología' },
  { href: '/empresa/nosotros',    label: 'Nosotros'    },
  { href: '/empresa/contacto',    label: 'Contacto'    },
];

const AREAS = [
  { href: '/empresa/servicios#ventas',         label: 'Ventas'         },
  { href: '/empresa/servicios#marketing',      label: 'Marketing'      },
  { href: '/empresa/servicios#administracion', label: 'Administración' },
  { href: '/empresa/servicios#delivery',       label: 'Delivery'       },
];

const WA = waLink('Hola, quiero saber más sobre el diagnóstico de Areté Soluciones');

export function CorpFooter() {
  return (
    <footer className={s.footer}>
      <div className={s.inner}>

        {/* Col 1 — Marca */}
        <div className={s.brand}>
          <Link href="/empresa" style={{ display: 'inline-flex', alignItems: 'center' }}>
            <Image
              src="/LOGO_ARETE.png"
              alt="Areté Soluciones"
              width={130}
              height={38}
              style={{ height: 32, width: 'auto', objectFit: 'contain' }}
            />
          </Link>
          <p className={s.tagline}>
            Diseñamos e implementamos sistemas empresariales que se adaptan a la forma real de trabajar de cada empresa.
          </p>
          <div className={s.contact}>
            <a href={WA} target="_blank" rel="noopener noreferrer" className={s.contactLink}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              {WA_NUMBER_DISPLAY}
            </a>
            <a href={`mailto:${EMAIL}`} className={s.contactLink}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
              </svg>
              {EMAIL}
            </a>
          </div>
        </div>

        {/* Col 2 — Navegación */}
        <div className={s.col}>
          <h4 className={s.colTitle}>Empresa</h4>
          <ul className={s.colList}>
            {NAV.map(({ href, label }) => (
              <li key={href + label}>
                <Link href={href} className={s.colLink}>{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3 — Áreas */}
        <div className={s.col}>
          <h4 className={s.colTitle}>Áreas</h4>
          <ul className={s.colList}>
            {AREAS.map(({ href, label }) => (
              <li key={label}>
                <Link href={href} className={s.colLink}>{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 4 — CTA */}
        <div className={s.col}>
          <h4 className={s.colTitle}>¿Tiene sentido hablar?</h4>
          <p className={s.colBody}>Una conversación de 30 minutos para entender tu situación. Sin costo.</p>
          <ArrowLink href={WA} target="_blank" rel="noopener noreferrer" className={s.colCta}>
            Hablar con el equipo
          </ArrowLink>
        </div>

      </div>

      <div className={s.bottom}>
        <div className={s.bottomInner}>
          <span>© {new Date().getFullYear()} Areté Soluciones · Buenos Aires, Argentina</span>
        </div>
      </div>
    </footer>
  );
}
