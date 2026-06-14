import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatDateTime, formatHours } from '@/lib/utils'
import { computeBudgetStatus, formatMoney } from '@/lib/budgets'
import {
  FolderKanban, Clock, CheckCircle2, RefreshCw,
  CheckSquare, Target, TrendingUp, ChevronRight,
} from 'lucide-react'
import type { EverhourProject } from '@/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user!.id)
    .single()

  const isAdmin = profile?.role === 'admin'
  const today = new Date()
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString().split('T')[0]
  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const weekAgo = sevenDaysAgo.toISOString().split('T')[0]

  const [
    { count: totalProjects },
    { count: syncedProjects },
    { count: pendingApprovals },
    { count: myNeedsJustification },
    { data: recentLogs },
    { data: userEntries },
    { data: budgetProjects },
    { data: monthEntries },
  ] = await Promise.all([
    supabase.from('everhour_projects').select('*', { count: 'exact', head: true }),
    supabase.from('everhour_projects').select('*', { count: 'exact', head: true }).not('zoho_project_id', 'is', null),
    supabase.from('everhour_time_entries').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('everhour_time_entries').select('*', { count: 'exact', head: true })
      .eq('user_id', user!.id).eq('status', 'needs_justification'),
    supabase.from('sync_logs').select('*').order('created_at', { ascending: false }).limit(5),
    supabase.from('everhour_time_entries')
      .select('hours, logged_date')
      .eq('user_id', user!.id)
      .gte('logged_date', weekAgo),
    supabase.from('everhour_projects').select('*').not('budget_type', 'is', null),
    supabase.from('everhour_time_entries')
      .select('hours, logged_date, billable, everhour_project_id, project:everhour_projects(hourly_rate, cost_rate)')
      .neq('status', 'rejected')
      .gte('logged_date', monthStart),
  ])

  const weekHours = (userEntries ?? []).reduce((sum, e) => sum + (e.hours || 0), 0)

  // Budget alerts: compute consumption per budgeted project
  type MonthEntry = {
    hours: number; logged_date: string; billable: boolean
    everhour_project_id: string | null
    project: { hourly_rate: number | null; cost_rate: number | null } | null
  }
  const monthRows = (monthEntries ?? []) as unknown as MonthEntry[]
  const entriesByProject = new Map<string, MonthEntry[]>()
  for (const e of monthRows) {
    if (!e.everhour_project_id) continue
    const arr = entriesByProject.get(e.everhour_project_id) ?? []
    arr.push(e)
    entriesByProject.set(e.everhour_project_id, arr)
  }

  const budgetAlerts = (budgetProjects ?? [])
    .map((p: EverhourProject) => ({
      project: p,
      status: computeBudgetStatus(p, entriesByProject.get(p.id) ?? []),
    }))
    .filter((b) => b.status.level === 'warning' || b.status.level === 'over')
    .sort((a, b) => b.status.percent - a.status.percent)

  // Month profitability (admin)
  let revenue = 0, cost = 0
  for (const e of monthRows) {
    const billRate = e.project?.hourly_rate ?? 0
    const costRate = e.project?.cost_rate ?? 0
    if (e.billable) revenue += e.hours * billRate
    cost += e.hours * costRate
  }
  const profit = revenue - cost

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
      label: 'Pendientes de aprobar',
      value: pendingApprovals ?? 0,
      icon: CheckSquare,
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

      {/* Needs-justification call-to-action (own over-budget hours) */}
      {(myNeedsJustification ?? 0) > 0 && (
        <Link
          href="/dashboard/time-entries"
          className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-2xl p-4"
        >
          <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Target className="w-5 h-5 text-orange-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-orange-900">
              {myNeedsJustification} {myNeedsJustification === 1 ? 'registro supera' : 'registros superan'} el presupuesto
            </p>
            <p className="text-xs text-orange-700">Justifica tus horas para solicitar aprobación</p>
          </div>
          <ChevronRight className="w-5 h-5 text-orange-400 flex-shrink-0" />
        </Link>
      )}

      {/* Pending approvals call-to-action (admin) */}
      {isAdmin && (pendingApprovals ?? 0) > 0 && (
        <Link
          href="/dashboard/approvals"
          className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4"
        >
          <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <CheckSquare className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-900">
              {pendingApprovals} {pendingApprovals === 1 ? 'registro pendiente' : 'registros pendientes'} de aprobar
            </p>
            <p className="text-xs text-amber-700">Revisa antes de sincronizar a Zoho Books</p>
          </div>
          <ChevronRight className="w-5 h-5 text-amber-400 flex-shrink-0" />
        </Link>
      )}

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

      {/* Month profitability (admin) */}
      {isAdmin && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-green-500" /> Rentabilidad del mes
            </h2>
            <Link href="/dashboard/reports" className="text-xs text-violet-600 font-medium">
              Ver informes →
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-lg font-bold text-green-600">{formatMoney(revenue)}</p>
              <p className="text-xs text-slate-500">Ingresos</p>
            </div>
            <div>
              <p className="text-lg font-bold text-red-500">{formatMoney(cost)}</p>
              <p className="text-xs text-slate-500">Coste</p>
            </div>
            <div>
              <p className={`text-lg font-bold ${profit >= 0 ? 'text-violet-600' : 'text-red-600'}`}>
                {formatMoney(profit)}
              </p>
              <p className="text-xs text-slate-500">Beneficio</p>
            </div>
          </div>
        </div>
      )}

      {/* Budget alerts */}
      {budgetAlerts.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-50 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
              <Target className="w-4 h-4 text-amber-500" /> Alertas de presupuesto
            </h2>
            <Link href="/dashboard/budgets" className="text-xs text-violet-600 font-medium">
              Ver todos →
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {budgetAlerts.slice(0, 4).map(({ project, status }) => (
              <div key={project.id} className="p-4">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <p className="text-sm font-medium text-slate-800 truncate">{project.name}</p>
                  <span className={`text-xs font-semibold ${status.level === 'over' ? 'text-red-600' : 'text-amber-600'}`}>
                    {status.percent}%
                  </span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${status.level === 'over' ? 'bg-red-500' : 'bg-amber-500'}`}
                    style={{ width: `${Math.min(status.percent, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
