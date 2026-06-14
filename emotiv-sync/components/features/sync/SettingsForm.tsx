'use client'

import { useState } from 'react'
import { Eye, EyeOff, Save } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SettingsForm({
  everhourKey,
  everhourActive,
  zohoToken,
  zohoOrgId,
  zohoActive,
}: {
  everhourKey: string
  everhourActive: boolean
  zohoToken: string
  zohoOrgId: string
  zohoActive: boolean
}) {
  const [showEverhour, setShowEverhour] = useState(false)
  const [showZoho, setShowZoho] = useState(false)
  const [form, setForm] = useState({
    everhourKey,
    zohoToken,
    zohoOrgId,
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const router = useRouter()

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Error')
      }
      setResult('✓ Configuración guardada')
      router.refresh()
    } catch (e: unknown) {
      setResult(`✗ ${e instanceof Error ? e.message : 'Error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      {/* Everhour */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center">
            <span className="text-blue-600 font-bold text-xs">EV</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">Everhour</p>
            <p className="text-xs text-slate-400">API Key para importar proyectos y horas</p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">API Key</label>
          <div className="relative">
            <input
              type={showEverhour ? 'text' : 'password'}
              value={form.everhourKey}
              onChange={e => setForm(f => ({ ...f, everhourKey: e.target.value }))}
              placeholder="ev_..."
              className="w-full px-4 py-3 pr-10 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => setShowEverhour(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            >
              {showEverhour ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Obtén tu API key en Everhour → Configuración → API
          </p>
        </div>
      </div>

      {/* Zoho Books */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-orange-50 rounded-xl flex items-center justify-center">
            <span className="text-orange-600 font-bold text-xs">ZB</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">Zoho Books</p>
            <p className="text-xs text-slate-400">Access Token y Organization ID</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Access Token</label>
            <div className="relative">
              <input
                type={showZoho ? 'text' : 'password'}
                value={form.zohoToken}
                onChange={e => setForm(f => ({ ...f, zohoToken: e.target.value }))}
                placeholder="1000.xxx..."
                className="w-full px-4 py-3 pr-10 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowZoho(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              >
                {showZoho ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Organization ID</label>
            <input
              type="text"
              value={form.zohoOrgId}
              onChange={e => setForm(f => ({ ...f, zohoOrgId: e.target.value }))}
              placeholder="123456789"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>
          <p className="text-xs text-slate-400">
            Obtén el token en Zoho API Console. El Organization ID está en Zoho Books → Configuración.
          </p>
        </div>
      </div>

      {result && (
        <div className={`text-sm p-3 rounded-xl text-center ${
          result.startsWith('✓') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {result}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-300 text-white font-semibold rounded-xl transition-colors"
      >
        <Save className="w-4 h-4" />
        {loading ? 'Guardando...' : 'Guardar configuración'}
      </button>
    </form>
  )
}
