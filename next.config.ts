import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Docker multi-stage builds — produces .next/standalone with a
  // self-contained server.js and a trimmed node_modules copy.
  output: 'standalone',
  images: {
    remotePatterns: [
      // Local backend (development)
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
        pathname: '/**',
      },
      // MinIO (local S3-compatible storage)
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '9000',
        pathname: '/**',
      },
      // Production CDN / media server (adjust hostname as needed)
      {
        protocol: 'https',
        hostname: '**',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
