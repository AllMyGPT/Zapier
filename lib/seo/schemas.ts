import type { LandingPage, FaqItem } from '@/lib/supabase/types'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://localhost:3000'
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? 'SEO Landing Pages'

// ── Organization ──────────────────────────────────────────────────────────────
export function buildOrganizationSchema(overrides?: Partial<{
  name: string
  url: string
  logo: string
  sameAs: string[]
}>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: overrides?.name ?? SITE_NAME,
    url: overrides?.url ?? SITE_URL,
    logo: overrides?.logo ?? `${SITE_URL}/logo.png`,
    sameAs: overrides?.sameAs ?? [],
  }
}

// ── WebPage ───────────────────────────────────────────────────────────────────
export function buildWebPageSchema(page: LandingPage) {
  const pageUrl = page.canonical_url ?? `${SITE_URL}/${page.slug}`

  return {
    '@context': 'https://schema.org',
    '@type': page.schema_type === 'WebPage' ? 'WebPage' : page.schema_type,
    '@id': pageUrl,
    url: pageUrl,
    name: page.title,
    description: page.meta_description,
    inLanguage: 'es',
    isPartOf: { '@type': 'WebSite', url: SITE_URL, name: SITE_NAME },
    ...(page.published_at ? { datePublished: page.published_at } : {}),
    dateModified: page.updated_at,
    ...(page.author_name
      ? {
          author: {
            '@type': 'Person',
            name: page.author_name,
            jobTitle: page.author_title,
            description: page.author_bio,
            ...(page.author_image_url ? { image: page.author_image_url } : {}),
          },
        }
      : {}),
    breadcrumb: buildBreadcrumbSchema([
      { name: 'Inicio', url: SITE_URL },
      { name: page.h1, url: pageUrl },
    ]),
  }
}

// ── Article ───────────────────────────────────────────────────────────────────
export function buildArticleSchema(page: LandingPage) {
  const pageUrl = page.canonical_url ?? `${SITE_URL}/${page.slug}`

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: page.h1,
    description: page.meta_description,
    url: pageUrl,
    image: page.og_image_url,
    datePublished: page.published_at,
    dateModified: page.updated_at,
    inLanguage: 'es',
    author: {
      '@type': 'Person',
      name: page.author_name ?? SITE_NAME,
      jobTitle: page.author_title,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl },
    ...(page.expert_reviewed_by
      ? {
          reviewedBy: { '@type': 'Person', name: page.expert_reviewed_by },
        }
      : {}),
  }
}

// ── FAQPage ───────────────────────────────────────────────────────────────────
export function buildFAQSchema(faqs: FaqItem[]) {
  if (!faqs.length) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

// ── BreadcrumbList ────────────────────────────────────────────────────────────
export function buildBreadcrumbSchema(crumbs: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  }
}

// ── LocalBusiness ─────────────────────────────────────────────────────────────
export function buildLocalBusinessSchema(config: {
  name: string
  description?: string
  url?: string
  telephone?: string
  address?: {
    streetAddress: string
    addressLocality: string
    addressRegion: string
    postalCode: string
    addressCountry: string
  }
  openingHours?: string[]
  priceRange?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: config.name,
    description: config.description,
    url: config.url ?? SITE_URL,
    telephone: config.telephone,
    address: config.address
      ? {
          '@type': 'PostalAddress',
          ...config.address,
        }
      : undefined,
    openingHoursSpecification: config.openingHours,
    priceRange: config.priceRange,
  }
}

// ── HowTo ─────────────────────────────────────────────────────────────────────
export function buildHowToSchema(config: {
  name: string
  description?: string
  steps: { name: string; text: string }[]
  totalTime?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: config.name,
    description: config.description,
    totalTime: config.totalTime,
    step: config.steps.map((step, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: step.name,
      text: step.text,
    })),
  }
}
