import type { NextConfig } from 'next';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const nextConfig: NextConfig = {
  turbopack: { root: dirname(fileURLToPath(import.meta.url)) },
  allowedDevOrigins: ['127.0.0.1'],
};

export default nextConfig;
