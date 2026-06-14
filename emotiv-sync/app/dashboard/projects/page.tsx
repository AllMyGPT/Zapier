import { createClient } from '@/lib/supabase/server'
import { formatDateTime } from '@/lib/utils'
import { computeBudgetStatus, formatMoney, type BudgetStatus } from '@/lib/budgets'
import { formatHours } from '@/lib/utils'
import { FolderKanban, CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react'
import SyncProjectsButton from '@/components/features/projects/SyncProjectsButton'
import Link from 'next/link'
import type { TimeEntry } from '@/types'

export default async function ProjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user!.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  const { data: projects } = await supabase
    .from('everhour_projects')
    .select('*')
    .order('name')

  // Budget consumption for projects that have a budget
  const budgetedIds = (projects ?? []).filter((p) => p.budget_type).map((p) => p.id)
  type BEntry = Pick<TimeEntry, 'hours' | 'logged_date' | 'billable'> & {
    everhour_project_id: string | null
  }
  const entriesByProject = new Map<string, BEntry[]>()
  if (budgetedIds.length) {
    const { data: bEntries } = await supabase
      .from('everhour_time_entries')
      .select('hours, logged_date, billable, everhour_project_id')
      .in('everhour_project_id', budgetedIds)
    for (const e of (bEntries ?? []) as BEntry[]) {
      if (!e.everhour_project_id) continue
      const arr = entriesByProject.get(e.everhour_project_id) ?? []
      arr.push(e)
      entriesByProject.set(e.everhour_project_id, arr)
    }
  }

  const total = projects?.length ?? 0
  const synced = projects?.filter(p => p.zoho_project_id).length ?? 0
  const pending = total - synced

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Proyectos</h1>
          <p className="text-sm text-slate-500 mt-0.5">{total} proyectos · {synced} en Zoho</p>
        </div>
        {isAdmin && <SyncProjectsButton />}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white rounded-xl p-3 text-center border border-slate-100 shadow-sm">
          <p className="text-xl font-bold text-slate-900">{total}</p>
          <p className="text-xs text-slate-500">Total</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center border border-slate-100 shadow-sm">
          <p className="text-xl font-bold text-green-600">{synced}</p>
          <p className="text-xs text-slate-500">Sync</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center border border-slate-100 shadow-sm">
          <p className="text-xl font-bold text-amber-600">{pending}</p>
          <p className="text-xs text-slate-500">Pendientes</p>
        </div>
      </div>

      {/* Projects list */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {(projects ?? []).length === 0 ? (
          <div className="p-10 text-center">
            <FolderKanban className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No hay proyectos aún.</p>
            {isAdmin && <p className="text-slate-400 text-xs mt-1">Usa &laquo;Importar&raquo; para traer los proyectos de Everhour.</p>}
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {(projects ?? []).map((project) => {
              const budget = project.budget_type
                ? computeBudgetStatus(project, entriesByProject.get(project.id) ?? [])
                : null
              return (
              <div key={project.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    project.zoho_project_id ? 'bg-green-50' : 'bg-amber-50'
                  }`}>
                    {project.zoho_project_id
                      ? <CheckCircle2 className="w-5 h-5 text-green-600" />
                      : <AlertCircle className="w-5 h-5 text-amber-600" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{project.name}</p>
                    {project.client_name && (
                      <p className="text-xs text-slate-500 mt-0.5">{project.client_name}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        project.status === 'active'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {project.status === 'active' ? 'Activo' : 'Archivado'}
                      </span>
                      {project.billable && (
                        <span className="text-xs text-violet-600 font-medium">Facturable</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {project.zoho_project_id ? (
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Zoho</span>
                      </div>
                    ) : (
                      <span className="text-xs text-amber-600">Sin Zoho ID</span>
                    )}
                    {project.last_synced_at && (
                      <p className="text-xs text-slate-400 mt-1">
                        {formatDateTime(project.last_synced_at)}
                      </p>
                    )}
                    <Link
                      href={`/dashboard/projects/${project.id}`}
                      className="inline-flex items-center gap-0.5 text-xs text-violet-600 hover:text-violet-800 mt-1.5 font-medium transition-colors"
                    >
                      Ver detalle <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>

                {budget?.hasBudget && (
                  <ProjectBudgetBar budget={budget} />
                )}
              </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function ProjectBudgetBar({ budget }: { budget: BudgetStatus }) {
  const fmt = (v: number) =>
    budget.type === 'money' ? formatMoney(v) : formatHours(v)
  const barColor =
    budget.level === 'over'
      ? 'bg-red-500'
      : budget.level === 'warning'
      ? 'bg-amber-500'
      : 'bg-green-500'
  return (
    <div className="mt-3 pl-12">
      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
        <span>Presupuesto</span>
        <span className={
          budget.level === 'over' ? 'text-red-600 font-semibold'
          : budget.level === 'warning' ? 'text-amber-600 font-semibold'
          : 'text-slate-500'
        }>
          {fmt(budget.consumed)} / {fmt(budget.limit)} ({budget.percent}%)
        </span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${Math.min(budget.percent, 100)}%` }} />
      </div>
    </div>
  )
}
