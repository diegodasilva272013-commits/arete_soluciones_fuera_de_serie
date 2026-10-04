/**
 * Stub de la Fase 2: solo prueba que el acceso funciona (middleware +
 * layout ya filtraron por rol antes de llegar acá). El Dial, el
 * Ecualizador y el resto de las pantallas son la Fase 3.
 */
export default function FrecuenciaHome() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#2F7BF6]">Frecuencia</p>
        <h1 className="mt-3 text-2xl font-semibold">Acceso confirmado.</h1>
        <p className="mt-2 text-sm text-[#8A8A8A]">El Dial y el resto de la app llegan en la Fase 3.</p>
      </div>
    </div>
  );
}
