const RESEND_API = 'https://api.resend.com/emails'
const FROM = 'Emotiv Sync <noreply@emotiv.es>'

async function send(to: string, subject: string, html: string): Promise<void> {
  const key = process.env.RESEND_API_KEY
  if (!key) return // graceful no-op si no está configurado
  await fetch(RESEND_API, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM, to: [to], subject, html }),
  })
}

export async function notifyApproval(to: string, count: number, approved: boolean, reason?: string): Promise<void> {
  const subject = approved
    ? `✅ ${count} hora(s) aprobada(s) en Emotiv Sync`
    : `❌ ${count} hora(s) rechazada(s) en Emotiv Sync`
  const html = approved
    ? `<p>El administrador ha aprobado <strong>${count}</strong> entrada(s) de tiempo. Ya están listas para sincronizar con Zoho.</p>`
    : `<p>El administrador ha rechazado <strong>${count}</strong> entrada(s). Motivo: <em>${reason ?? 'No especificado'}</em></p>`
  await send(to, subject, html)
}

export async function notifyJustificationSubmitted(adminEmail: string, freelancerName: string, count: number): Promise<void> {
  await send(
    adminEmail,
    `🔔 ${freelancerName} ha enviado ${count} justificación(es) pendientes de aprobación`,
    `<p><strong>${freelancerName}</strong> ha enviado <strong>${count}</strong> justificación(es) de horas sobre presupuesto. Revísalas en la sección de Aprobaciones.</p>`
  )
}
