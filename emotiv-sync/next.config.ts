import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Vercel deployment optimizations
  compress: true,
  poweredByHeader: false,
}

export default nextConfig
