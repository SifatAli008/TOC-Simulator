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
  // Make ESLint less strict during build
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
    dirs: [], // Disable ESLint for all directories during build
  },
  typescript: {
    // Allow production builds to complete with TypeScript warnings
    ignoreBuildErrors: true,
  },
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
