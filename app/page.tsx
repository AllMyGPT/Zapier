import type { Metadata } from 'next'
import Link from 'next/link'
import { buildHomeMetadata } from '@/lib/seo/metadata'
import { createPublicClient } from '@/lib/supabase/server'
import { OrganizationJsonLd } from '@/components/seo/OrganizationJsonLd'
import { JsonLd } from '@/components/seo/JsonLd'

export const metadata: Metadata = buildHomeMetadata()
export const revalidate = 3600

async function getPublishedPages() {
  try {
    const supabase = createPublicClient()
    const { data } = await supabase
      .from('landing_pages')
      .select('slug, title, meta_description, primary_keyword, published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
    return data ?? []
  } catch {
    return []
  }
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://localhost:3000'
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? 'SEO Landing Pages'

export default async function HomePage() {
  const pages = await getPublishedPages()

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: SITE_URL,
    name: SITE_NAME,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <>
      <JsonLd data={websiteSchema} />
      <OrganizationJsonLd />

      <section className="bg-gradient-to-br from-blue-900 to-blue-700 px-4 py-20 text-white text-center">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
            {SITE_NAME}
          </h1>
          <p className="mt-6 text-xl text-blue-100">
            Boilerplate de landing pages SEO/GEO construido con Next.js 15, Vercel y Supabase.
            Optimizado para Google, ChatGPT, Perplexity y Google AI Overviews.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/landing-page-seo"
              className="rounded-xl bg-white px-8 py-4 text-lg font-bold text-blue-900 shadow-lg hover:bg-blue-50 transition"
            >
              Ver landing de ejemplo
            </Link>
            <a
              href="https://github.com"
              className="rounded-xl border-2 border-white/30 px-8 py-4 text-lg font-semibold hover:border-white/60 transition"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ver en GitHub
            </a>
          </div>
        </div>
      </section>

      {pages.length > 0 && (
        <section className="bg-white px-4 py-20">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-10 text-3xl font-extrabold text-gray-900">
              Landing Pages publicadas
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {pages.map((page) => (
                <Link
                  key={page.slug}
                  href={`/${page.slug}`}
                  className="block rounded-2xl border border-gray-100 p-6 shadow-sm hover:border-blue-200 hover:shadow-md transition"
                >
                  {page.primary_keyword && (
                    <span className="mb-2 inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                      {page.primary_keyword}
                    </span>
                  )}
                  <h3 className="mt-1 font-bold text-gray-900">{page.title}</h3>
                  {page.meta_description && (
                    <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                      {page.meta_description}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-gray-50 px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-10 text-3xl font-extrabold text-gray-900">
            Stack técnico SEO/GEO
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { emoji: '⚡', title: 'Next.js 15 App Router', desc: 'SSG + ISR para velocidad máxima' },
              { emoji: '🗄️', title: 'Supabase', desc: 'CMS de contenido + captura de leads' },
              { emoji: '🚀', title: 'Vercel Edge', desc: 'Deploy global < 100ms TTFB' },
              { emoji: '🤖', title: 'GEO Ready', desc: 'Optimizado para ChatGPT, Perplexity, AI Overviews' },
              { emoji: '📊', title: 'Core Web Vitals', desc: 'LCP, CLS e INP optimizados por defecto' },
              { emoji: '🔍', title: 'Structured Data', desc: 'JSON-LD: FAQPage, Article, Organization' },
            ].map((item, i) => (
              <div key={i} className="rounded-xl border border-gray-100 bg-white p-5">
                <div className="text-3xl mb-2">{item.emoji}</div>
                <h3 className="font-bold text-gray-900">{item.title}</h3>
                <p className="mt-1 text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
