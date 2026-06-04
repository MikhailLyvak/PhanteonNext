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
    return [
      {
        source: '/tron-proxy/:path*',
        destination: 'https://tron.algonix.org/:path*',
      },
      {
        source: '/api/screener/:path*',
        destination: 'https://pantheon-screener-service-47a52e37ec37.herokuapp.com/:path*',
      },
    ]
  },
};

export default nextConfig;
