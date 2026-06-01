/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable ISR and server components
  experimental: {},
  
  // Image domains for external hotel/trek photos (add as needed)
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
    ],
  },

  // No redirects needed — admin panel is at /admin directly
}

module.exports = nextConfig
