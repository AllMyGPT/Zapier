# SEO Landing Pages — Next.js + Vercel + Supabase

Boilerplate de producción para landing pages optimizadas para **SEO tradicional** y **GEO** (Generative Engine Optimization), desplegadas en Vercel con Supabase como backend de contenido y captura de leads.

## Stack

| Tecnología | Rol |
|-----------|-----|
| Next.js 15 (App Router) | Framework — SSG + ISR |
| TypeScript | Tipado estático completo |
| Tailwind CSS | Estilos utility-first |
| Vercel | Deploy, Edge Network, Analytics |
| Supabase | CMS de contenido, leads, A/B testing |

## Características SEO/GEO

### SEO Técnico
- ✅ Metadata API de Next.js (`generateMetadata`)
- ✅ Sitemap dinámico desde Supabase (`/sitemap.xml`)
- ✅ `robots.txt` configurable con directivas para bots de IA
- ✅ Canonical URLs automáticos
- ✅ Open Graph + Twitter Cards
- ✅ Imágenes con `next/image` (LCP optimization)
- ✅ Fuentes con `next/font` (CLS = 0)
- ✅ Headers de seguridad y caché en Vercel Edge

### Structured Data (JSON-LD)
- ✅ `Organization`
- ✅ `WebPage` / `Article`
- ✅ `FAQPage` (rich snippets + GEO)
- ✅ `BreadcrumbList`
- ✅ `LocalBusiness`
- ✅ `HowTo`

### GEO (Generative Engine Optimization)
- ✅ **AnswerBlock**: párrafo de respuesta directa ≤40 palabras para AI Overviews
- ✅ **DefinitionBlock**: definición semántica del término principal
- ✅ **StatBlock**: estadísticas citables con atribución de fuente
- ✅ **AuthorCard**: señales E-E-A-T (Expertise, Experience, Authority, Trust)
- ✅ **FaqSection**: preguntas en lenguaje natural + `FAQPage` schema
- ✅ `llms.txt`: instrucciones para crawlers LLM (ChatGPT, Perplexity, etc.)
- ✅ `robots.txt` con reglas explícitas para GPTBot, PerplexityBot, Claude-Web

## Inicio rápido

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env.local
# Editar .env.local con tus credenciales de Supabase
```

### 3. Aplicar el schema de Supabase

En el SQL Editor de tu proyecto Supabase, ejecuta en orden:
1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/seed.sql` (opcional, datos de ejemplo)

### 4. Ejecutar en desarrollo

```bash
npm run dev
```

Visita `http://localhost:3000`

## Estructura del proyecto

```
app/
  layout.tsx          # Root layout (fuentes, analytics, schemas globales)
  page.tsx            # Home page
  [slug]/page.tsx     # Landing pages dinámicas desde Supabase
  sitemap.ts          # Sitemap dinámico
  robots.ts           # robots.txt con directivas LLM
  api/
    leads/route.ts        # Captura de leads
    revalidate/route.ts   # ISR on-demand

components/
  seo/                # JSON-LD components (JsonLd, FaqJsonLd, etc.)
  geo/                # GEO components (DefinitionBlock, AnswerBlock, etc.)
  landing/            # UI components (Hero, Benefits, FaqSection, LeadForm)
  analytics/          # GTM + Vercel Analytics

lib/
  supabase/           # Clientes server/browser + tipos TypeScript
  seo/                # Helpers de metadata, schemas, sitemap
  geo/                # Utilidades GEO (validación, scoring)

supabase/
  migrations/         # SQL schema
  seed.sql            # Datos de ejemplo

public/
  llms.txt            # Instrucciones para crawlers LLM (GEO)
```

## Gestión de contenido

Cada landing page se gestiona desde Supabase. Campos clave:

| Campo | Propósito SEO/GEO |
|-------|-------------------|
| `title` | `<title>` tag (50-60 chars) |
| `meta_description` | Meta description (150-160 chars) |
| `h1` | Heading principal = keyword primaria |
| `answer_paragraph` | Respuesta directa ≤40 palabras para AI Overviews |
| `definition_term` + `definition_text` | Bloque de definición GEO |
| `primary_keyword` | Keyword principal para tracking |
| `target_intent` | Intención de búsqueda |
| `author_name` + bio | Señales E-E-A-T |
| `schema_type` | Tipo de structured data |

## Deploy en Vercel

1. Conectar el repositorio a Vercel
2. Añadir las variables de entorno del `.env.example` en Vercel Dashboard
3. Deploy automático en cada push a `main`

### Webhook ISR (revalidación on-demand)

Para revalidar páginas cuando cambies contenido en Supabase:

```
POST https://tudominio.com/api/revalidate?secret=<REVALIDATION_SECRET>&slug=<slug>
```

Configura un Database Webhook en Supabase apuntando a este endpoint.

## Puntuación GEO

```typescript
import { scoreGEOReadiness } from '@/lib/geo/content-patterns'

const result = scoreGEOReadiness({
  answer_paragraph: page.answer_paragraph,
  definition_term: page.definition_term,
  definition_text: page.definition_text,
  author_name: page.author_name,
  faq_count: faqs.length,
})
// { score: 85, recommendations: [] }
```

## Licencia

MIT
