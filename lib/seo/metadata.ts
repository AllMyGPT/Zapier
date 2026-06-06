import type { Metadata } from 'next'
import type { LandingPage } from '@/lib/supabase/types'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://localhost:3000'
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? 'SEO Landing Pages'

export function buildPageMetadata(page: LandingPage): Metadata {
  const canonical = page.canonical_url ?? `${SITE_URL}/${page.slug}`
  const ogImage = page.og_image_url ?? `${SITE_URL}/og-default.png`

  return {
    title: page.title,
    description: page.meta_description ?? undefined,
    alternates: {
      canonical,
    },
    openGraph: {
      title: page.og_title ?? page.title,
      description: page.og_description ?? page.meta_description ?? undefined,
      url: canonical,
      siteName: SITE_NAME,
      images: [{ url: ogImage, width: 1200, height: 630, alt: page.og_title ?? page.title }],
      type: 'website',
      locale: 'es_ES',
    },
    twitter: {
      card: page.twitter_card ?? 'summary_large_image',
      title: page.og_title ?? page.title,
      description: page.og_description ?? page.meta_description ?? undefined,
      images: [ogImage],
    },
    robots: {
      index: page.status === 'published',
      follow: page.status === 'published',
      googleBot: {
        index: page.status === 'published',
        follow: page.status === 'published',
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

export function buildHomeMetadata(): Metadata {
  const description = process.env.NEXT_PUBLIC_SITE_DESCRIPTION ??
    'Boilerplate de landing pages SEO/GEO construido con Next.js, Vercel y Supabase.'

  return {
    title: {
      default: SITE_NAME,
      template: `%s | ${SITE_NAME}`,
    },
    description,
    metadataBase: new URL(SITE_URL),
    alternates: { canonical: SITE_URL },
    openGraph: {
      type: 'website',
      locale: 'es_ES',
      url: SITE_URL,
      siteName: SITE_NAME,
      title: SITE_NAME,
      description,
      images: [{ url: `${SITE_URL}/og-default.png`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}
