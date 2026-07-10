import type { NextConfig } from "next";
import { getContentSecurityPolicy, getRemotePatterns } from './media-config.mjs';

const nextConfig: NextConfig = {
  // Required for Docker multi-stage builds — produces .next/standalone with a
  // self-contained server.js and a trimmed node_modules copy.
  output: 'standalone',
  allowedDevOrigins: ['192.168.10.111'],
  images: {
    // Allow Next.js image optimizer to fetch from localhost / 127.0.0.1 in dev.
    // Next.js 15+ blocks private IPs by default (SSRF protection).
    // In production, campaign media must use a public CDN or S3 URL — never localhost.
    ...(process.env.NODE_ENV === 'development' ? { dangerouslyAllowLocalIP: true } as Partial<NextConfig['images']> : {}),
    remotePatterns: getRemotePatterns(),
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: getContentSecurityPolicy(),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
