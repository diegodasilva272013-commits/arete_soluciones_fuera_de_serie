/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  webpack: (config, { isServer }) => {
    // @splinetool/runtime usa archivos .wasm que webpack necesita manejar
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    // En server-side, externalize los paquetes de Spline para que no se bundleen
    if (isServer) {
      const existingExternals = Array.isArray(config.externals) ? config.externals : [];
      config.externals = [
        ...existingExternals,
        '@splinetool/runtime',
        '@splinetool/react-spline',
      ];
    }

    return config;
  },
};

module.exports = nextConfig;
