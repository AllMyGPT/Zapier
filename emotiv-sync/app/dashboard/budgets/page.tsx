import { createClient } from '@/lib/supabase/server'
import { computeBudgetStatus, formatMoney, type BudgetStatus } from '@/lib/budgets'
import { formatHours } from '@/lib/utils'
import { Target, AlertTriangle, CheckCircle2, XOctagon } from 'lucide-react'
import type { EverhourProject, TimeEntry } from '@/types'

export default async function BudgetsPage() {
  const supabase = await createClient()

  const { data: projects } = await supabase
    .from('everhour_projects')
    .select('*')
    .not('budget_type', 'is', null)
    .order('name')

  const today = new Date()
  const firstDayOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString().split('T')[0]
  const lastDayOfCurrentMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    .toISOString().split('T')[0]

  // Separate projects by budget period
  const monthlyProjects = (projects ?? []).filter((p: EverhourProject) => p.budget_period === 'monthly')
  const overallProjects = (projects ?? []).filter((p: EverhourProject) => p.budget_period !== 'monthly')

  const monthlyIds = monthlyProjects.map((p: EverhourProject) => p.id)
  const overallIds = overallProjects.map((p: EverhourProject) => p.id)

  type BudgetEntry = Pick<TimeEntry, 'hours' | 'logged_date' | 'billable'> & {
    everhour_project_id: string | null
  }

  const entriesByProject = new Map<string, BudgetEntry[]>()

  // For monthly projects: only load current month entries
  if (monthlyIds.length) {
    const { data } = await supabase
      .from('everhour_time_entries')
      .select('hours, logged_date, billable, everhour_project_id')
      .in('everhour_project_id', monthlyIds)
      .gte('logged_date', firstDayOfCurrentMonth)
      .lte('logged_date', lastDayOfCurrentMonth)
    for (const e of (data ?? []) as BudgetEntry[]) {
      if (!e.everhour_project_id) continue
      const arr = entriesByProject.get(e.everhour_project_id) ?? []
      arr.push(e)
      entriesByProject.set(e.everhour_project_id, arr)
    }
  }

  // For overall projects: load all entries
  if (overallIds.length) {
    const { data } = await supabase
      .from('everhour_time_entries')
      .select('hours, logged_date, billable, everhour_project_id')
      .in('everhour_project_id', overallIds)
    for (const e of (data ?? []) as BudgetEntry[]) {
      if (!e.everhour_project_id) continue
      const arr = entriesByProject.get(e.everhour_project_id) ?? []
      arr.push(e)
      entriesByProject.set(e.everhour_project_id, arr)
    }
  }

  const rows = (projects ?? []).map((p: EverhourProject) => ({
    project: p,
    status: computeBudgetStatus(p, entriesByProject.get(p.id) ?? []),
  }))

  const over = rows.filter((r) => r.status.level === 'over').length
  const warning = rows.filter((r) => r.status.level === 'warning').length
  const ok = rows.filter((r) => r.status.level === 'ok').length

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Presupuestos</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {rows.length} proyectos con presupuesto definido
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white rounded-xl p-3 text-center border border-slate-100 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-green-600">{ok}</p>
          <p className="text-xs text-slate-500">En rango</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center border border-slate-100 shadow-sm">
          <AlertTriangle className="w-4 h-4 text-amber-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-amber-600">{warning}</p>
          <p className="text-xs text-slate-500">En alerta</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center border border-slate-100 shadow-sm">
          <XOctagon className="w-4 h-4 text-red-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-red-600">{over}</p>
          <p className="text-xs text-slate-500">Excedidos</p>
        </div>
      </div>

      {/* Budget list */}
      <div className="space-y-3">
        {rows.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-10 text-center">
            <Target className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">Ningún proyecto tiene presupuesto.</p>
            <p className="text-slate-400 text-xs mt-1">
              Define presupuestos en Everhour y vuelve a importar los proyectos.
            </p>
          </div>
        ) : (
          rows.map(({ project, status }) => (
            <BudgetCard key={project.id} project={project} status={status} />
          ))
        )}
      </div>
    </div>
  )
}

function BudgetCard({
  project,
  status,
}: {
  project: EverhourProject
  status: BudgetStatus
}) {
  const fmt = (v: number) =>
    status.type === 'money' ? formatMoney(v) : formatHours(v)

  const barColor =
    status.level === 'over'
      ? 'bg-red-500'
      : status.level === 'warning'
      ? 'bg-amber-500'
      : 'bg-green-500'

  const badge =
    status.level === 'over'
      ? { text: 'Excedido', cls: 'bg-red-50 text-red-700' }
      : status.level === 'warning'
      ? { text: 'Alerta', cls: 'bg-amber-50 text-amber-700' }
      : { text: 'En rango', cls: 'bg-green-50 text-green-700' }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">{project.name}</p>
          <p className="text-xs text-slate-400">
            {project.client_name ?? 'Sin cliente'} ·{' '}
            {project.budget_period === 'monthly' ? 'Mensual' : 'Total'}
          </p>
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${badge.cls}`}>
          {badge.text}
        </span>
      </div>

      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${Math.min(status.percent, 100)}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500">
          {fmt(status.consumed)} <span className="text-slate-300">/</span>{' '}
          {fmt(status.limit)}
        </span>
        <span
          className={
            status.level === 'over'
              ? 'text-red-600 font-semibold'
              : status.level === 'warning'
              ? 'text-amber-600 font-semibold'
              : 'text-slate-500'
          }
        >
          {status.percent}%
          {status.remaining >= 0
            ? ` · quedan ${fmt(status.remaining)}`
            : ` · ${fmt(Math.abs(status.remaining))} de más`}
        </span>
      </div>
    </div>
  )
}
