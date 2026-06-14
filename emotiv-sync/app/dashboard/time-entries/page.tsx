import { createClient } from '@/lib/supabase/server'
import { formatDate, formatHours } from '@/lib/utils'
import { Clock, CheckCircle2 } from 'lucide-react'
import SyncTimeEntriesButton from '@/components/features/time-entries/SyncTimeEntriesButton'

export default async function TimeEntriesPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user!.id)
    .single()

  const isAdmin = profile?.role === 'admin'
  const params = await searchParams

  const today = new Date()
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const from = params.from ?? firstOfMonth.toISOString().split('T')[0]
  const to = params.to ?? today.toISOString().split('T')[0]

  let query = supabase
    .from('everhour_time_entries')
    .select(`*, project:everhour_projects(name, client_name), user:user_profiles(full_name, email)`)
    .gte('logged_date', from)
    .lte('logged_date', to)
    .order('logged_date', { ascending: false })

  if (!isAdmin) {
    query = query.eq('user_id', user!.id)
  }

  const { data: entries } = await query

  const totalHours = (entries ?? []).reduce((sum, e) => sum + (e.hours || 0), 0)
  const syncedCount = (entries ?? []).filter(e => e.synced_at).length
  const pendingCount = (entries ?? []).length - syncedCount

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Horas</h1>
          <p className="text-sm text-slate-500 mt-0.5">{formatHours(totalHours)} · {(entries ?? []).length} registros</p>
        </div>
        {isAdmin && <SyncTimeEntriesButton from={from} to={to} />}
      </div>

      {/* Date filter */}
      <form className="bg-white rounded-xl border border-slate-100 shadow-sm p-3 flex items-center gap-2">
        <div className="flex-1">
          <label className="text-xs text-slate-500">Desde</label>
          <input
            type="date"
            name="from"
            defaultValue={from}
            className="block w-full text-sm text-slate-800 border-none outline-none"
          />
        </div>
        <div className="w-px h-8 bg-slate-200" />
        <div className="flex-1">
          <label className="text-xs text-slate-500">Hasta</label>
          <input
            type="date"
            name="to"
            defaultValue={to}
            className="block w-full text-sm text-slate-800 border-none outline-none"
          />
        </div>
        <button
          type="submit"
          className="px-3 py-2 bg-violet-600 text-white rounded-lg text-xs font-medium"
        >
          Filtrar
        </button>
      </form>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white rounded-xl p-3 text-center border border-slate-100 shadow-sm">
          <p className="text-xl font-bold text-slate-900">{formatHours(totalHours)}</p>
          <p className="text-xs text-slate-500">Total</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center border border-slate-100 shadow-sm">
          <p className="text-xl font-bold text-green-600">{syncedCount}</p>
          <p className="text-xs text-slate-500">Sincronizadas</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center border border-slate-100 shadow-sm">
          <p className="text-xl font-bold text-amber-600">{pendingCount}</p>
          <p className="text-xs text-slate-500">Pendientes</p>
        </div>
      </div>

      {/* Entries list */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {(entries ?? []).length === 0 ? (
          <div className="p-10 text-center">
            <Clock className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No hay registros de horas en este período.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {(entries ?? []).map((entry) => (
              <div key={entry.id} className="p-4 flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                  entry.status === 'approved' ? 'bg-green-500'
                  : entry.status === 'rejected' ? 'bg-red-400'
                  : 'bg-amber-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {entry.project?.name ?? 'Sin proyecto'}
                      </p>
                      {entry.project?.client_name && (
                        <p className="text-xs text-slate-400">{entry.project.client_name}</p>
                      )}
                      {entry.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{entry.description}</p>
                      )}
                      {isAdmin && entry.user && (
                        <p className="text-xs text-violet-600 mt-1">
                          {entry.user.full_name || entry.user.email}
                        </p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-sm font-bold text-slate-900">{formatHours(entry.hours)}</span>
                      <p className="text-xs text-slate-400 mt-0.5">{formatDate(entry.logged_date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <StatusBadge status={entry.status} />
                    {entry.billable === false && (
                      <span className="text-xs text-slate-400">No facturable</span>
                    )}
                    {entry.synced_at && (
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                        <span className="text-xs text-green-600">Zoho Books</span>
                      </span>
                    )}
                  </div>
                  {entry.status === 'rejected' && entry.rejection_reason && (
                    <p className="text-xs text-red-500 mt-1">Motivo: {entry.rejection_reason}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: 'pending' | 'approved' | 'rejected' }) {
  const map = {
    pending: { text: 'Pendiente', cls: 'bg-amber-50 text-amber-700' },
    approved: { text: 'Aprobada', cls: 'bg-green-50 text-green-700' },
    rejected: { text: 'Rechazada', cls: 'bg-red-50 text-red-700' },
  }
  const s = map[status]
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.cls}`}>
      {s.text}
    </span>
  )
}
