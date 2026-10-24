'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Send } from 'lucide-react'
import { formatDate, formatHours } from '@/lib/utils'
import type { TimeEntry } from '@/types'

export default function JustifyPanel({ entries }: { entries: TimeEntry[] }) {
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const router = useRouter()

  if (entries.length === 0) return null

  async function submit(id: string) {
    const justification = (drafts[id] ?? '').trim()
    if (!justification) {
      setErrors((e) => ({ ...e, [id]: 'Escribe una justificación antes de enviar.' }))
      return
    }
    setLoadingId(id)
    setErrors((e) => { const next = { ...e }; delete next[id]; return next })
    try {
      const res = await fetch('/api/time-entries/justify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, justification }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error')
      router.refresh()
    } catch (e: unknown) {
      setErrors((prev) => ({
        ...prev,
        [id]: e instanceof Error ? e.message : 'Error',
      }))
    } finally {
      setLoadingId(null)
    }
  }

  const totalHours = entries.reduce((s, e) => s + e.hours, 0)

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl overflow-hidden">
      <div className="p-4 flex items-start gap-3 border-b border-amber-200">
        <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-amber-900">
            Presupuesto superado — {entries.length}{' '}
            {entries.length === 1 ? 'registro requiere' : 'registros requieren'} justificación
          </p>
          <p className="text-xs text-amber-700 mt-0.5">
            Estas {formatHours(totalHours)} están en proyectos que han superado su
            presupuesto. Justifícalas para solicitar la aprobación del administrador.
          </p>
        </div>
      </div>

      <div className="divide-y divide-amber-100">
        {entries.map((entry) => {
          const text = drafts[entry.id] ?? ''
          const charCount = text.length
          const isOverLimit = charCount > 1900
          return (
            <div key={entry.id} className="p-4">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {entry.project?.name ?? 'Sin proyecto'}
                  </p>
                  <p className="text-xs text-slate-500">{formatDate(entry.logged_date)}</p>
                </div>
                <span className="text-sm font-bold text-slate-900 flex-shrink-0">
                  {formatHours(entry.hours)}
                </span>
              </div>
              <textarea
                value={text}
                onChange={(e) => setDrafts((d) => ({ ...d, [entry.id]: e.target.value }))}
                placeholder="Explica por qué estas horas exceden el presupuesto…"
                rows={2}
                maxLength={2000}
                className="w-full px-3 py-2 text-sm border border-amber-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
              />
              <div className="flex items-center justify-between mt-1 mb-2">
                {errors[entry.id] ? (
                  <p className="text-xs text-red-600">{errors[entry.id]}</p>
                ) : (
                  <span />
                )}
                <span className={`text-xs ml-auto ${isOverLimit ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
                  {charCount}/2000
                </span>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => submit(entry.id)}
                  disabled={loadingId === entry.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {loadingId === entry.id ? 'Enviando…' : 'Solicitar aprobación'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
