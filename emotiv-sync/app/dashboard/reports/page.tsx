import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatHours } from '@/lib/utils'
import { formatMoney } from '@/lib/budgets'
import { TrendingUp, TrendingDown, PieChart, Users } from 'lucide-react'
import DatePresets from '@/components/features/reports/DatePresets'

interface Row {
  label: string
  sub?: string
  hours: number
  billableHours: number
  revenue: number
  cost: number
  profit: number
  capacityHours?: number
}

function weekdaysBetween(from: Date, to: Date): number {
  let count = 0
  const d = new Date(from)
  while (d <= to) {
    const day = d.getDay()
    if (day !== 0 && day !== 6) count++
    d.setDate(d.getDate() + 1)
  }
  return count
}

export default async function ReportsPage({
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

  if (profile?.role !== 'admin') redirect('/dashboard')

  const params = await searchParams
  const today = new Date()
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const from = params.from ?? firstOfMonth.toISOString().split('T')[0]
  const to = params.to ?? today.toISOString().split('T')[0]

  // Compute preset date ranges server-side
  const thisMonthFrom = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
  const thisMonthTo = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0]
  const prevMonthFrom = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString().split('T')[0]
  const prevMonthTo = new Date(today.getFullYear(), today.getMonth(), 0).toISOString().split('T')[0]
  const quarterMonth = Math.floor(today.getMonth() / 3) * 3
  const thisQuarterFrom = new Date(today.getFullYear(), quarterMonth, 1).toISOString().split('T')[0]
  const thisQuarterTo = new Date(today.getFullYear(), quarterMonth + 3, 0).toISOString().split('T')[0]
  const thisYearFrom = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0]
  const thisYearTo = new Date(today.getFullYear(), 11, 31).toISOString().split('T')[0]

  const { data: entries } = await supabase
    .from('everhour_time_entries')
    .select(`
      hours, billable, user_id,
      project:everhour_projects(name, client_name, hourly_rate, cost_rate),
      user:user_profiles(full_name, email, cost_rate, weekly_capacity_hours)
    `)
    .eq('status', 'approved')
    .gte('logged_date', from)
    .lte('logged_date', to)

  type EntryRow = {
    hours: number
    billable: boolean
    user_id: string
    project: { name: string; client_name: string | null; hourly_rate: number | null; cost_rate: number | null } | null
    user: { full_name: string | null; email: string; cost_rate: number | null; weekly_capacity_hours: number | null } | null
  }

  const rows = (entries ?? []) as unknown as EntryRow[]

  // --- Totals ---
  let totalHours = 0
  let billableHours = 0
  let revenue = 0
  let cost = 0

  const byProject = new Map<string, Row>()
  const byClient = new Map<string, Row>()
  const byUser = new Map<string, Row>()

  for (const e of rows) {
    const billRate = e.project?.hourly_rate ?? 0
    const costRate = e.project?.cost_rate ?? e.user?.cost_rate ?? 0
    const entryRevenue = e.billable ? e.hours * billRate : 0
    const entryCost = e.hours * costRate

    totalHours += e.hours
    if (e.billable) billableHours += e.hours
    revenue += entryRevenue
    cost += entryCost

    const pName = e.project?.name ?? 'Sin proyecto'
    const cName = e.project?.client_name ?? 'Sin cliente'
    const uName = e.user?.full_name || e.user?.email || 'Desconocido'

    for (const [map, key, label] of [
      [byProject, pName, pName],
      [byClient, cName, cName],
      [byUser, e.user_id, uName],
    ] as [Map<string, Row>, string, string][]) {
      const r = map.get(key) ?? {
        label,
        hours: 0,
        billableHours: 0,
        revenue: 0,
        cost: 0,
        profit: 0,
      }
      r.hours += e.hours
      if (e.billable) r.billableHours += e.hours
      r.revenue += entryRevenue
      r.cost += entryCost
      r.profit = r.revenue - r.cost
      map.set(key, r)
    }
  }

  // Add capacity to user rows for utilization
  const weekdays = weekdaysBetween(new Date(from), new Date(to))
  for (const e of rows) {
    const r = byUser.get(e.user_id)
    if (r && r.capacityHours === undefined) {
      const weekly = e.user?.weekly_capacity_hours ?? 40
      r.capacityHours = Math.round((weekly / 5) * weekdays * 10) / 10
    }
  }

  const profit = revenue - cost
  const margin = revenue > 0 ? Math.round((profit / revenue) * 100) : 0
  const billablePercent = totalHours > 0 ? Math.round((billableHours / totalHours) * 100) : 0

  const projectRows = Array.from(byProject.values()).sort((a, b) => b.profit - a.profit)
  const clientRows = Array.from(byClient.values()).sort((a, b) => b.revenue - a.revenue)
  const userRows = Array.from(byUser.values()).sort((a, b) => b.hours - a.hours)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Informes</h1>
        <p className="text-sm text-slate-500 mt-0.5">Rentabilidad y utilización del equipo (solo horas aprobadas)</p>
      </div>

      {/* Date presets */}
      <DatePresets
        thisMonthFrom={thisMonthFrom}
        thisMonthTo={thisMonthTo}
        prevMonthFrom={prevMonthFrom}
        prevMonthTo={prevMonthTo}
        thisQuarterFrom={thisQuarterFrom}
        thisQuarterTo={thisQuarterTo}
        thisYearFrom={thisYearFrom}
        thisYearTo={thisYearTo}
      />

      {/* Date filter */}
      <form className="bg-white rounded-xl border border-slate-100 shadow-sm p-3 flex items-center gap-2">
        <div className="flex-1">
          <label className="text-xs text-slate-500">Desde</label>
          <input type="date" name="from" defaultValue={from}
            className="block w-full text-sm text-slate-800 border-none outline-none" />
        </div>
        <div className="w-px h-8 bg-slate-200" />
        <div className="flex-1">
          <label className="text-xs text-slate-500">Hasta</label>
          <input type="date" name="to" defaultValue={to}
            className="block w-full text-sm text-slate-800 border-none outline-none" />
        </div>
        <button type="submit" className="px-3 py-2 bg-violet-600 text-white rounded-lg text-xs font-medium">
          Filtrar
        </button>
      </form>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3">
        <Kpi label="Ingresos" value={formatMoney(revenue)} icon={TrendingUp} color="text-green-600" bg="bg-green-50" />
        <Kpi label="Coste" value={formatMoney(cost)} icon={TrendingDown} color="text-red-600" bg="bg-red-50" />
        <Kpi
          label={`Beneficio (${margin}%)`}
          value={formatMoney(profit)}
          icon={PieChart}
          color={profit >= 0 ? 'text-violet-600' : 'text-red-600'}
          bg={profit >= 0 ? 'bg-violet-50' : 'bg-red-50'}
        />
        <Kpi
          label={`Facturable (${billablePercent}%)`}
          value={formatHours(billableHours)}
          icon={Users}
          color="text-blue-600"
          bg="bg-blue-50"
        />
      </div>

      {/* Billable split bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
        <h2 className="font-semibold text-slate-800 text-sm mb-3">
          Facturable vs no facturable
        </h2>
        <div className="h-3 rounded-full overflow-hidden flex bg-slate-100">
          <div className="bg-violet-500 h-full" style={{ width: `${billablePercent}%` }} />
          <div className="bg-slate-300 h-full" style={{ width: `${100 - billablePercent}%` }} />
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
          <span>Facturable: {formatHours(billableHours)}</span>
          <span>No facturable: {formatHours(totalHours - billableHours)}</span>
        </div>
      </div>

      {/* By client */}
      <ReportTable title="Por cliente" rows={clientRows} showMoney />
      {/* By project */}
      <ReportTable title="Por proyecto" rows={projectRows} showMoney />
      {/* By user (utilization) */}
      <UserTable rows={userRows} />
    </div>
  )
}

function Kpi({
  label, value, icon: Icon, color, bg,
}: {
  label: string; value: string
  icon: React.ComponentType<{ className?: string }>; color: string; bg: string
}) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
      <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-3`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <p className="text-lg font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  )
}

function ReportTable({ title, rows, showMoney }: { title: string; rows: Row[]; showMoney?: boolean }) {
  const max = Math.max(1, ...rows.map((r) => r.hours))
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-4 border-b border-slate-50">
        <h2 className="font-semibold text-slate-800 text-sm">{title}</h2>
      </div>
      <div className="divide-y divide-slate-50">
        {rows.length === 0 ? (
          <p className="p-6 text-center text-sm text-slate-400">Sin datos en el período</p>
        ) : (
          rows.map((r) => {
            const margin = r.revenue > 0 ? Math.round((r.profit / r.revenue) * 100) : 0
            return (
              <div key={r.label} className="p-4">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <p className="text-sm font-medium text-slate-800 truncate">{r.label}</p>
                  <span className="text-sm font-semibold text-slate-900 flex-shrink-0">
                    {formatHours(r.hours)}
                  </span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1.5">
                  <div className="h-full bg-violet-500 rounded-full" style={{ width: `${(r.hours / max) * 100}%` }} />
                </div>
                {showMoney && (
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="text-green-600">{formatMoney(r.revenue)}</span>
                    <span className="text-red-500">−{formatMoney(r.cost)}</span>
                    <span className={`font-semibold ${r.profit >= 0 ? 'text-violet-600' : 'text-red-600'}`}>
                      {formatMoney(r.profit)} ({margin}%)
                    </span>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

function UserTable({ rows }: { rows: Row[] }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-4 border-b border-slate-50">
        <h2 className="font-semibold text-slate-800 text-sm">Utilización por persona</h2>
      </div>
      <div className="divide-y divide-slate-50">
        {rows.length === 0 ? (
          <p className="p-6 text-center text-sm text-slate-400">Sin datos en el período</p>
        ) : (
          rows.map((r) => {
            const cap = r.capacityHours ?? 0
            const util = cap > 0 ? Math.round((r.hours / cap) * 100) : 0
            const billPct = r.hours > 0 ? Math.round((r.billableHours / r.hours) * 100) : 0
            const barColor = util > 100 ? 'bg-red-500' : util >= 80 ? 'bg-green-500' : 'bg-amber-400'
            return (
              <div key={r.label} className="p-4">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <p className="text-sm font-medium text-slate-800 truncate">{r.label}</p>
                  <span className="text-sm font-semibold text-slate-900 flex-shrink-0">{util}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1.5">
                  <div className={`h-full rounded-full ${barColor}`} style={{ width: `${Math.min(util, 100)}%` }} />
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>{formatHours(r.hours)} / {formatHours(cap)}</span>
                  <span className="text-violet-600">{billPct}% facturable</span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
