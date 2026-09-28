'use client';

import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import s from '../payma.module.css';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

// Separa "10. Título de la sección" en { numero: "10.", titulo: "Título de la sección" }.
// Si el h2 no arranca con un número, se muestra entero como título, sin kicker.
function splitHeading(children: string): { numero: string | null; titulo: string } {
  const m = /^(\d+\.)\s*(.*)$/.exec(children.trim());
  if (m) return { numero: m[1], titulo: m[2] };
  return { numero: null, titulo: children };
}

function textOf(node: any): string {
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (node?.props?.children) return textOf(node.props.children);
  return '';
}

export function Proposal({ markdown }: { markdown: string }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const sections = Array.from(root.querySelectorAll<HTMLElement>(`.${s.reveal}`));
    const triggers = sections.map((el) =>
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        onEnter: () => el.classList.add(s.revealOn),
        once: true,
      })
    );
    return () => triggers.forEach((t) => t.kill());
  }, [markdown]);

  return (
    <div ref={rootRef} className={s.inner}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ children }) => {
            const { numero, titulo } = splitHeading(textOf(children));
            return (
              <div className={`${s.sectionHead} ${s.reveal}`}>
                {numero && <span className={s.kicker}>{numero}</span>}
                <h2 className={s.sectionTitle}>{titulo}</h2>
              </div>
            );
          },
          h3: ({ children }) => <h3 className={`${s.reveal}`}>{children}</h3>,
          p: ({ children }) => <p className={`${s.body} ${s.reveal}`}>{children}</p>,
          ul: ({ children }) => <ul className={`${s.body} ${s.reveal}`}>{children}</ul>,
          ol: ({ children }) => <ol className={`${s.body} ${s.reveal}`}>{children}</ol>,
          table: ({ children }) => (
            <div className={`${s.tableWrap} ${s.reveal}`}>
              <table className={s.table}>{children}</table>
            </div>
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
