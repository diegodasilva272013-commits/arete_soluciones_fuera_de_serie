'use client';

import { useEffect, useState } from 'react';
import { Component as RipplePulseLoader } from './ui/ripple-pulse-loader';

const SHOW_MS = 1800;

export function SplashLoader() {
  const [show, setShow] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = window.setTimeout(() => setFading(true), SHOW_MS);
    const hideTimer = window.setTimeout(() => setShow(false), SHOW_MS + 450);
    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  if (!show) return null;

  return (
    <div
      className={
        'fixed inset-0 z-[3000] flex items-center justify-center bg-black transition-opacity duration-500 ' +
        (fading ? 'opacity-0' : 'opacity-100')
      }
      aria-hidden="true"
    >
      <RipplePulseLoader />
    </div>
  );
}
