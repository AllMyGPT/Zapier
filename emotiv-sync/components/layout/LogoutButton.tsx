'use client'

import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-red-600 bg-white border border-slate-100 rounded-2xl shadow-sm hover:bg-red-50 transition-colors"
    >
      <LogOut className="w-4 h-4" />
      Cerrar sesión
    </button>
  )
}
