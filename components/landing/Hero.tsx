import Image from 'next/image'
import Link from 'next/link'

interface HeroProps {
  h1: string
  subtitle?: string
  ctaText?: string
  ctaUrl?: string
  imageUrl?: string
  imageAlt?: string
}

// Hero section — H1 must contain the primary keyword exactly.
// Image uses priority=true to ensure LCP optimization.
export function Hero({
  h1,
  subtitle,
  ctaText = 'Comenzar ahora',
  ctaUrl = '#lead-form',
  imageUrl,
  imageAlt,
}: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 px-4 py-20 text-white sm:py-32">
      <div className="relative mx-auto max-w-6xl">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              {h1}
            </h1>
            {subtitle && (
              <p className="mt-6 text-xl leading-relaxed text-blue-100">{subtitle}</p>
            )}
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href={ctaUrl}
                className="inline-flex items-center justify-center rounded-xl bg-white px-8 py-4 text-lg font-bold text-blue-900 shadow-lg transition hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-white/50"
              >
                {ctaText}
              </Link>
              <Link
                href="#benefits"
                className="inline-flex items-center justify-center rounded-xl border-2 border-white/30 px-8 py-4 text-lg font-semibold text-white transition hover:border-white/60"
              >
                Ver cómo funciona
              </Link>
            </div>
          </div>

          {imageUrl && (
            <div className="relative hidden lg:block">
              <Image
                src={imageUrl}
                alt={imageAlt ?? h1}
                width={600}
                height={400}
                className="rounded-2xl shadow-2xl"
                priority
              />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
