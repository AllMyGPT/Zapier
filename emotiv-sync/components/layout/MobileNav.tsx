'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FolderKanban, Clock, RefreshCw, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types'

const baseItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Inicio' },
  { href: '/dashboard/projects', icon: FolderKanban, label: 'Proyectos' },
  { href: '/dashboard/time-entries', icon: Clock, label: 'Horas' },
  { href: '/dashboard/sync', icon: RefreshCw, label: 'Sync' },
]

export default function MobileNav({ role }: { role: UserRole }) {
  const pathname = usePathname()

  const items = role === 'admin'
    ? [...baseItems, { href: '/dashboard/settings', icon: Settings, label: 'Config' }]
    : baseItems

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 safe-bottom">
      <div className="flex">
        {items.map((item) => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors',
                active ? 'text-violet-700' : 'text-slate-400'
              )}
            >
              <item.icon className={cn('w-5 h-5', active && 'stroke-[2.5]')} />
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
