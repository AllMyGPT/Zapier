import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import type { Lead } from '@/lib/supabase/types'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  let body: Partial<Lead>

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo de la solicitud inválido' }, { status: 400 })
  }

  const { email, name, landing_page_slug } = body

  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: 'Email inválido o no proporcionado' }, { status: 422 })
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    undefined

  const leadData: Lead = {
    landing_page_slug: landing_page_slug ?? null,
    email: email.toLowerCase().trim(),
    name: name?.trim(),
    phone: body.phone?.trim(),
    utm_source: body.utm_source ?? undefined,
    utm_medium: body.utm_medium ?? undefined,
    utm_campaign: body.utm_campaign ?? undefined,
    utm_term: body.utm_term ?? undefined,
    utm_content: body.utm_content ?? undefined,
    ip_address: ip,
    user_agent: req.headers.get('user-agent') ?? undefined,
    referrer: body.referrer ?? undefined,
  }

  try {
    const supabase = createServerClient()
    const { error } = await supabase.from('leads').insert(leadData)

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json(
        { error: 'Error al guardar el lead' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
