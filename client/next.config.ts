import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Commented out for now - static export doesn't work well with dynamic routes
  // output: 'export', // Enable static export
  trailingSlash: true, // Important for static hosting
  experimental: {
    optimizeCss: true,
  },
  images: {
    // Optimisation on: images are resized and served as WebP/AVIF
    // (was disabled for an old static-export setup that is no longer used)
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cms.selfscore.net",
        port: "",
        pathname: "/wp-content/uploads/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/fonts/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
