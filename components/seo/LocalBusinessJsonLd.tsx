import { JsonLd } from './JsonLd'
import { buildLocalBusinessSchema } from '@/lib/seo/schemas'

interface LocalBusinessJsonLdProps {
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
}

export function LocalBusinessJsonLd(props: LocalBusinessJsonLdProps) {
  return <JsonLd data={buildLocalBusinessSchema(props) as Record<string, unknown>} />
}
