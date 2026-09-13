'use client';

interface SplineSceneProps {
  scene: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Embeds a Spline scene via iframe — evita totalmente los problemas de webpack/WASM.
 * La URL de runtime  https://prod.spline.design/<ID>/scene.splinecode
 * se convierte en    https://my.spline.design/<ID>/
 */
export function SplineScene({ scene, className, style }: SplineSceneProps) {
  // Extraer ID: "https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode" → "kZDDjO5HuC9GJUM2"
  const match = scene.match(/\/([A-Za-z0-9]+)\/scene\.splinecode$/);
  const embedUrl = match
    ? `https://my.spline.design/${match[1]}/`
    : scene;

  return (
    <iframe
      src={embedUrl}
      className={className}
      style={{ border: 'none', width: '100%', height: '100%', ...style }}
      allow="autoplay"
      loading="lazy"
      title="Spline 3D Scene"
    />
  );
}
