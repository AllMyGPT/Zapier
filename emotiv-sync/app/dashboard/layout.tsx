import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import MobileNav from '@/components/layout/MobileNav'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import type { UserProfile } from '@/types'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const userProfile: UserProfile = profile ?? {
    id: user.id,
    email: user.email ?? '',
    full_name: user.user_metadata?.full_name ?? null,
    role: 'freelancer',
    avatar_url: null,
    created_at: user.created_at,
  }

  // Count pending approvals for admin badge
  let pendingApprovals: number | undefined
  if (userProfile.role === 'admin') {
    const { count } = await supabase
      .from('everhour_time_entries')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')
    pendingApprovals = count ?? undefined
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar - desktop only */}
      <Sidebar profile={userProfile} pendingApprovals={pendingApprovals} />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header profile={userProfile} />

        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <div className="max-w-5xl mx-auto px-4 py-6">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav role={userProfile.role} pendingApprovals={pendingApprovals} />
    </div>
  )
}
