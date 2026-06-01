import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  sassOptions: {
    includePaths: ['./src'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'assets.coingecko.com',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    const target = process.env.SCREENER_SERVICE_URL ?? 'http://localhost:4000'
    return [
      {
        source: '/tron-proxy/:path*',
        destination: 'https://tron.algonix.org/:path*',
      },
      {
        source: '/api/screener/:path*',
        destination: `${target}/:path*`,
      },
    ]
  },
};

export default nextConfig;
