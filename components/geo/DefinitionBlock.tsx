interface DefinitionBlockProps {
  term: string
  definition: string
  className?: string
}

// Semantic definition block optimized for AI overviews and featured snippets.
// Uses <dl>/<dt>/<dd> for machine-readable entity definition.
export function DefinitionBlock({ term, definition, className = '' }: DefinitionBlockProps) {
  return (
    <section
      aria-label={`Definición de ${term}`}
      className={`rounded-xl border border-blue-100 bg-blue-50 p-6 ${className}`}
    >
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-blue-600">
        Definición
      </p>
      <dl>
        <dt className="text-lg font-bold text-gray-900">¿Qué es {term}?</dt>
        <dd className="mt-2 text-base leading-relaxed text-gray-700">{definition}</dd>
      </dl>
    </section>
  )
}
