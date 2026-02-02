import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Commented out for now - static export doesn't work well with dynamic routes
  // output: 'export', // Enable static export
  trailingSlash: true, // Important for static hosting
  images: {
    unoptimized: true, // Required for static export
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cms.selfscore.net",
        port: "",
        pathname: "/wp-content/uploads/**",
      },
    ],
  },
};

export default nextConfig;
