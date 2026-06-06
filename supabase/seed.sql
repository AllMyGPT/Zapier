-- =============================================================
-- Seed: landing page de ejemplo con todos los campos SEO/GEO
-- =============================================================

INSERT INTO landing_pages (
  slug, status,
  title, meta_description, h1,
  og_title, og_description, og_image_url,
  primary_keyword, secondary_keywords, target_intent,
  answer_paragraph, definition_term, definition_text,
  schema_type,
  author_name, author_title, author_bio,
  content, published_at
) VALUES (
  'landing-page-seo',
  'published',
  'Landing Page SEO: Guía Completa para Posicionar en Google (2025)',
  'Aprende a crear landing pages optimizadas para SEO y GEO. Estrategias probadas para posicionar en Google, Bing y motores de IA como ChatGPT y Perplexity.',
  'Landing Page SEO: Cómo Posicionar en Google y Motores de IA en 2025',
  'Landing Page SEO — Guía Definitiva 2025',
  'Todo lo que necesitas saber para crear landing pages que posicionen en Google y en motores de búsqueda con IA.',
  'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200&h=630&fit=crop',
  'landing page seo',
  ARRAY['seo para landing pages', 'optimizar landing page', 'landing page google', 'geo landing page'],
  'informational',
  'Una landing page SEO es una página web diseñada específicamente para posicionar en buscadores mediante palabras clave relevantes, estructura técnica optimizada y contenido de alta autoridad.',
  'landing page SEO',
  'Una landing page SEO es una página de destino optimizada para motores de búsqueda y motores de IA generativos, que combina señales técnicas, contenido de autoridad y estructura semántica para captar tráfico orgánico cualificado.',
  'FAQPage',
  'Dr. Damián García',
  'Experto en SEO y Neuromarketing',
  'Especialista en posicionamiento orgánico y GEO con más de 10 años de experiencia ayudando a empresas a crecer en buscadores.',
  '{
    "hero_cta_text": "Descarga la guía gratis",
    "hero_cta_url": "#lead-form",
    "benefits": [
      {"title": "Posicionamiento rápido", "description": "Estrategias que funcionan en 30-90 días"},
      {"title": "GEO incluido", "description": "Optimizado para ChatGPT, Perplexity y Google AI"},
      {"title": "Sin código", "description": "Implementación con Vercel y Supabase sin fricción"}
    ],
    "stats": [
      {"value": "68%", "label": "del tráfico web proviene de búsqueda orgánica", "source": "BrightEdge, 2024"},
      {"value": "40%", "label": "de las búsquedas terminarán en AI Overviews en 2025", "source": "Gartner, 2024"},
      {"value": "3x", "label": "más conversiones vs tráfico de pago en B2B", "source": "HubSpot, 2024"}
    ],
    "testimonials": [
      {
        "name": "María López",
        "role": "CEO, TechStartup Madrid",
        "text": "Implementamos este boilerplate y en 60 días pasamos de 0 a 3.000 visitas orgánicas mensuales.",
        "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop"
      }
    ]
  }',
  NOW()
);

-- FAQs para la landing page de ejemplo
INSERT INTO faq_items (landing_page_id, question, answer, position)
SELECT
  lp.id,
  q.question,
  q.answer,
  q.position
FROM landing_pages lp,
(VALUES
  (1, '¿Qué es una landing page SEO?', 'Es una página web diseñada para posicionar en Google mediante palabras clave específicas, estructura técnica optimizada y contenido de alta autoridad que responde directamente la intención de búsqueda del usuario.', 0),
  (2, '¿Cuánto tarda en posicionar una landing page en Google?', 'Una landing page bien optimizada puede aparecer en resultados relevantes en 30-90 días. Los factores clave son: autoridad del dominio, calidad del contenido, velocidad de carga y backlinks de calidad.', 1),
  (3, '¿Qué es GEO y por qué es importante para las landing pages?', 'GEO (Generative Engine Optimization) es la práctica de optimizar contenido para que sea citado y mostrado por motores de IA como ChatGPT, Perplexity y Google AI Overviews. Es crucial porque el 40% de las búsquedas usarán IA en 2025.', 2),
  (4, '¿Qué diferencia hay entre SEO y GEO en landing pages?', 'El SEO tradicional optimiza para algoritmos de Google (palabras clave, backlinks, Core Web Vitals). El GEO optimiza para modelos de lenguaje: respuestas directas, definiciones claras, estadísticas verificables y señales E-E-A-T.', 3),
  (5, '¿Por qué usar Vercel y Supabase para landing pages SEO?', 'Vercel ofrece rendimiento de edge computing con tiempos de carga <100ms globalmente, crucial para Core Web Vitals. Supabase permite gestionar contenido dinámico y capturar leads sin backend propio, reduciendo la fricción técnica.', 4)
) AS q(num, question, answer, position)
WHERE lp.slug = 'landing-page-seo';
