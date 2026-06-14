'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, FolderKanban, Clock, RefreshCw,
  Users, Settings, Zap, LogOut, Target, CheckSquare, BarChart3,
} from 'lucide-react'
import type { UserProfile } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/projects', icon: FolderKanban, label: 'Proyectos' },
  { href: '/dashboard/budgets', icon: Target, label: 'Presupuestos' },
  { href: '/dashboard/time-entries', icon: Clock, label: 'Horas' },
  { href: '/dashboard/sync', icon: RefreshCw, label: 'Sincronización' },
]

const adminItems = [
  { href: '/dashboard/approvals', icon: CheckSquare, label: 'Aprobaciones', badge: true },
  { href: '/dashboard/reports', icon: BarChart3, label: 'Informes', badge: false },
  { href: '/dashboard/users', icon: Users, label: 'Usuarios', badge: false },
  { href: '/dashboard/settings', icon: Settings, label: 'Configuración', badge: false },
]

export default function Sidebar({
  profile,
  pendingApprovals,
}: {
  profile: UserProfile
  pendingApprovals?: number
}) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-slate-900 text-sm">Emotiv Sync</p>
            <p className="text-xs text-slate-400">Everhour ↔ Zoho</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                active
                  ? 'bg-violet-50 text-violet-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          )
        })}

        {profile.role === 'admin' && (
          <>
            <div className="pt-4 pb-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3">Admin</p>
            </div>
            {adminItems.map((item) => {
              const active = pathname.startsWith(item.href)
              const showBadge = item.badge && pendingApprovals && pendingApprovals > 0
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                    active
                      ? 'bg-violet-50 text-violet-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  {item.label}
                  {showBadge ? (
                    <span className="ml-auto flex items-center justify-center w-5 h-5 rounded-full bg-violet-600 text-white text-xs font-bold">
                      {pendingApprovals! > 99 ? '99+' : pendingApprovals}
                    </span>
                  ) : null}
                </Link>
              )
            })}
          </>
        )}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-violet-700 text-xs font-bold uppercase">
              {(profile.full_name || profile.email)[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">
              {profile.full_name || profile.email}
            </p>
            <p className="text-xs text-slate-400 capitalize">{profile.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
