'use client'

import { useState, useRef } from 'react'

interface LeadFormProps {
  landingPageSlug: string
  title?: string
  subtitle?: string
  ctaText?: string
  className?: string
}

// Lead capture form. Submits to /api/leads with UTM params from URL.
// Tracks conversions via window.dataLayer for GA4/GTM integration.
export function LeadForm({
  landingPageSlug,
  title = '¿Listo para empezar?',
  subtitle = 'Déjanos tus datos y te contactamos en menos de 24 horas.',
  ctaText = 'Quiero más información',
  className = '',
}: LeadFormProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('loading')
    setErrorMessage('')

    const form = e.currentTarget
    const formData = new FormData(form)

    const params = new URLSearchParams(window.location.search)
    const body = {
      landing_page_slug: landingPageSlug,
      email: formData.get('email') as string,
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      utm_source: params.get('utm_source'),
      utm_medium: params.get('utm_medium'),
      utm_campaign: params.get('utm_campaign'),
      utm_term: params.get('utm_term'),
      utm_content: params.get('utm_content'),
      referrer: document.referrer,
    }

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Error al enviar el formulario')
      }

      // GA4/GTM conversion event
      if (typeof window !== 'undefined' && 'dataLayer' in window) {
        ;(window as { dataLayer: unknown[] }).dataLayer.push({
          event: 'lead_submit',
          page_slug: landingPageSlug,
          email: body.email,
        })
      }

      setStatus('success')
      formRef.current?.reset()
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Error desconocido')
    }
  }

  return (
    <section
      id="lead-form"
      className={`bg-gradient-to-br from-blue-900 to-blue-700 px-4 py-20 text-white ${className}`}
    >
      <div className="mx-auto max-w-xl">
        <h2 className="text-center text-3xl font-extrabold">{title}</h2>
        <p className="mt-3 text-center text-blue-100">{subtitle}</p>

        {status === 'success' ? (
          <div className="mt-8 rounded-xl bg-green-500 p-6 text-center">
            <p className="text-xl font-bold">¡Gracias! Hemos recibido tu solicitud.</p>
            <p className="mt-1 text-green-100">Te contactaremos en menos de 24 horas.</p>
          </div>
        ) : (
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="mt-8 space-y-4"
            noValidate
          >
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-blue-100">
                Nombre completo
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="mt-1 w-full rounded-xl border-0 bg-white/10 px-4 py-3 text-white placeholder-blue-200 backdrop-blur focus:outline-none focus:ring-2 focus:ring-white/50"
                placeholder="Tu nombre"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-blue-100">
                Correo electrónico <span aria-hidden="true">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 w-full rounded-xl border-0 bg-white/10 px-4 py-3 text-white placeholder-blue-200 backdrop-blur focus:outline-none focus:ring-2 focus:ring-white/50"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-blue-100">
                Teléfono (opcional)
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                className="mt-1 w-full rounded-xl border-0 bg-white/10 px-4 py-3 text-white placeholder-blue-200 backdrop-blur focus:outline-none focus:ring-2 focus:ring-white/50"
                placeholder="+34 600 000 000"
              />
            </div>

            {status === 'error' && (
              <p role="alert" className="text-sm text-red-300">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full rounded-xl bg-white py-4 text-lg font-bold text-blue-900 shadow-lg transition hover:bg-blue-50 disabled:opacity-60 focus:outline-none focus:ring-4 focus:ring-white/50"
            >
              {status === 'loading' ? 'Enviando...' : ctaText}
            </button>

            <p className="text-center text-xs text-blue-200">
              Sin spam. Puedes darte de baja en cualquier momento.
            </p>
          </form>
        )}
      </div>
    </section>
  )
}
