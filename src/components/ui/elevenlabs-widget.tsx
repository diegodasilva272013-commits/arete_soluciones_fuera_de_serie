'use client';

import { useEffect } from 'react';

// Declara el custom element para TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'elevenlabs-convai': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        'agent-id': string;
      };
    }
  }
}

export function ElevenLabsWidget() {
  useEffect(() => {
    // Evita duplicar el script si ya existe
    if (document.querySelector('script[src*="elevenlabs.io/convai-widget"]')) return;

    const script = document.createElement('script');
    script.src = 'https://elevenlabs.io/convai-widget/index.js';
    script.async = true;
    script.type = 'text/javascript';
    document.body.appendChild(script);

    return () => {
      // No lo removemos al desmontar — es un widget global que debe persistir
    };
  }, []);

  return (
    <elevenlabs-convai agent-id="agent_0701m2fyqzbffg3v5x1s94xckhpc" />
  );
}
