'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/dashboard')
        router.refresh()
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        })
        if (error) throw error
        setError('Revisa tu email para confirmar el registro.')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-indigo-100 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-violet-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Emotiv Sync</h1>
          <p className="text-slate-500 text-sm mt-1">Everhour ↔ Zoho Books</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">
            {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className={`text-sm p-3 rounded-lg ${
                error.includes('Revisa')
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-300 text-white font-semibold rounded-xl transition-colors text-sm shadow-sm"
            >
              {loading ? 'Cargando...' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null) }}
              className="text-sm text-violet-600 hover:text-violet-700 font-medium"
            >
              {mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Entra'}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          © 2026 Emotiv Neuromarketing
        </p>
      </div>
    </div>
  )
}
