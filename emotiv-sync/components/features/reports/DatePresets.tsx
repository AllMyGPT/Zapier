'use client'

import { useRouter } from 'next/navigation'

interface DatePresetsProps {
  thisMonthFrom: string
  thisMonthTo: string
  prevMonthFrom: string
  prevMonthTo: string
  thisQuarterFrom: string
  thisQuarterTo: string
  thisYearFrom: string
  thisYearTo: string
}

export default function DatePresets({
  thisMonthFrom,
  thisMonthTo,
  prevMonthFrom,
  prevMonthTo,
  thisQuarterFrom,
  thisQuarterTo,
  thisYearFrom,
  thisYearTo,
}: DatePresetsProps) {
  const router = useRouter()

  function go(from: string, to: string) {
    router.push(`/dashboard/reports?from=${from}&to=${to}`)
  }

  const presets = [
    { label: 'Este mes', from: thisMonthFrom, to: thisMonthTo },
    { label: 'Mes anterior', from: prevMonthFrom, to: prevMonthTo },
    { label: 'Este trimestre', from: thisQuarterFrom, to: thisQuarterTo },
    { label: 'Este año', from: thisYearFrom, to: thisYearTo },
  ]

  return (
    <div className="flex flex-wrap gap-2">
      {presets.map((p) => (
        <button
          key={p.label}
          onClick={() => go(p.from, p.to)}
          className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-violet-50 hover:border-violet-300 hover:text-violet-700 transition-colors"
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}
