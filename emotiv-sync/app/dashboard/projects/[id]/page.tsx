import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { computeBudgetStatus, formatMoney, type BudgetStatus } from '@/lib/budgets'
import { formatHours, formatDate } from '@/lib/utils'
import {
  ArrowLeft, CheckCircle2, AlertCircle, Clock,
  ChevronLeft, ChevronRight,
} from 'lucide-react'
import type { TimeEntry } from '@/types'

const PAGE_SIZE = 20

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const { id } = await params
  const sp = await searchParams
  const page = Math.max(1, parseInt(sp.page ?? '1', 10))
  const rangeFrom = (page - 1) * PAGE_SIZE
  const rangeTo = page * PAGE_SIZE - 1

  const supabase = await createClient()

  const { data: project } = await supabase
    .from('everhour_projects')
    .select('*')
    .eq('id', id)
    .single()

  if (!project) notFound()

  // Load all time entries for budget calculation and KPIs
  const { data: allEntries } = await supabase
    .from('everhour_time_entries')
    .select('hours, logged_date, billable, status')
    .eq('everhour_project_id', id)

  type AllEntry = { hours: number; logged_date: string; billable: boolean; status: string }
  const entries = (allEntries ?? []) as AllEntry[]

  // KPIs
  const totalHours = entries.reduce((s, e) => s + e.hours, 0)
  const approvedHours = entries.filter(e => e.status === 'approved').reduce((s, e) => s + e.hours, 0)
  const pendingHours = entries.filter(e => e.status === 'pending').reduce((s, e) => s + e.hours, 0)
  const rejectedHours = entries.filter(e => e.status === 'rejected').reduce((s, e) => s + e.hours, 0)

  // Budget
  const budget = project.budget_type
    ? computeBudgetStatus(project, entries.map(e => ({ hours: e.hours, logged_date: e.logged_date, billable: e.billable })))
    : null

  // Paginated entries with user + project join
  const { data: pagedEntries, count: totalCount } = await supabase
    .from('everhour_time_entries')
    .select('*, user:user_profiles(full_name, email)', { count: 'exact' })
    .eq('everhour_project_id', id)
    .order('logged_date', { ascending: false })
    .range(rangeFrom, rangeTo)

  const totalPages = Math.ceil((totalCount ?? 0) / PAGE_SIZE)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/projects"
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Volver a proyectos
        </Link>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{project.name}</h1>
            {project.client_name && (
              <p className="text-sm text-slate-500 mt-0.5">{project.client_name}</p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                project.status === 'active'
                  ? 'bg-green-50 text-green-700'
                  : 'bg-slate-100 text-slate-500'
              }`}>
                {project.status === 'active' ? 'Activo' : 'Archivado'}
              </span>
              {project.billable && (
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-violet-50 text-violet-700">
                  Facturable
                </span>
              )}
              {project.hourly_rate && (
                <span className="text-xs text-slate-500">
                  {formatMoney(project.hourly_rate)}/h
                </span>
              )}
            </div>
          </div>
          {/* Zoho sync status */}
          <div className="flex-shrink-0">
            {project.zoho_project_id ? (
              <div className="flex items-center gap-1.5 bg-green-50 border border-green-100 rounded-xl px-3 py-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-xs font-medium text-green-700">Zoho Books</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-medium text-amber-700">Sin Zoho ID</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Budget progress bar */}
      {budget?.hasBudget && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <h2 className="text-sm font-semibold text-slate-800 mb-3">Presupuesto</h2>
          <ProjectBudgetBar budget={budget} />
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="bg-white rounded-xl p-3 text-center border border-slate-100 shadow-sm">
          <p className="text-xl font-bold text-slate-900">{formatHours(totalHours)}</p>
          <p className="text-xs text-slate-500">Total</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center border border-slate-100 shadow-sm">
          <p className="text-xl font-bold text-green-600">{formatHours(approvedHours)}</p>
          <p className="text-xs text-slate-500">Aprobadas</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center border border-slate-100 shadow-sm">
          <p className="text-xl font-bold text-amber-600">{formatHours(pendingHours)}</p>
          <p className="text-xs text-slate-500">Pendientes</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center border border-slate-100 shadow-sm">
          <p className="text-xl font-bold text-red-500">{formatHours(rejectedHours)}</p>
          <p className="text-xs text-slate-500">Rechazadas</p>
        </div>
      </div>

      {/* Time entries table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-50">
          <h2 className="font-semibold text-slate-800 text-sm">
            Registros de horas
            {totalCount != null && totalCount > 0 && (
              <span className="ml-1.5 text-slate-400 font-normal">({totalCount})</span>
            )}
          </h2>
        </div>
        {(pagedEntries ?? []).length === 0 ? (
          <div className="p-10 text-center">
            <Clock className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No hay registros de horas en este proyecto.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {(pagedEntries ?? []).map((entry) => (
              <div key={entry.id} className="p-4 flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                  entry.status === 'approved' ? 'bg-green-500'
                  : entry.status === 'rejected' ? 'bg-red-400'
                  : 'bg-amber-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      {entry.user && (
                        <p className="text-xs font-medium text-violet-600">
                          {entry.user.full_name || entry.user.email}
                        </p>
                      )}
                      {entry.description && (
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{entry.description}</p>
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3">
          <span className="text-xs text-slate-500">
            Página {page} de {totalPages} · {totalCount} entradas
          </span>
          <div className="flex items-center gap-2">
            {page > 1 ? (
              <Link
                href={`/dashboard/projects/${id}?page=${page - 1}`}
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
                href={`/dashboard/projects/${id}?page=${page + 1}`}
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

function StatusBadge({ status }: { status: TimeEntry['status'] }) {
  const map: Record<string, { text: string; cls: string }> = {
    pending: { text: 'En aprobación', cls: 'bg-amber-50 text-amber-700' },
    approved: { text: 'OK', cls: 'bg-green-50 text-green-700' },
    rejected: { text: 'Rechazada', cls: 'bg-red-50 text-red-700' },
    needs_justification: { text: 'Requiere justificación', cls: 'bg-orange-50 text-orange-700' },
  }
  const s = map[status] ?? { text: status, cls: 'bg-slate-100 text-slate-600' }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.cls}`}>
      {s.text}
    </span>
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
    <div>
      <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
        <span className={
          budget.level === 'over' ? 'text-red-600 font-semibold'
          : budget.level === 'warning' ? 'text-amber-600 font-semibold'
          : 'text-slate-600'
        }>
          {fmt(budget.consumed)} consumido
        </span>
        <span className="text-slate-400">
          {fmt(budget.remaining)} restante · {budget.percent}%
        </span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${Math.min(budget.percent, 100)}%` }}
        />
      </div>
      <p className="text-xs text-slate-400 mt-1">Límite: {fmt(budget.limit)}</p>
    </div>
  )
}
