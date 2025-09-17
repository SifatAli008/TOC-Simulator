import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  images: {
    domains: ['firebasestorage.googleapis.com'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // Enable compression
  compress: true,
  // Optimize for production
  poweredByHeader: false,
  // Handle Firebase analytics in SSR
  async rewrites() {
    return [
      {
        source: '/api/firebase/:path*',
        destination: 'https://firebase.googleapis.com/:path*',
      },
    ];
  },
};

export default nextConfig;
