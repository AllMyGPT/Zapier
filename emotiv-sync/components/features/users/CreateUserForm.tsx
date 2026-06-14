'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus, Mail } from 'lucide-react'
import type { UserRole } from '@/types'

export default function CreateUserForm() {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<UserRole>('freelancer')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, full_name: fullName, role }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error')
      setResult({ ok: true, msg: `Invitación enviada a ${email}` })
      setEmail('')
      setFullName('')
      setRole('freelancer')
      router.refresh()
    } catch (e: unknown) {
      setResult({ ok: false, msg: e instanceof Error ? e.message : 'Error' })
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-violet-600 rounded-xl hover:bg-violet-700 transition-colors"
      >
        <UserPlus className="w-4 h-4" />
        <span className="hidden sm:inline">Nuevo usuario</span>
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-xl p-5 safe-bottom">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center">
            <UserPlus className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">Crear usuario</h2>
            <p className="text-xs text-slate-400">Recibirá un email para activar su cuenta</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Nombre completo
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nombre Apellido"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="persona@emotive-neuromarketing.com"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Rol</label>
            <div className="grid grid-cols-2 gap-2">
              {(['freelancer', 'admin'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                    role === r
                      ? 'bg-violet-50 border-violet-300 text-violet-700'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  {r === 'admin' ? 'Admin' : 'Freelancer'}
                </button>
              ))}
            </div>
          </div>

          {result && (
            <div
              className={`text-sm p-3 rounded-xl flex items-center gap-2 ${
                result.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}
            >
              {result.ok && <Mail className="w-4 h-4 flex-shrink-0" />}
              {result.msg}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => { setOpen(false); setResult(null) }}
              className="flex-1 py-3 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl"
            >
              Cerrar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 text-sm font-semibold text-white bg-violet-600 rounded-xl hover:bg-violet-700 disabled:opacity-50"
            >
              {loading ? 'Enviando…' : 'Enviar invitación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
