/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Ignore ESLint errors during build
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Ignore TypeScript errors during build
    ignoreBuildErrors: false,
  },
};

module.exports = nextConfig;

