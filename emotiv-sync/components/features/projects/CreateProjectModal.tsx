'use client'

import { useState } from 'react'
import { X, FolderPlus } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Props = { onClose: () => void }

export default function CreateProjectModal({ onClose }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    client_name: '',
    billable: true,
    budget_type: '' as '' | 'hours' | 'money',
    budget_amount: '',
    budget_period: 'overall' as 'overall' | 'monthly',
    hourly_rate: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { setError('El nombre es obligatorio'); return }
    setLoading(true)
    setError(null)
    try {
      const body: Record<string, unknown> = {
        name: form.name.trim(),
        client_name: form.client_name.trim() || null,
        billable: form.billable,
      }
      if (form.budget_type) {
        body.budget_type = form.budget_type
        body.budget_amount = parseFloat(form.budget_amount) || null
        body.budget_period = form.budget_period
      }
      if (form.hourly_rate) body.hourly_rate = parseFloat(form.hourly_rate)

      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Error')
      }
      router.refresh()
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al crear proyecto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-violet-600" />
            <h2 className="font-semibold text-slate-900">Nuevo proyecto</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Nombre *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Nombre del proyecto"
              maxLength={200}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Cliente</label>
            <input
              type="text"
              value={form.client_name}
              onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))}
              placeholder="Nombre del cliente (opcional)"
              maxLength={200}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.billable}
                onChange={e => setForm(f => ({ ...f, billable: e.target.checked }))}
                className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500"
              />
              <span className="text-sm text-slate-700">Facturable</span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Presupuesto</label>
            <div className="grid grid-cols-3 gap-2">
              {(['', 'hours', 'money'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, budget_type: t }))}
                  className={`py-2 text-xs rounded-lg border transition-colors ${
                    form.budget_type === t
                      ? 'bg-violet-50 border-violet-400 text-violet-700 font-medium'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {t === '' ? 'Sin límite' : t === 'hours' ? 'Horas' : 'Dinero'}
                </button>
              ))}
            </div>
          </div>

          {form.budget_type && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  {form.budget_type === 'hours' ? 'Horas límite' : 'Importe límite (€)'}
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={form.budget_amount}
                  onChange={e => setForm(f => ({ ...f, budget_amount: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Período</label>
                <select
                  value={form.budget_period}
                  onChange={e => setForm(f => ({ ...f, budget_period: e.target.value as 'overall' | 'monthly' }))}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="overall">Total</option>
                  <option value="monthly">Mensual</option>
                </select>
              </div>
            </div>
          )}

          {form.billable && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Tarifa por hora (€)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.hourly_rate}
                onChange={e => setForm(f => ({ ...f, hourly_rate: e.target.value }))}
                placeholder="0.00"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 text-sm font-medium text-white bg-violet-600 rounded-xl hover:bg-violet-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Creando...' : 'Crear proyecto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
