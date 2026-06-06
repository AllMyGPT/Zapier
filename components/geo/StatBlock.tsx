import type { Stat } from '@/lib/supabase/types'

interface StatBlockProps {
  stats: Stat[]
  className?: string
}

// Citable statistics block for GEO — AI models prefer verifiable, attributed data.
// Each stat includes source attribution for citability signals.
export function StatBlock({ stats, className = '' }: StatBlockProps) {
  return (
    <div className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {stats.map((stat, i) => (
        <figure
          key={i}
          className="rounded-xl border border-gray-100 bg-white p-6 text-center shadow-sm"
        >
          <p className="text-4xl font-extrabold text-blue-600">{stat.value}</p>
          <figcaption className="mt-2 text-sm text-gray-600">{stat.label}</figcaption>
          {stat.source && (
            <cite className="mt-1 block text-xs text-gray-400 not-italic">
              Fuente: {stat.source}
            </cite>
          )}
        </figure>
      ))}
    </div>
  )
}
