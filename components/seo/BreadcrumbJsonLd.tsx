import { JsonLd } from './JsonLd'
import { buildBreadcrumbSchema } from '@/lib/seo/schemas'

interface BreadcrumbJsonLdProps {
  crumbs: { name: string; url: string }[]
}

export function BreadcrumbJsonLd({ crumbs }: BreadcrumbJsonLdProps) {
  return <JsonLd data={buildBreadcrumbSchema(crumbs) as Record<string, unknown>} />
}
