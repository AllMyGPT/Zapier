'use client'

import { useState } from 'react'
import type { FaqItem } from '@/lib/supabase/types'
import { FaqJsonLd } from '@/components/seo/FaqJsonLd'

interface FaqSectionProps {
  faqs: FaqItem[]
  title?: string
  className?: string
}

// FAQ section with accordion UX + FAQPage JSON-LD for rich snippets and GEO.
// Questions use natural language long-tail format for voice/AI search.
export function FaqSection({
  faqs,
  title = 'Preguntas frecuentes',
  className = '',
}: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  if (!faqs.length) return null

  return (
    <section id="faq" className={`bg-white px-4 py-20 ${className}`}>
      <FaqJsonLd faqs={faqs} />

      <div className="mx-auto max-w-3xl">
        <h2 className="mb-10 text-center text-3xl font-extrabold text-gray-900">{title}</h2>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={faq.id}
              className="rounded-xl border border-gray-200 overflow-hidden"
              itemScope
              itemType="https://schema.org/Question"
            >
              <button
                type="button"
                aria-expanded={openIndex === i}
                aria-controls={`faq-answer-${i}`}
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex w-full items-center justify-between px-6 py-5 text-left font-semibold text-gray-900 hover:bg-gray-50 transition"
              >
                <span itemProp="name">{faq.question}</span>
                <span
                  className="ml-4 shrink-0 text-blue-600 transition-transform duration-200"
                  style={{ transform: openIndex === i ? 'rotate(45deg)' : 'rotate(0deg)' }}
                  aria-hidden="true"
                >
                  +
                </span>
              </button>

              <div
                id={`faq-answer-${i}`}
                role="region"
                hidden={openIndex !== i}
                itemScope
                itemType="https://schema.org/Answer"
              >
                <div className="border-t border-gray-100 px-6 py-5">
                  <p className="text-gray-700 leading-relaxed" itemProp="text">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
