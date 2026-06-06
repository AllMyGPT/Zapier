import Image from 'next/image'
import type { Testimonial, Stat } from '@/lib/supabase/types'
import { StatBlock } from '@/components/geo/StatBlock'

interface SocialProofProps {
  testimonials?: Testimonial[]
  stats?: Stat[]
  className?: string
}

export function SocialProof({ testimonials, stats, className = '' }: SocialProofProps) {
  return (
    <section className={`bg-gray-50 px-4 py-20 ${className}`}>
      <div className="mx-auto max-w-6xl">
        {stats && stats.length > 0 && (
          <div className="mb-16">
            <h2 className="mb-8 text-center text-3xl font-extrabold text-gray-900">
              Resultados que hablan solos
            </h2>
            <StatBlock stats={stats} />
          </div>
        )}

        {testimonials && testimonials.length > 0 && (
          <div>
            <h2 className="mb-8 text-center text-3xl font-extrabold text-gray-900">
              Lo que dicen nuestros clientes
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t, i) => (
                <blockquote
                  key={i}
                  className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
                  itemScope
                  itemType="https://schema.org/Review"
                >
                  <div className="mb-1 text-yellow-400" aria-label={`${t.rating ?? 5} de 5 estrellas`}>
                    {'★'.repeat(t.rating ?? 5)}
                  </div>
                  <p className="text-gray-700 leading-relaxed" itemProp="reviewBody">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <footer className="mt-4 flex items-center gap-3">
                    {t.avatar && (
                      <Image
                        src={t.avatar}
                        alt={`Foto de ${t.name}`}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <cite className="not-italic font-semibold text-gray-900" itemProp="author">
                        {t.name}
                      </cite>
                      <p className="text-sm text-gray-500">{t.role}</p>
                    </div>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
