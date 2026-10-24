'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { UserRole } from '@/types'

export default function ChangeRoleButton({
  userId,
  currentRole,
}: {
  userId: string
  currentRole: UserRole
}) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleChange() {
    const newRole: UserRole = currentRole === 'admin' ? 'freelancer' : 'admin'
    if (!confirm(`¿Cambiar rol a ${newRole}?`)) return

    setLoading(true)
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })
      if (!res.ok) throw new Error('Error al cambiar rol')
      router.refresh()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleChange}
      disabled={loading}
      className="text-xs text-slate-500 hover:text-violet-600 border border-slate-200 hover:border-violet-300 px-2 py-1 rounded-lg transition-colors disabled:opacity-50"
    >
      {loading ? '...' : currentRole === 'admin' ? '→ Freelancer' : '→ Admin'}
    </button>
  )
}
