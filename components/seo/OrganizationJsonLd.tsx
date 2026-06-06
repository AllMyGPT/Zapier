import { JsonLd } from './JsonLd'
import { buildOrganizationSchema } from '@/lib/seo/schemas'

interface OrganizationJsonLdProps {
  name?: string
  url?: string
  logo?: string
  sameAs?: string[]
}

export function OrganizationJsonLd(props: OrganizationJsonLdProps) {
  return <JsonLd data={buildOrganizationSchema(props) as Record<string, unknown>} />
}
