import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createPublicClient } from '@/lib/supabase/server'
import { buildPageMetadata } from '@/lib/seo/metadata'
import { buildWebPageSchema, buildArticleSchema, buildFAQSchema } from '@/lib/seo/schemas'
import { JsonLd } from '@/components/seo/JsonLd'
import { Hero } from '@/components/landing/Hero'
import { Benefits } from '@/components/landing/Benefits'
import { SocialProof } from '@/components/landing/SocialProof'
import { FaqSection } from '@/components/landing/FaqSection'
import { LeadForm } from '@/components/landing/LeadForm'
import { Breadcrumbs } from '@/components/landing/Breadcrumbs'
import { DefinitionBlock } from '@/components/geo/DefinitionBlock'
import { AnswerBlock } from '@/components/geo/AnswerBlock'
import { AuthorCard } from '@/components/geo/AuthorCard'
import type { LandingPageWithFaqs } from '@/lib/supabase/types'

export const revalidate = 3600

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getPage(slug: string): Promise<LandingPageWithFaqs | null> {
  try {
    const supabase = createPublicClient()
    const { data: page } = await supabase
      .from('landing_pages')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single()

    if (!page) return null

    const { data: faqs } = await supabase
      .from('faq_items')
      .select('*')
      .eq('landing_page_id', page.id)
      .order('position', { ascending: true })

    return { ...page, faq_items: faqs ?? [] }
  } catch {
    return null
  }
}

export async function generateStaticParams() {
  try {
    const supabase = createPublicClient()
    const { data: pages } = await supabase
      .from('landing_pages')
      .select('slug')
      .eq('status', 'published')
    return (pages ?? []).map((p) => ({ slug: p.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const page = await getPage(slug)
  if (!page) return { title: 'Página no encontrada' }
  return buildPageMetadata(page)
}

export default async function LandingPage({ params }: PageProps) {
  const { slug } = await params
  const page = await getPage(slug)

  if (!page) notFound()

  const { content, faq_items } = page

  // Build structured data
  const schemas: Record<string, unknown>[] = [
    buildWebPageSchema(page) as Record<string, unknown>,
  ]
  if (page.schema_type === 'Article') {
    schemas.push(buildArticleSchema(page) as Record<string, unknown>)
  }
  if (faq_items.length > 0) {
    const faqSchema = buildFAQSchema(faq_items)
    if (faqSchema) schemas.push(faqSchema as Record<string, unknown>)
  }

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://localhost:3000'

  return (
    <>
      {schemas.map((schema, i) => (
        <JsonLd key={i} data={schema} />
      ))}

      <Breadcrumbs
        crumbs={[{ name: page.h1, url: `${SITE_URL}/${page.slug}` }]}
        className="border-b border-gray-100"
      />

      <Hero
        h1={page.h1}
        subtitle={page.meta_description ?? undefined}
        ctaText={content.hero_cta_text}
        ctaUrl={content.hero_cta_url}
        imageUrl={page.og_image_url ?? undefined}
        imageAlt={page.h1}
      />

      {/* GEO: Direct answer block for AI Overviews */}
      {page.answer_paragraph && (
        <div className="bg-white px-4 py-10">
          <div className="mx-auto max-w-3xl">
            <AnswerBlock
              question={`¿${page.primary_keyword ? `Qué es ${page.primary_keyword}` : page.h1}?`}
              answer={page.answer_paragraph}
            />
          </div>
        </div>
      )}

      {/* Benefits section */}
      {content.benefits && content.benefits.length > 0 && (
        <Benefits benefits={content.benefits} />
      )}

      {/* GEO: Definition block */}
      {page.definition_term && page.definition_text && (
        <div className="bg-gray-50 px-4 py-10">
          <div className="mx-auto max-w-3xl">
            <DefinitionBlock
              term={page.definition_term}
              definition={page.definition_text}
            />
          </div>
        </div>
      )}

      {/* Social proof: stats + testimonials */}
      {(content.stats?.length || content.testimonials?.length) && (
        <SocialProof
          stats={content.stats}
          testimonials={content.testimonials}
        />
      )}

      {/* FAQ section with JSON-LD */}
      {faq_items.length > 0 && <FaqSection faqs={faq_items} />}

      {/* E-E-A-T: Author card */}
      {page.author_name && (
        <div className="bg-white px-4 py-10">
          <div className="mx-auto max-w-3xl">
            <AuthorCard
              name={page.author_name}
              title={page.author_title}
              bio={page.author_bio}
              imageUrl={page.author_image_url}
              reviewedBy={page.expert_reviewed_by}
            />
          </div>
        </div>
      )}

      {/* Lead capture form */}
      <LeadForm
        landingPageSlug={page.slug}
        title="¿Listo para mejorar tu SEO?"
        subtitle="Cuéntanos tu proyecto y te asesoramos sin compromiso."
        ctaText="Quiero una consulta gratuita"
      />
    </>
  )
}
