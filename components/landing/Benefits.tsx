import type { Benefit } from '@/lib/supabase/types'

const DEFAULT_ICONS: Record<number, string> = {
  0: '⚡',
  1: '🤖',
  2: '🚀',
  3: '📊',
  4: '🎯',
  5: '🔒',
}

interface BenefitsProps {
  title?: string
  subtitle?: string
  benefits: Benefit[]
  className?: string
}

// Semantic benefits section with H2 for keyword hierarchy.
// Each benefit item uses H3 for proper heading structure (never skip levels).
export function Benefits({
  title = 'Por qué elegirnos',
  subtitle,
  benefits,
  className = '',
}: BenefitsProps) {
  return (
    <section id="benefits" className={`bg-white px-4 py-20 ${className}`}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">{title}</h2>
          {subtitle && (
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">{subtitle}</p>
          )}
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit, i) => (
            <article
              key={i}
              className="rounded-2xl border border-gray-100 bg-gray-50 p-8 transition hover:border-blue-200 hover:shadow-md"
            >
              <div className="mb-4 text-4xl" aria-hidden="true">
                {benefit.icon ?? DEFAULT_ICONS[i % 6]}
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">{benefit.title}</h3>
              <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
