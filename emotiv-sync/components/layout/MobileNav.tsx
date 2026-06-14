'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, FolderKanban, Clock, CheckSquare,
  BarChart3, MoreHorizontal,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types'

const adminItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Inicio', badge: false },
  { href: '/dashboard/time-entries', icon: Clock, label: 'Horas', badge: false },
  { href: '/dashboard/approvals', icon: CheckSquare, label: 'Aprobar', badge: true },
  { href: '/dashboard/reports', icon: BarChart3, label: 'Informes', badge: false },
  { href: '/dashboard/more', icon: MoreHorizontal, label: 'Más', badge: false },
]

const freelancerItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Inicio', badge: false },
  { href: '/dashboard/projects', icon: FolderKanban, label: 'Proyectos', badge: false },
  { href: '/dashboard/time-entries', icon: Clock, label: 'Horas', badge: false },
  { href: '/dashboard/more', icon: MoreHorizontal, label: 'Más', badge: false },
]

export default function MobileNav({
  role,
  pendingApprovals,
}: {
  role: UserRole
  pendingApprovals?: number
}) {
  const pathname = usePathname()
  const items = role === 'admin' ? adminItems : freelancerItems

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 safe-bottom">
      <div className="flex">
        {items.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href))
          const showBadge = item.badge && pendingApprovals && pendingApprovals > 0
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors relative',
                active ? 'text-violet-700' : 'text-slate-400'
              )}
            >
              <div className="relative">
                <item.icon className={cn('w-5 h-5', active && 'stroke-[2.5]')} />
                {showBadge && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[14px] h-[14px] px-0.5 rounded-full bg-red-500 text-white text-[9px] font-bold leading-none">
                    {pendingApprovals! > 99 ? '99+' : pendingApprovals}
                  </span>
                )}
              </div>
              <span>{item.label}</span>
              {active && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-violet-600 rounded-full" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
