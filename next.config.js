/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  webpack: (config, { dev, nextRuntime }) => {
    if (dev && nextRuntime === 'edge') {
      // Node 22 bloquea eval() en sandbox de edge runtime.
      // Next.js revierte devtool a eval-source-map; eliminamos el plugin directamente.
      config.devtool = false;
      config.plugins = config.plugins.filter((p) => {
        const name = p?.constructor?.name ?? '';
        return !name.includes('EvalSourceMap') && !name.includes('SourceMapDev');
      });
    }
    return config;
  },
};

module.exports = nextConfig;
