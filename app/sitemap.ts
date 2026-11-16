import type { MetadataRoute } from 'next'
import { getLandingPagesSitemapEntries } from '@/lib/seo/sitemap'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://localhost:3000'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const landingPages = await getLandingPagesSitemapEntries()

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ]

  return [...staticRoutes, ...landingPages]
}
