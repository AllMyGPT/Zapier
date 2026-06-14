import { createClient } from '@/lib/supabase/server'
import { formatDateTime } from '@/lib/utils'
import { RefreshCw, CheckCircle2, XCircle, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react'
import ManualSyncPanel from '@/components/features/sync/ManualSyncPanel'
import Link from 'next/link'

const PAGE_SIZE = 20

export default async function SyncPage({
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

  const isAdmin = profile?.role === 'admin'

  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? '1', 10))
  const rangeFrom = (page - 1) * PAGE_SIZE
  const rangeTo = page * PAGE_SIZE - 1

  // KPI counts come from a separate query over all logs (no pagination)
  const [
    { count: successCount },
    { count: errorCount },
    { count: partialCount },
    { data: logs, count: totalCount },
  ] = await Promise.all([
    supabase
      .from('sync_logs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'success'),
    supabase
      .from('sync_logs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'error'),
    supabase
      .from('sync_logs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'partial'),
    supabase
      .from('sync_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(rangeFrom, rangeTo),
  ])

  const totalPages = Math.ceil((totalCount ?? 0) / PAGE_SIZE)
  const showingFrom = totalCount === 0 ? 0 : rangeFrom + 1
  const showingTo = Math.min(rangeTo + 1, totalCount ?? 0)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Sincronización</h1>
        <p className="text-sm text-slate-500 mt-0.5">Historial y control de sincronización</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white rounded-xl p-3 text-center border border-slate-100 shadow-sm">
          <div className="flex items-center justify-center gap-1 mb-1">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-xl font-bold text-green-600">{successCount ?? 0}</p>
          <p className="text-xs text-slate-500">Exitosas</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center border border-slate-100 shadow-sm">
          <div className="flex items-center justify-center gap-1 mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl font-bold text-amber-600">{partialCount ?? 0}</p>
          <p className="text-xs text-slate-500">Parciales</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center border border-slate-100 shadow-sm">
          <div className="flex items-center justify-center gap-1 mb-1">
            <XCircle className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-xl font-bold text-red-600">{errorCount ?? 0}</p>
          <p className="text-xs text-slate-500">Errores</p>
        </div>
      </div>

      {/* Manual sync panel - admin only */}
      {isAdmin && <ManualSyncPanel />}

      {/* Logs */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-50 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800 text-sm">Historial de sincronización</h2>
          {(totalCount ?? 0) > 0 && (
            <span className="text-xs text-slate-400">
              Mostrando {showingFrom}–{showingTo} de {totalCount}
            </span>
          )}
        </div>
        <div className="divide-y divide-slate-50">
          {(logs ?? []).length === 0 ? (
            <div className="p-10 text-center">
              <RefreshCw className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">Sin sincronizaciones aún</p>
            </div>
          ) : (
            (logs ?? []).map((log) => (
              <div key={log.id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      log.status === 'success' ? 'bg-green-50' :
                      log.status === 'error' ? 'bg-red-50' : 'bg-amber-50'
                    }`}>
                      {log.status === 'success'
                        ? <CheckCircle2 className="w-4 h-4 text-green-600" />
                        : log.status === 'error'
                        ? <XCircle className="w-4 h-4 text-red-600" />
                        : <AlertTriangle className="w-4 h-4 text-amber-600" />
                      }
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {log.sync_type === 'projects' ? 'Proyectos' : 'Horas'}
                        {' → '}
                        {'Zoho Books'}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{formatDateTime(log.created_at)}</p>
                      {log.message && (
                        <p className="text-xs text-slate-500 mt-1">{log.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-slate-900">{log.records_processed}</p>
                    <p className="text-xs text-slate-400">procesados</p>
                    {log.records_failed > 0 && (
                      <p className="text-xs text-red-500 mt-0.5">{log.records_failed} errores</p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3">
          <span className="text-xs text-slate-500">
            Página {page} de {totalPages} · {totalCount} sincronizaciones
          </span>
          <div className="flex items-center gap-2">
            {page > 1 ? (
              <Link
                href={`/dashboard/sync?page=${page - 1}`}
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
                href={`/dashboard/sync?page=${page + 1}`}
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
