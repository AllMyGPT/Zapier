import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ApprovalQueue from '@/components/features/approvals/ApprovalQueue'
import type { TimeEntry } from '@/types'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const PAGE_SIZE = 50

export default async function ApprovalsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user!.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? '1', 10))
  const rangeFrom = (page - 1) * PAGE_SIZE
  const rangeTo = page * PAGE_SIZE - 1

  const [
    { count: pendingCount },
    { count: needsJustificationCount },
    { data: pending, count: totalCount },
  ] = await Promise.all([
    supabase
      .from('everhour_time_entries')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabase
      .from('everhour_time_entries')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'needs_justification'),
    supabase
      .from('everhour_time_entries')
      .select(`*, project:everhour_projects(name, client_name), user:user_profiles(full_name, email)`, { count: 'exact' })
      .eq('status', 'pending')
      .order('logged_date', { ascending: false })
      .range(rangeFrom, rangeTo),
  ])

  const totalPages = Math.ceil((totalCount ?? 0) / PAGE_SIZE)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Aprobaciones</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Revisa las horas antes de sincronizarlas a Zoho Books
        </p>
      </div>

      {/* Summary banner */}
      {((pendingCount ?? 0) > 0 || (needsJustificationCount ?? 0) > 0) && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3 text-sm text-slate-700">
          <span className="font-semibold text-amber-700">{pendingCount ?? 0}</span>
          {' '}entradas pendientes de aprobación
          {(needsJustificationCount ?? 0) > 0 && (
            <>
              {' · '}
              <span className="font-semibold text-orange-700">{needsJustificationCount}</span>
              {' '}requieren justificación del freelancer
            </>
          )}
        </div>
      )}

      <ApprovalQueue entries={(pending ?? []) as TimeEntry[]} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3">
          <span className="text-xs text-slate-500">
            Página {page} de {totalPages} · {totalCount} entradas
          </span>
          <div className="flex items-center gap-2">
            {page > 1 ? (
              <Link
                href={`/dashboard/approvals?page=${page - 1}`}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Anterior
              </Link>
            ) : (
              <span className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-50 rounded-lg cursor-not-allowed">
                <ChevronLeft className="w-3.5 h-3.5" /> Anterior
              </span>
            )}
            {page < totalPages ? (
              <Link
                href={`/dashboard/approvals?page=${page + 1}`}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Siguiente <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <span className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-50 rounded-lg cursor-not-allowed">
                Siguiente <ChevronRight className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
