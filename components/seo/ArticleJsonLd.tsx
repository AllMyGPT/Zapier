import { JsonLd } from './JsonLd'
import { buildArticleSchema } from '@/lib/seo/schemas'
import type { LandingPage } from '@/lib/supabase/types'

export function ArticleJsonLd({ page }: { page: LandingPage }) {
  return <JsonLd data={buildArticleSchema(page) as Record<string, unknown>} />
}
