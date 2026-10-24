import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth, apiError } from '@/lib/api'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

function escapeCSV(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  // Wrap in quotes if the value contains commas, quotes, or newlines
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export async function GET(request: Request) {
  const supabase = await createClient()
  const user = await requireAuth(supabase)
  if (!user) return apiError('Unauthorized', 401)

  const { searchParams } = new URL(request.url)
  const from = searchParams.get('from') ?? ''
  const to = searchParams.get('to') ?? ''
  const status = searchParams.get('status') ?? undefined

  if (!DATE_RE.test(from) || !DATE_RE.test(to)) {
    return apiError('Parámetros from y to requeridos (formato YYYY-MM-DD)', 400)
  }

  // Determine if user is admin to decide data scope
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  let query = supabase
    .from('everhour_time_entries')
    .select(`
      logged_date,
      description,
      hours,
      billable,
      status,
      project:everhour_projects(name),
      userProfile:user_profiles(full_name, email)
    `)
    .gte('logged_date', from)
    .lte('logged_date', to)
    .order('logged_date', { ascending: true })

  // Freelancers only see their own entries
  if (!isAdmin) {
    query = query.eq('user_id', user.id)
  }

  if (status) {
    query = query.eq('status', status)
  }

  const { data: entries, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Build CSV
  const headers = ['Date', 'Project', 'Description', 'Hours', 'Billable', 'Status', 'User']
  const rows = (entries ?? []).map(entry => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const proj = (entry as any).project
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const usr = (entry as any).userProfile
    return [
      escapeCSV(entry.logged_date),
      escapeCSV(proj?.name ?? ''),
      escapeCSV(entry.description ?? ''),
      escapeCSV(entry.hours),
      escapeCSV(entry.billable ? 'Sí' : 'No'),
      escapeCSV(entry.status),
      escapeCSV(usr?.full_name ?? usr?.email ?? ''),
    ].join(',')
  })

  const csv = [headers.join(','), ...rows].join('\n')
  const filename = `horas-${new Date().toISOString().split('T')[0]}.csv`

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
