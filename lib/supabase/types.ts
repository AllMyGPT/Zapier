export type LandingPageStatus = 'draft' | 'published'
export type TargetIntent = 'informational' | 'navigational' | 'transactional' | 'commercial'
export type SchemaType = 'WebPage' | 'Article' | 'FAQPage' | 'Product' | 'LocalBusiness' | 'Service'
export type TwitterCard = 'summary' | 'summary_large_image'
export type ABVariant = 'A' | 'B' | 'C'

export interface LandingPage {
  id: string
  slug: string
  status: LandingPageStatus

  // SEO Core
  title: string
  meta_description: string | null
  canonical_url: string | null
  h1: string

  // Open Graph
  og_title: string | null
  og_description: string | null
  og_image_url: string | null
  twitter_card: TwitterCard

  // GEO
  primary_keyword: string | null
  secondary_keywords: string[] | null
  target_intent: TargetIntent | null
  answer_paragraph: string | null
  definition_term: string | null
  definition_text: string | null

  // Structured Data
  schema_type: SchemaType

  // E-E-A-T
  author_name: string | null
  author_title: string | null
  author_bio: string | null
  author_image_url: string | null
  expert_reviewed_by: string | null

  // Content
  content: LandingPageContent

  // Timestamps
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface LandingPageContent {
  hero_cta_text?: string
  hero_cta_url?: string
  benefits?: Benefit[]
  stats?: Stat[]
  testimonials?: Testimonial[]
  [key: string]: unknown
}

export interface Benefit {
  title: string
  description: string
  icon?: string
}

export interface Stat {
  value: string
  label: string
  source?: string
}

export interface Testimonial {
  name: string
  role: string
  text: string
  avatar?: string
  rating?: number
}

export interface FaqItem {
  id: string
  landing_page_id: string
  question: string
  answer: string
  position: number
  created_at: string
}

export interface Lead {
  id?: string
  landing_page_slug: string | null
  email: string
  name?: string
  phone?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
  ip_address?: string
  user_agent?: string
  referrer?: string
  metadata?: Record<string, unknown>
}

export interface ABTest {
  id: string
  landing_page_id: string
  name: string
  variant: ABVariant
  config: Record<string, unknown>
  impressions: number
  conversions: number
  active: boolean
  created_at: string
}

export interface LandingPageWithFaqs extends LandingPage {
  faq_items: FaqItem[]
}
