import Link from 'next/link';
import type { Metadata } from 'next';
import { brand } from '@/constants/branding';
import { BrandLogo } from '@/components/brand/brand-logo';
import { AccesoForm } from './_acceso-form';

export const metadata: Metadata = {
  title: 'Acceso',
  description: `Ingresá a tu cuenta de ${brand.name}.`,
};

export default function AccesoPage() {
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
          <source src="/video_2.mp4" type="video/mp4" />
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
            <h1 className="text-xl font-semibold text-white">Iniciar sesión</h1>
            <p className="mt-1 text-sm text-white/60">
              Accedé a tu sala privada de entrenamiento.
            </p>
          </div>

          <AccesoForm />

          <div className="mt-6 flex items-center justify-between text-xs text-white/50">
            <Link href="/forgot-password" className="hover:text-white">
              ¿Olvidaste tu contraseña?
            </Link>
            <Link href="/register" className="hover:text-white">
              Crear cuenta
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
