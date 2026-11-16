interface AnswerBlockProps {
  question: string
  answer: string
  className?: string
}

// Direct answer block (≤40 words) optimized for AI Overviews and position-zero snippets.
// Marked up with speakable schema signal via data-speakable attribute.
export function AnswerBlock({ question, answer, className = '' }: AnswerBlockProps) {
  return (
    <div
      data-speakable="true"
      aria-label="Respuesta directa"
      className={`my-6 rounded-lg border-l-4 border-blue-600 bg-white p-5 shadow-sm ${className}`}
    >
      <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-blue-600">
        Respuesta rápida
      </p>
      <p className="mb-1 font-semibold text-gray-800">{question}</p>
      <p className="text-gray-700 leading-relaxed">{answer}</p>
    </div>
  )
}
