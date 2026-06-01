/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {},

  // Skip type-check and lint during Vercel build (tsc runs separately in CI if needed)
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
    ],
  },
}

module.exports = nextConfig
