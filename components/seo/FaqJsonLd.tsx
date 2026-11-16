import { JsonLd } from './JsonLd'
import { buildFAQSchema } from '@/lib/seo/schemas'
import type { FaqItem } from '@/lib/supabase/types'

interface FaqJsonLdProps {
  faqs: FaqItem[]
}

export function FaqJsonLd({ faqs }: FaqJsonLdProps) {
  const schema = buildFAQSchema(faqs)
  if (!schema) return null
  return <JsonLd data={schema as Record<string, unknown>} />
}
