import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'

// ISR on-demand revalidation endpoint.
// Trigger from Supabase webhooks when landing page content is updated.
// POST /api/revalidate?secret=<REVALIDATION_SECRET>&slug=<slug>
export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')

  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
  }

  const slug = req.nextUrl.searchParams.get('slug')

  try {
    if (slug) {
      revalidatePath(`/${slug}`)
    } else {
      // Revalidate all landing pages and home
      revalidatePath('/', 'layout')
      revalidateTag('landing-pages')
    }

    return NextResponse.json({
      revalidated: true,
      slug: slug ?? 'all',
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error('Revalidation error:', err)
    return NextResponse.json({ error: 'Error al revalidar' }, { status: 500 })
  }
}
