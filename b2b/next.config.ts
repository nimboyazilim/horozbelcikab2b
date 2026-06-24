import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
 
const withNextIntl = createNextIntlPlugin();
const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  env: {
    MAINTENANCE_MODE: process.env.MAINTENANCE_MODE || 'false',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.horozeurope.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/**',
      },
    ],
  },
};

export default withNextIntl(nextConfig);