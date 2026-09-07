'use client';

import { useEffect, useRef, useState } from 'react';
import { Component as RipplePulseLoader } from './ui/ripple-pulse-loader';

const SHOW_MS = 1800;
const FADE_MS = 450;

export function SplashLoader() {
  const [show, setShow] = useState(true);
  const [fading, setFading] = useState(false);
  const dismissedRef = useRef(false);

  function dismiss() {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    setFading(true);
    window.setTimeout(() => setShow(false), FADE_MS);
  }

  useEffect(() => {
    const timer = window.setTimeout(dismiss, SHOW_MS);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!show) return null;

  return (
    <div
      className={
        'fixed inset-0 z-[3000] flex items-center justify-center bg-black transition-opacity duration-500 ' +
        (fading ? 'opacity-0' : 'opacity-100')
      }
      aria-hidden="true"
      onClick={dismiss}
    >
      <RipplePulseLoader />
    </div>
  );
}
