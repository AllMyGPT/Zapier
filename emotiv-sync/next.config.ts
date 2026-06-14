import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Mounted under emotiv.es/team so it coexists with the sales site and the
  // accounting app on the same domain without colliding on routes or assets.
  basePath: '/team',

  compress: true,
  poweredByHeader: false,

  // Internal team tool: keep it out of search engines entirely.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
    ]
  },
}

export default nextConfig
