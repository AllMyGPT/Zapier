import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  FolderKanban, Target, CheckSquare, BarChart3,
  RefreshCw, Users, Settings, ChevronRight,
} from 'lucide-react'
import LogoutButton from '@/components/layout/LogoutButton'

export default async function MorePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, full_name, email')
    .eq('id', user!.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  const items = [
    { href: '/dashboard/projects', icon: FolderKanban, label: 'Proyectos', show: true },
    { href: '/dashboard/budgets', icon: Target, label: 'Presupuestos', show: true },
    { href: '/dashboard/approvals', icon: CheckSquare, label: 'Aprobaciones', show: isAdmin },
    { href: '/dashboard/reports', icon: BarChart3, label: 'Informes', show: isAdmin },
    { href: '/dashboard/sync', icon: RefreshCw, label: 'Sincronización', show: true },
    { href: '/dashboard/users', icon: Users, label: 'Usuarios', show: isAdmin },
    { href: '/dashboard/settings', icon: Settings, label: 'Configuración', show: isAdmin },
  ].filter((i) => i.show)

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center">
          <span className="text-violet-700 font-bold uppercase">
            {(profile?.full_name || profile?.email || '?')[0]}
          </span>
        </div>
        <div>
          <p className="font-semibold text-slate-900">{profile?.full_name || profile?.email}</p>
          <p className="text-xs text-slate-400 capitalize">{profile?.role}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden divide-y divide-slate-50">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors"
          >
            <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center">
              <item.icon className="w-4 h-4 text-slate-600" />
            </div>
            <span className="flex-1 text-sm font-medium text-slate-800">{item.label}</span>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </Link>
        ))}
      </div>

      <LogoutButton />
    </div>
  )
}
