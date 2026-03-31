import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [],
    unoptimized: true,
  },
  // Allow building even with TypeScript errors in dev
  typescript: {
    ignoreBuildErrors: false,
  },
  // Cloudflare Pages compatibility: output as standalone or edge
  // For local dev, leave as default (nodejs)
  // For CF Pages deployment: set output: 'export' (static) or use @cloudflare/next-on-pages
  // output: 'export', // Uncomment for CF Pages static export
}

export default nextConfig
