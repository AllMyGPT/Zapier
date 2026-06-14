'use client'

import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SyncTimeEntriesButton({ from, to }: { from: string; to: string }) {
  const [syncing, setSyncing] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const router = useRouter()

  async function handleSync() {
    setSyncing(true)
    setResult(null)
    try {
      const res = await fetch(`/api/sync/time-entries?from=${from}&to=${to}`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error')
      setResult(`✓ ${data.synced} entradas enviadas a Zoho`)
      router.refresh()
    } catch (e: unknown) {
      setResult(`✗ ${e instanceof Error ? e.message : 'Error'}`)
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {result && (
        <span className={`text-xs ${result.startsWith('✓') ? 'text-green-600' : 'text-red-600'}`}>
          {result}
        </span>
      )}
      <button
        onClick={handleSync}
        disabled={syncing}
        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-violet-600 rounded-xl hover:bg-violet-700 disabled:opacity-50 transition-colors"
      >
        <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
        <span className="hidden sm:inline">{syncing ? 'Sincronizando...' : 'Sync Zoho'}</span>
      </button>
    </div>
  )
}
