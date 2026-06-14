import { createClient } from '@/lib/supabase/server'
import { formatDateTime, formatHours } from '@/lib/utils'
import { FolderKanban, Clock, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user!.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  const [
    { count: totalProjects },
    { count: syncedProjects },
    { count: pendingEntries },
    { data: recentLogs },
    { data: userEntries },
  ] = await Promise.all([
    supabase.from('everhour_projects').select('*', { count: 'exact', head: true }),
    supabase.from('everhour_projects').select('*', { count: 'exact', head: true }).not('zoho_project_id', 'is', null),
    supabase.from('everhour_time_entries').select('*', { count: 'exact', head: true }).is('synced_at', null),
    supabase.from('sync_logs').select('*').order('created_at', { ascending: false }).limit(5),
    supabase.from('everhour_time_entries')
      .select('hours, logged_date')
      .eq('user_id', user!.id)
      .gte('logged_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
  ])

  const weekHours = (userEntries ?? []).reduce((sum, e) => sum + (e.hours || 0), 0)

  const stats = [
    {
      label: 'Proyectos totales',
      value: totalProjects ?? 0,
      icon: FolderKanban,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Sincronizados con Zoho',
      value: syncedProjects ?? 0,
      icon: CheckCircle2,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Horas pendientes sync',
      value: pendingEntries ?? 0,
      icon: AlertCircle,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Mis horas (7 días)',
      value: formatHours(weekHours),
      icon: Clock,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">Resumen de sincronización Everhour ↔ Zoho Books</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className={`w-9 h-9 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Sync progress */}
      {isAdmin && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <h2 className="font-semibold text-slate-800 mb-3 text-sm">Progreso de sincronización</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Proyectos sincronizados</span>
              <span>{syncedProjects ?? 0} / {totalProjects ?? 0}</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-violet-500 rounded-full transition-all"
                style={{ width: `${totalProjects ? ((syncedProjects ?? 0) / totalProjects) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Recent sync logs */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="p-4 border-b border-slate-50 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800 text-sm">Últimas sincronizaciones</h2>
          <a href="/dashboard/sync" className="text-xs text-violet-600 font-medium">Ver todas →</a>
        </div>
        <div className="divide-y divide-slate-50">
          {(recentLogs ?? []).length === 0 ? (
            <div className="p-6 text-center">
              <RefreshCw className="w-8 h-8 text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-400">Sin sincronizaciones aún</p>
            </div>
          ) : (
            (recentLogs ?? []).map((log) => (
              <div key={log.id} className="p-4 flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  log.status === 'success' ? 'bg-green-500' :
                  log.status === 'error' ? 'bg-red-500' : 'bg-amber-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 capitalize">
                    {log.sync_type === 'projects' ? 'Proyectos' : 'Horas'}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {log.records_processed} registros • {formatDateTime(log.created_at)}
                  </p>
                  {log.message && (
                    <p className="text-xs text-slate-500 mt-1 truncate">{log.message}</p>
                  )}
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
                  log.status === 'success' ? 'bg-green-50 text-green-700' :
                  log.status === 'error' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                }`}>
                  {log.status === 'success' ? 'OK' : log.status === 'error' ? 'Error' : 'Parcial'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
