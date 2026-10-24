'use client'

import { useState, useEffect, useCallback } from 'react'
import { Play, Square, Plus, Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Project = { id: string; name: string; client_name: string | null }

type ActiveTimer = {
  id: string
  project_id: string
  project_name: string | null
  started_at: string
  elapsed_seconds: number
  description: string | null
}

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`
  return `${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`
}

export default function TimerWidget({ projects }: { projects: Project[] }) {
  const router = useRouter()
  const [timer, setTimer] = useState<ActiveTimer | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Manual entry form state
  const [showManual, setShowManual] = useState(false)
  const [manualForm, setManualForm] = useState({
    project_id: projects[0]?.id ?? '',
    logged_date: new Date().toISOString().slice(0, 10),
    hours: '',
    description: '',
    billable: false,
  })
  const [manualLoading, setManualLoading] = useState(false)
  const [manualResult, setManualResult] = useState<string | null>(null)

  // Timer project picker
  const [showStartPicker, setShowStartPicker] = useState(false)
  const [startProjectId, setStartProjectId] = useState(projects[0]?.id ?? '')
  const [startDescription, setStartDescription] = useState('')

  const fetchTimer = useCallback(async () => {
    try {
      const res = await fetch('/api/time-entries/timer')
      const data = await res.json()
      if (data.timer) {
        setTimer(data.timer)
        setElapsed(data.timer.elapsed_seconds)
      } else {
        setTimer(null)
        setElapsed(0)
      }
    } catch {
      // ignore network errors
    } finally {
      setLoading(false)
    }
  }, [])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchTimer() }, [fetchTimer])

  // Tick the elapsed counter every second
  useEffect(() => {
    if (!timer) return
    const interval = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => clearInterval(interval)
  }, [timer])

  async function startTimer() {
    if (!startProjectId) return
    setActionLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/time-entries/timer/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: startProjectId, description: startDescription.trim() || null }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error')
      setShowStartPicker(false)
      setStartDescription('')
      await fetchTimer()
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al iniciar')
    } finally {
      setActionLoading(false)
    }
  }

  async function stopTimer() {
    setActionLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/time-entries/timer/stop', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error')
      setTimer(null)
      setElapsed(0)
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al parar')
    } finally {
      setActionLoading(false)
    }
  }

  async function saveManual(e: React.FormEvent) {
    e.preventDefault()
    if (!manualForm.hours || parseFloat(manualForm.hours) <= 0) {
      setManualResult('✗ Las horas deben ser mayores que 0')
      return
    }
    setManualLoading(true)
    setManualResult(null)
    try {
      const res = await fetch('/api/time-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: manualForm.project_id,
          logged_date: manualForm.logged_date,
          hours: parseFloat(manualForm.hours),
          billable: manualForm.billable,
          description: manualForm.description.trim() || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error')
      setManualResult('✓ Entrada registrada')
      setManualForm(f => ({ ...f, hours: '', description: '' }))
      router.refresh()
      setTimeout(() => { setManualResult(null); setShowManual(false) }, 1500)
    } catch (err: unknown) {
      setManualResult(`✗ ${err instanceof Error ? err.message : 'Error'}`)
    } finally {
      setManualLoading(false)
    }
  }

  if (loading) return null

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-3">
      {/* Active timer display */}
      {timer ? (
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 font-mono">{formatElapsed(elapsed)}</p>
              <p className="text-xs text-slate-500 truncate">{timer.project_name ?? 'Sin proyecto'}</p>
            </div>
          </div>
          <button
            onClick={stopTimer}
            disabled={actionLoading}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-red-500 rounded-xl hover:bg-red-600 disabled:opacity-50 transition-colors flex-shrink-0"
          >
            <Square className="w-4 h-4" />
            <span className="hidden sm:inline">Parar</span>
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-500 flex-1">Sin temporizador activo</span>
          <button
            onClick={() => setShowManual(s => !s)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Manual</span>
          </button>
          <button
            onClick={() => setShowStartPicker(s => !s)}
            disabled={projects.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-violet-600 rounded-xl hover:bg-violet-700 disabled:opacity-50 transition-colors"
          >
            <Play className="w-4 h-4" />
            <span className="hidden sm:inline">Iniciar</span>
          </button>
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}

      {/* Timer start picker */}
      {showStartPicker && !timer && (
        <div className="border-t border-slate-100 pt-3 space-y-2">
          <select
            value={startProjectId}
            onChange={e => setStartProjectId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>
                {p.name}{p.client_name ? ` · ${p.client_name}` : ''}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={startDescription}
            onChange={e => setStartDescription(e.target.value)}
            placeholder="Descripción (opcional)"
            maxLength={200}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setShowStartPicker(false)}
              className="flex-1 py-2 text-sm text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={startTimer}
              disabled={actionLoading || !startProjectId}
              className="flex-1 py-2 text-sm text-white bg-violet-600 rounded-xl hover:bg-violet-700 disabled:opacity-50 transition-colors"
            >
              {actionLoading ? 'Iniciando...' : 'Iniciar'}
            </button>
          </div>
        </div>
      )}

      {/* Manual entry form */}
      {showManual && !timer && (
        <form onSubmit={saveManual} className="border-t border-slate-100 pt-3 space-y-2">
          <select
            value={manualForm.project_id}
            onChange={e => setManualForm(f => ({ ...f, project_id: e.target.value }))}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>
                {p.name}{p.client_name ? ` · ${p.client_name}` : ''}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={manualForm.logged_date}
              onChange={e => setManualForm(f => ({ ...f, logged_date: e.target.value }))}
              className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <input
              type="number"
              min="0.01"
              max="24"
              step="0.25"
              value={manualForm.hours}
              onChange={e => setManualForm(f => ({ ...f, hours: e.target.value }))}
              placeholder="Horas (ej: 1.5)"
              required
              className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <input
            type="text"
            value={manualForm.description}
            onChange={e => setManualForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Descripción (opcional)"
            maxLength={1000}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={manualForm.billable}
              onChange={e => setManualForm(f => ({ ...f, billable: e.target.checked }))}
              className="w-4 h-4 rounded text-violet-600"
            />
            Facturable
          </label>
          {manualResult && (
            <p className={`text-xs ${manualResult.startsWith('✓') ? 'text-green-600' : 'text-red-600'}`}>
              {manualResult}
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowManual(false)}
              className="flex-1 py-2 text-sm text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={manualLoading}
              className="flex-1 py-2 text-sm text-white bg-violet-600 rounded-xl hover:bg-violet-700 disabled:opacity-50 transition-colors"
            >
              {manualLoading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
