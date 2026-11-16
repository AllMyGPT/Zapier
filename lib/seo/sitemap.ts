import type { MetadataRoute } from 'next'
import { createPublicClient } from '@/lib/supabase/server'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://localhost:3000'

export async function getLandingPagesSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    const supabase = createPublicClient()
    const { data: pages } = await supabase
      .from('landing_pages')
      .select('slug, updated_at')
      .eq('status', 'published')
      .order('updated_at', { ascending: false })

    if (!pages) return []

    return pages.map((page) => ({
      url: `${SITE_URL}/${page.slug}`,
      lastModified: new Date(page.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
  } catch {
    return []
  }
}
