import Link from 'next/link';
import type { Metadata } from 'next';
import { brand } from '@/constants/branding';
import { BrandLogo } from '@/components/brand/brand-logo';
import { CrearCuentaForm } from './_crear-cuenta-form';

export const metadata: Metadata = {
  title: 'Crear cuenta',
  description: `Unite a la sala privada de ${brand.name}.`,
};

export default function CrearCuentaPage() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-black px-4 py-12">
      {/* Video de fondo */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 z-10 bg-black/60" />
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="/video_logo_fuera_de_serie.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Contenido */}
      <div className="relative z-20 w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-3">
          <BrandLogo size="md" priority />
          <div className="text-center">
            <p className="text-sm font-semibold text-white">{brand.name}</p>
            <p className="text-[10px] uppercase tracking-widest text-[var(--azul-luz)]">
              {brand.tagline}
            </p>
          </div>
        </Link>

        <div className="rounded-2xl border border-white/10 bg-black/50 p-8 backdrop-blur-sm">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-semibold text-white">Crear cuenta</h1>
            <p className="mt-1 text-sm text-white/60">
              Unite a la sala privada de closers.
            </p>
          </div>

          <CrearCuentaForm />

          <p className="mt-6 text-center text-xs text-white/50">
            ¿Ya tenés cuenta?{' '}
            <Link href="/acceso" className="text-white hover:underline">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
