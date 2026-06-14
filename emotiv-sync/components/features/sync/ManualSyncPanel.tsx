'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, FolderKanban, Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'

type OpResult = { ok: boolean; message: string } | null

export default function ManualSyncPanel() {
  const [loadingOp, setLoadingOp] = useState<'projects' | 'time_entries' | null>(null)
  const [projectsResult, setProjectsResult] = useState<OpResult>(null)
  const [entriesResult, setEntriesResult] = useState<OpResult>(null)
  const router = useRouter()

  // Auto-clear results after 5 seconds
  useEffect(() => {
    if (!projectsResult) return
    const t = setTimeout(() => setProjectsResult(null), 5000)
    return () => clearTimeout(t)
  }, [projectsResult])

  useEffect(() => {
    if (!entriesResult) return
    const t = setTimeout(() => setEntriesResult(null), 5000)
    return () => clearTimeout(t)
  }, [entriesResult])

  async function runSync(type: 'projects' | 'time-entries') {
    const op = type === 'projects' ? 'projects' : 'time_entries'
    setLoadingOp(op as 'projects' | 'time_entries')
    if (op === 'projects') setProjectsResult(null)
    else setEntriesResult(null)

    try {
      const res = await fetch(`/api/sync/${type}`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error desconocido')
      const count = data.synced ?? data.records_processed ?? 0
      const msg = type === 'projects'
        ? `${count} proyectos sincronizados`
        : `${count} horas sincronizadas`
      if (op === 'projects') setProjectsResult({ ok: true, message: msg })
      else setEntriesResult({ ok: true, message: msg })
      router.refresh()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error'
      if (op === 'projects') setProjectsResult({ ok: false, message: msg })
      else setEntriesResult({ ok: false, message: msg })
    } finally {
      setLoadingOp(null)
    }
  }

  const anySyncing = loadingOp !== null

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
      <h2 className="font-semibold text-slate-800 text-sm mb-4">Sincronización manual</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Projects */}
        <div className="border border-slate-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <FolderKanban className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-slate-700">Proyectos</span>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Importa de Everhour y sincroniza con Zoho Books
          </p>
          {loadingOp === 'projects' && (
            <p className="text-xs text-blue-600 mb-2 flex items-center gap-1">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Sincronizando proyectos…
            </p>
          )}
          {projectsResult && (
            <p className={`text-xs mb-2 ${projectsResult.ok ? 'text-green-600' : 'text-red-600'}`}>
              {projectsResult.ok ? `✅ ${projectsResult.message}` : `❌ Error: ${projectsResult.message}`}
            </p>
          )}
          <button
            onClick={() => runSync('projects')}
            disabled={anySyncing}
            className="w-full flex items-center justify-center gap-2 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loadingOp === 'projects' ? 'animate-spin' : ''}`} />
            {loadingOp === 'projects' ? 'Sincronizando...' : 'Sincronizar proyectos'}
          </button>
        </div>

        {/* Time entries */}
        <div className="border border-slate-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-violet-500" />
            <span className="text-sm font-medium text-slate-700">Horas</span>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Sincroniza entradas de tiempo con Zoho Books
          </p>
          {loadingOp === 'time_entries' && (
            <p className="text-xs text-violet-600 mb-2 flex items-center gap-1">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Sincronizando horas…
            </p>
          )}
          {entriesResult && (
            <p className={`text-xs mb-2 ${entriesResult.ok ? 'text-green-600' : 'text-red-600'}`}>
              {entriesResult.ok ? `✅ ${entriesResult.message}` : `❌ Error: ${entriesResult.message}`}
            </p>
          )}
          <button
            onClick={() => runSync('time-entries')}
            disabled={anySyncing}
            className="w-full flex items-center justify-center gap-2 py-2 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-300 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loadingOp === 'time_entries' ? 'animate-spin' : ''}`} />
            {loadingOp === 'time_entries' ? 'Sincronizando...' : 'Sincronizar horas'}
          </button>
        </div>
      </div>
    </div>
  )
}
