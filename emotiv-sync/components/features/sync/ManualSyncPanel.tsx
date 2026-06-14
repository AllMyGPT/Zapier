'use client'

import { useState } from 'react'
import { RefreshCw, FolderKanban, Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ManualSyncPanel() {
  const [syncingProjects, setSyncingProjects] = useState(false)
  const [syncingEntries, setSyncingEntries] = useState(false)
  const [results, setResults] = useState<Record<string, string>>({})
  const router = useRouter()

  async function runSync(type: 'projects' | 'time-entries') {
    const setLoading = type === 'projects' ? setSyncingProjects : setSyncingEntries
    setLoading(true)
    setResults(r => ({ ...r, [type]: '' }))

    try {
      const res = await fetch(`/api/sync/${type}`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error desconocido')
      setResults(r => ({
        ...r,
        [type]: `✓ ${data.synced ?? data.records_processed ?? 0} registros sincronizados`,
      }))
      router.refresh()
    } catch (e: unknown) {
      setResults(r => ({
        ...r,
        [type]: `✗ ${e instanceof Error ? e.message : 'Error'}`,
      }))
    } finally {
      setLoading(false)
    }
  }

  const syncing = syncingProjects || syncingEntries

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
          {results['projects'] && (
            <p className={`text-xs mb-2 ${results['projects'].startsWith('✓') ? 'text-green-600' : 'text-red-600'}`}>
              {results['projects']}
            </p>
          )}
          <button
            onClick={() => runSync('projects')}
            disabled={syncing}
            className="w-full flex items-center justify-center gap-2 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${syncingProjects ? 'animate-spin' : ''}`} />
            {syncingProjects ? 'Sincronizando...' : 'Sincronizar proyectos'}
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
          {results['time-entries'] && (
            <p className={`text-xs mb-2 ${results['time-entries'].startsWith('✓') ? 'text-green-600' : 'text-red-600'}`}>
              {results['time-entries']}
            </p>
          )}
          <button
            onClick={() => runSync('time-entries')}
            disabled={syncing}
            className="w-full flex items-center justify-center gap-2 py-2 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-300 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${syncingEntries ? 'animate-spin' : ''}`} />
            {syncingEntries ? 'Sincronizando...' : 'Sincronizar horas'}
          </button>
        </div>
      </div>
    </div>
  )
}
