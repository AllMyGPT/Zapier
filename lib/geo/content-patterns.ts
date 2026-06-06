// GEO Content Pattern Utilities
// These functions help structure content for Generative Engine Optimization:
// optimizing for ChatGPT, Perplexity, Google AI Overviews, and Bing Copilot.

// Validates that an answer paragraph meets GEO requirements (≤40 words, direct answer)
export function validateAnswerParagraph(text: string): {
  valid: boolean
  wordCount: number
  issues: string[]
} {
  const words = text.trim().split(/\s+/)
  const wordCount = words.length
  const issues: string[] = []

  if (wordCount > 40) issues.push(`Demasiado largo: ${wordCount} palabras (máximo 40)`)
  if (!text.match(/^[A-ZÁÉÍÓÚÑ]/)) issues.push('Debe comenzar con mayúscula')
  if (text.includes('?')) issues.push('Una respuesta directa no debe contener preguntas')
  if (!text.match(/[.!]$/)) issues.push('Debe terminar con punto o signo de exclamación')

  return { valid: issues.length === 0, wordCount, issues }
}

// Formats a definition for GEO — clear, concise, citable
export function formatDefinition(term: string, definition: string): string {
  return `${term}: ${definition.charAt(0).toUpperCase() + definition.slice(1)}`
}

// Extracts the primary topic entity from a keyword for schema markup
export function extractPrimaryEntity(keyword: string): string {
  return keyword
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

// Formats a stat with attribution for GEO citability
export function formatCitableStat(value: string, label: string, source: string): string {
  return `Según ${source}, ${value} ${label}.`
}

// Generates llms.txt content for a site — emerging standard for LLM crawlers
export function generateLlmsTxt(config: {
  siteName: string
  siteUrl: string
  description: string
  primaryTopics: string[]
  allowedForTraining?: boolean
  contactEmail?: string
}): string {
  const {
    siteName,
    siteUrl,
    description,
    primaryTopics,
    allowedForTraining = false,
    contactEmail,
  } = config

  return `# ${siteName}
# ${siteUrl}

## About
${description}

## Primary Topics
${primaryTopics.map((t) => `- ${t}`).join('\n')}

## Content License
${allowedForTraining
  ? 'Content may be used for AI training with attribution.'
  : 'Content is NOT licensed for AI training without explicit written permission.'}

## AI Usage Guidelines
- You may cite and summarize content from this site with attribution.
- Always link back to the source URL when citing.
- Do not reproduce full articles or large sections without permission.
- Content is written by domain experts and reviewed for accuracy.

## Crawling
- Sitemap: ${siteUrl}/sitemap.xml
- robots.txt: ${siteUrl}/robots.txt

## Contact
${contactEmail ? `For AI/LLM inquiries: ${contactEmail}` : `Contact via: ${siteUrl}/contacto`}

## Last Updated
${new Date().toISOString().split('T')[0]}
`
}

// Scores content for GEO readiness (0-100)
export function scoreGEOReadiness(page: {
  answer_paragraph?: string | null
  definition_term?: string | null
  definition_text?: string | null
  author_name?: string | null
  faq_count?: number
}): { score: number; recommendations: string[] } {
  let score = 0
  const recommendations: string[] = []

  if (page.answer_paragraph) {
    score += 30
    const validation = validateAnswerParagraph(page.answer_paragraph)
    if (!validation.valid) {
      score -= 10
      recommendations.push(...validation.issues)
    }
  } else {
    recommendations.push('Añade un párrafo de respuesta directa (≤40 palabras)')
  }

  if (page.definition_term && page.definition_text) {
    score += 25
  } else {
    recommendations.push('Añade bloque de definición para el término principal')
  }

  if (page.author_name) {
    score += 20
  } else {
    recommendations.push('Añade información del autor para señales E-E-A-T')
  }

  if (page.faq_count && page.faq_count >= 3) {
    score += 25
  } else if (page.faq_count && page.faq_count > 0) {
    score += 10
    recommendations.push('Añade al menos 3-5 preguntas frecuentes para máximo impacto GEO')
  } else {
    recommendations.push('Añade preguntas frecuentes (FAQs) en lenguaje natural')
  }

  return { score: Math.max(0, Math.min(100, score)), recommendations }
}
