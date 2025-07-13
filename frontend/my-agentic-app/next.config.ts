import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  experimental: {
    // Server actions are enabled by default in newer versions of Next.js
  },
  // Suppress hydration warnings from browser extensions
  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;
