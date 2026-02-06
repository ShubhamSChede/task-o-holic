/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable the dev indicator / dev tools overlay that uses localStorage in Node
  devIndicators: false,
  images: {
    remotePatterns: [
      // Supabase storage (project host) - for existing avatar_urls that might point to Supabase
      {
        protocol: 'https',
        hostname: 'rkwfhhfyptfakritnudt.supabase.co',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;

