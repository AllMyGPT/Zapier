import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ApprovalQueue from '@/components/features/approvals/ApprovalQueue'
import type { TimeEntry } from '@/types'

export default async function ApprovalsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user!.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: pending } = await supabase
    .from('everhour_time_entries')
    .select(`*, project:everhour_projects(name, client_name), user:user_profiles(full_name, email)`)
    .eq('status', 'pending')
    .order('logged_date', { ascending: false })

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Aprobaciones</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Revisa las horas antes de sincronizarlas a Zoho Books
        </p>
      </div>

      <ApprovalQueue entries={(pending ?? []) as TimeEntry[]} />
    </div>
  )
}
