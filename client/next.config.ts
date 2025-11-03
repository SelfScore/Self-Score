import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cms.selfscore.net',
        port: '',
        pathname: '/wp-content/uploads/**',
      },
    ],
  },
  trailingSlash: true,
};

export default nextConfig;
