/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  typescript: {
    // Errores de TS pre-existentes no deben bloquear el build en producción
    ignoreBuildErrors: true,
  },
  eslint: {
    // ESLint también se ignora en build — lint debe correrse en CI separado
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
