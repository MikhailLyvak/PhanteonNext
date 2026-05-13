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
    ],
  },
  async rewrites() {
    return [
      {
        source: '/tron-proxy/:path*',
        destination: 'https://tron.algonix.org/:path*',
      },
    ]
  },
};

export default nextConfig;
