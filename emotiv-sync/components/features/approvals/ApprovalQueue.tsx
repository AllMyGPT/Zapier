'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, CheckCheck, Inbox } from 'lucide-react'
import { formatDate, formatHours } from '@/lib/utils'
import type { TimeEntry } from '@/types'

export default function ApprovalQueue({ entries }: { entries: TimeEntry[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Group by user for a cleaner review experience
  const groups = useMemo(() => {
    const map = new Map<string, { name: string; entries: TimeEntry[] }>()
    for (const e of entries) {
      const key = e.user_id
      const name = e.user?.full_name || e.user?.email || 'Usuario desconocido'
      if (!map.has(key)) map.set(key, { name, entries: [] })
      map.get(key)!.entries.push(e)
    }
    return Array.from(map.values())
  }, [entries])

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleGroup(groupEntries: TimeEntry[]) {
    const ids = groupEntries.map((e) => e.id)
    const allSelected = ids.every((id) => selected.has(id))
    setSelected((prev) => {
      const next = new Set(prev)
      ids.forEach((id) => (allSelected ? next.delete(id) : next.add(id)))
      return next
    })
  }

  function selectAll() {
    if (selected.size === entries.length) setSelected(new Set())
    else setSelected(new Set(entries.map((e) => e.id)))
  }

  async function act(action: 'approve' | 'reject', ids?: string[]) {
    const target = ids ?? Array.from(selected)
    if (target.length === 0) return
    let reason: string | undefined
    if (action === 'reject') {
      reason = window.prompt('Motivo del rechazo (opcional):') ?? undefined
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/time-entries/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: target, action, reason }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error')
      setSelected(new Set())
      router.refresh()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error')
    } finally {
      setLoading(false)
    }
  }

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-10 text-center">
        <Inbox className="w-10 h-10 text-slate-200 mx-auto mb-3" />
        <p className="text-slate-500 text-sm">No hay horas pendientes de aprobación.</p>
        <p className="text-slate-400 text-xs mt-1">
          Todo revisado. Las horas aprobadas ya pueden sincronizarse.
        </p>
      </div>
    )
  }

  const totalHours = entries.reduce((s, e) => s + e.hours, 0)

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-3 flex items-center justify-between gap-2 sticky top-0 z-10">
        <button
          onClick={selectAll}
          className="text-xs font-medium text-violet-600 flex items-center gap-1"
        >
          <CheckCheck className="w-4 h-4" />
          {selected.size === entries.length ? 'Quitar todo' : 'Todo'}
        </button>
        <span className="text-xs text-slate-400">
          {selected.size} sel. · {formatHours(totalHours)} total
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => act('reject')}
            disabled={loading || selected.size === 0}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg disabled:opacity-40"
          >
            <X className="w-3.5 h-3.5" /> Rechazar
          </button>
          <button
            onClick={() => act('approve')}
            disabled={loading || selected.size === 0}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg disabled:opacity-40"
          >
            <Check className="w-3.5 h-3.5" /> Aprobar
          </button>
        </div>
      </div>

      {error && (
        <div className="text-sm bg-red-50 text-red-700 p-3 rounded-xl">{error}</div>
      )}

      {/* Groups */}
      {groups.map((group) => {
        const groupHours = group.entries.reduce((s, e) => s + e.hours, 0)
        const allSelected = group.entries.every((e) => selected.has(e.id))
        return (
          <div
            key={group.name}
            className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
          >
            <div className="p-3 border-b border-slate-50 flex items-center justify-between">
              <button
                onClick={() => toggleGroup(group.entries)}
                className="flex items-center gap-2"
              >
                <span
                  className={`w-4 h-4 rounded border flex items-center justify-center ${
                    allSelected ? 'bg-violet-600 border-violet-600' : 'border-slate-300'
                  }`}
                >
                  {allSelected && <Check className="w-3 h-3 text-white" />}
                </span>
                <span className="text-sm font-semibold text-slate-800">{group.name}</span>
              </button>
              <span className="text-xs text-slate-400">{formatHours(groupHours)}</span>
            </div>
            <div className="divide-y divide-slate-50">
              {group.entries.map((entry) => {
                const checked = selected.has(entry.id)
                return (
                  <label
                    key={entry.id}
                    className="p-3 flex items-start gap-3 cursor-pointer hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(entry.id)}
                      className="mt-1 accent-violet-600"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-slate-800 truncate">
                          {entry.project?.name ?? 'Sin proyecto'}
                        </p>
                        <span className="text-sm font-bold text-slate-900 flex-shrink-0">
                          {formatHours(entry.hours)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-400">
                          {formatDate(entry.logged_date)}
                        </span>
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded-full ${
                            entry.billable
                              ? 'bg-violet-50 text-violet-600'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {entry.billable ? 'Facturable' : 'No facturable'}
                        </span>
                      </div>
                      {entry.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {entry.description}
                        </p>
                      )}
                    </div>
                  </label>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
