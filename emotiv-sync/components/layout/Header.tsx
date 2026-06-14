'use client'

import { Zap } from 'lucide-react'
import type { UserProfile } from '@/types'

export default function Header({ profile }: { profile: UserProfile }) {
  return (
    <header className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-violet-600 rounded-xl flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-slate-900">Emotiv Sync</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs bg-violet-100 text-violet-700 px-2 py-1 rounded-full font-medium capitalize">
          {profile.role}
        </span>
        <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center">
          <span className="text-violet-700 text-xs font-bold uppercase">
            {(profile.full_name || profile.email)[0]}
          </span>
        </div>
      </div>
    </header>
  )
}
