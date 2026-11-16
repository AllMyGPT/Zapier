-- =============================================================
-- SEO Landing Pages — Initial Schema
-- =============================================================

-- Landing pages (CMS-like content management)
CREATE TABLE IF NOT EXISTS landing_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),

  -- SEO Core (SERP signals)
  title TEXT NOT NULL,               -- <title> tag: 50-60 chars
  meta_description TEXT,             -- <meta description>: 150-160 chars
  canonical_url TEXT,                -- Canonical override (cross-domain or pagination)
  h1 TEXT NOT NULL,                  -- Primary visible heading = primary keyword

  -- Open Graph / Social Sharing
  og_title TEXT,
  og_description TEXT,
  og_image_url TEXT,
  twitter_card TEXT DEFAULT 'summary_large_image',

  -- GEO (Generative Engine Optimization)
  primary_keyword TEXT,
  secondary_keywords TEXT[],
  target_intent TEXT CHECK (target_intent IN ('informational','navigational','transactional','commercial')),
  answer_paragraph TEXT,             -- Direct answer ≤40 words for AI overviews
  definition_term TEXT,              -- Term being defined: "landing page SEO"
  definition_text TEXT,              -- Concise definition ≤60 words

  -- Structured Data
  schema_type TEXT DEFAULT 'WebPage' CHECK (schema_type IN ('WebPage','Article','FAQPage','Product','LocalBusiness','Service')),

  -- E-E-A-T signals
  author_name TEXT,
  author_title TEXT,
  author_bio TEXT,
  author_image_url TEXT,
  expert_reviewed_by TEXT,

  -- Flexible content (sections, blocks, etc.)
  content JSONB DEFAULT '{}',

  -- Timestamps
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- FAQ items (per landing page, drives FAQPage schema)
CREATE TABLE IF NOT EXISTS faq_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landing_page_id UUID NOT NULL REFERENCES landing_pages(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,             -- ≤50 words for featured snippet optimization
  position INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lead capture (form submissions from landing pages)
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landing_page_slug TEXT REFERENCES landing_pages(slug) ON DELETE SET NULL,

  -- Contact data
  email TEXT NOT NULL,
  name TEXT,
  phone TEXT,

  -- UTM attribution
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,

  -- Technical metadata
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- A/B testing configuration
CREATE TABLE IF NOT EXISTS ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landing_page_id UUID NOT NULL REFERENCES landing_pages(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  variant TEXT NOT NULL CHECK (variant IN ('A', 'B', 'C')),
  config JSONB DEFAULT '{}',       -- Overrides: headline, cta_text, image_url, etc.
  impressions INT DEFAULT 0,
  conversions INT DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(landing_page_id, variant)
);

-- =============================================================
-- TRIGGERS — auto-update updated_at
-- =============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER landing_pages_updated_at
  BEFORE UPDATE ON landing_pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================
-- INDEXES — query performance
-- =============================================================
CREATE INDEX IF NOT EXISTS idx_landing_pages_slug   ON landing_pages(slug);
CREATE INDEX IF NOT EXISTS idx_landing_pages_status ON landing_pages(status);
CREATE INDEX IF NOT EXISTS idx_landing_pages_pub    ON landing_pages(published_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_faq_landing_page     ON faq_items(landing_page_id, position);
CREATE INDEX IF NOT EXISTS idx_leads_slug           ON leads(landing_page_slug);
CREATE INDEX IF NOT EXISTS idx_leads_email          ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_created_at     ON leads(created_at DESC);

-- =============================================================
-- ROW LEVEL SECURITY
-- =============================================================
ALTER TABLE landing_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads         ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_tests      ENABLE ROW LEVEL SECURITY;

-- Public: read published landing pages
CREATE POLICY "Public read published pages"
  ON landing_pages FOR SELECT
  USING (status = 'published');

-- Public: read FAQs of published pages
CREATE POLICY "Public read faqs of published pages"
  ON faq_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM landing_pages lp
      WHERE lp.id = faq_items.landing_page_id
        AND lp.status = 'published'
    )
  );

-- Public: insert leads (anonymous form submissions)
CREATE POLICY "Public insert leads"
  ON leads FOR INSERT
  WITH CHECK (true);

-- Service role: full access (used server-side via SUPABASE_SERVICE_ROLE_KEY)
CREATE POLICY "Service role full access on landing_pages"
  ON landing_pages FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on faq_items"
  ON faq_items FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on leads"
  ON leads FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on ab_tests"
  ON ab_tests FOR ALL
  USING (auth.role() = 'service_role');
