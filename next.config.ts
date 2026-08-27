import type { NextConfig } from 'next';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const nextConfig: NextConfig = {
  turbopack: { root: dirname(fileURLToPath(import.meta.url)) },
  allowedDevOrigins: ['127.0.0.1'],
  experimental: { serverActions: { bodySizeLimit: '10mb' } },
  async headers() {
    return [
      {
        source: '/embed/:publicKey',
        headers: [{ key: 'content-security-policy', value: 'frame-ancestors *' }],
      },
      {
        source: '/widget.js',
        headers: [
          { key: 'access-control-allow-origin', value: '*' },
          { key: 'cache-control', value: 'public, max-age=300' },
        ],
      },
    ];
  },
};

export default nextConfig;
