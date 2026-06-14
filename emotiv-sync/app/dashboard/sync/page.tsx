import { createClient } from '@/lib/supabase/server'
import { formatDateTime } from '@/lib/utils'
import { RefreshCw, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'
import ManualSyncPanel from '@/components/features/sync/ManualSyncPanel'

export default async function SyncPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user!.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  const { data: logs } = await supabase
    .from('sync_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  const success = (logs ?? []).filter(l => l.status === 'success').length
  const errors = (logs ?? []).filter(l => l.status === 'error').length
  const partial = (logs ?? []).filter(l => l.status === 'partial').length

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
          <p className="text-xl font-bold text-green-600">{success}</p>
          <p className="text-xs text-slate-500">Exitosas</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center border border-slate-100 shadow-sm">
          <div className="flex items-center justify-center gap-1 mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl font-bold text-amber-600">{partial}</p>
          <p className="text-xs text-slate-500">Parciales</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center border border-slate-100 shadow-sm">
          <div className="flex items-center justify-center gap-1 mb-1">
            <XCircle className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-xl font-bold text-red-600">{errors}</p>
          <p className="text-xs text-slate-500">Errores</p>
        </div>
      </div>

      {/* Manual sync panel - admin only */}
      {isAdmin && <ManualSyncPanel />}

      {/* Logs */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-50">
          <h2 className="font-semibold text-slate-800 text-sm">Historial de sincronización</h2>
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
                        {log.direction === 'everhour_to_zoho' ? 'Zoho Books' : 'Everhour'}
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
    </div>
  )
}
