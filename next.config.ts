import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Enable server actions for submitting forms
  experimental: {
    serverActions: {},
  },
  // Add image domains if needed
  images: {
    domains: ['images.unsplash.com'],
  },
};

export default nextConfig;

