import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Docker multi-stage builds — produces .next/standalone with a
  // self-contained server.js and a trimmed node_modules copy.
  output: 'standalone',
  images: {
    // Allow Next.js image optimizer to fetch from localhost / 127.0.0.1 in dev.
    // Next.js 15+ blocks private IPs by default (SSRF protection).
    // In production, campaign media must use a public CDN or S3 URL — never localhost.
    ...(process.env.NODE_ENV === 'development' ? ({ dangerouslyAllowLocalIP: true } as Record<string, unknown>) : {}),
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
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
      // Placeholder service
      {
        protocol: 'https',
        hostname: 'placehold.co',
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
