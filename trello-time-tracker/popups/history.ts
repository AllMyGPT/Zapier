import {
  supabase,
  restoreSession,
  getCurrentUserId,
  getProjectTimeEntries,
  getUserProfiles,
  type StoredSession,
  type TimeEntry,
  type UserProfile,
} from '../src/supabase.js'
import { formatHours, formatDate, formatElapsed } from '../src/format.js'

declare const TrelloPowerUp: {
  iframe: () => TrelloContext
}

interface TrelloContext {
  card: (...fields: string[]) => Promise<{ id: string; name: string }>
  get: (scope: string, visibility: string, key: string, defaultValue?: unknown) => Promise<unknown>
  set: (scope: string, visibility: string, key: string, value: unknown) => Promise<void>
  remove: (scope: string, visibility: string, key: string) => Promise<void>
  closePopup: () => void
  sizeTo: (selector: string) => Promise<void>
}

const t: TrelloContext = TrelloPowerUp.iframe()

const loadingState = document.getElementById('loading-state') as HTMLDivElement
const mainContent = document.getElementById('main-content') as HTMLDivElement
const totalHoursElem = document.getElementById('total-hours') as HTMLSpanElement
const entriesContainer = document.getElementById('entries-container') as HTMLDivElement

function renderEntries(entries: TimeEntry[], profiles: Record<string, UserProfile>): void {
  if (entries.length === 0) {
    entriesContainer.innerHTML = `
      <div class="empty">
        Sin entradas de tiempo registradas para esta tarjeta.
      </div>
    `
    return
  }

  const ul = document.createElement('ul')
  ul.className = 'entry-list'

  for (const entry of entries) {
    const li = document.createElement('li')
    li.className = 'entry-item'

    const isRunning = entry.timer_started_at !== null
    const isTimerEntry = isRunning || (entry.hours === 0 && entry.description === null)
    const icon = isRunning ? '⏱' : (isTimerEntry ? '⏱' : '✏️')

    let hoursText: string
    if (isRunning && entry.timer_started_at) {
      const elapsed = (Date.now() - new Date(entry.timer_started_at).getTime()) / 1000
      hoursText = formatElapsed(elapsed)
    } else {
      hoursText = formatHours(entry.hours)
    }

    const profile = profiles[entry.user_id]
    const userName = profile?.full_name ?? profile?.email ?? 'Usuario'

    const badgeType = isTimerEntry ? 'badge-timer' : 'badge-manual'
    const badgeText = isTimerEntry ? 'Timer' : 'Manual'

    const badges = [
      `<span class="badge ${isRunning ? 'badge-running' : badgeType}">${isRunning ? '● En curso' : badgeText}</span>`,
      entry.billable ? '<span class="badge badge-billable">Facturable</span>' : '',
    ].filter(Boolean).join(' ')

    li.innerHTML = `
      <div class="entry-icon">${icon}</div>
      <div class="entry-body">
        <div class="entry-top">
          <span class="entry-hours">${hoursText}</span>
          <span class="entry-date">${formatDate(entry.logged_date)}</span>
        </div>
        ${entry.description ? `<div class="entry-desc">${escapeHtml(entry.description)}</div>` : ''}
        <div class="entry-meta">
          ${badges}
          <span class="entry-user">${escapeHtml(userName)}</span>
        </div>
      </div>
    `

    ul.appendChild(li)
  }

  entriesContainer.innerHTML = ''
  entriesContainer.appendChild(ul)
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

async function init(): Promise<void> {
  // Restore session
  const session = (await t.get('member', 'private', 'session', null)) as StoredSession | null

  if (!session?.access_token) {
    loadingState.textContent = 'Sesión no encontrada. Inicia sesión primero.'
    return
  }

  const ok = await restoreSession(session)
  if (!ok) {
    await t.remove('member', 'private', 'session')
    loadingState.textContent = 'Sesión expirada. Vuelve a iniciar sesión.'
    return
  }

  // Refresh session if needed
  const { data: { session: newSession } } = await supabase.auth.getSession()
  if (newSession) {
    await t.set('member', 'private', 'session', {
      access_token: newSession.access_token,
      refresh_token: newSession.refresh_token,
      expires_at: newSession.expires_at,
    })
  }

  const userId = await getCurrentUserId()
  if (!userId) {
    loadingState.textContent = 'No se pudo obtener el usuario.'
    return
  }

  const card = await t.card('id', 'name')

  // Find project for this card
  const { data: project } = await supabase
    .from('everhour_projects')
    .select('id')
    .eq('trello_card_id', card.id)
    .maybeSingle()

  if (!project) {
    loadingState.style.display = 'none'
    mainContent.style.display = 'block'
    totalHoursElem.textContent = '⏱ 0h'
    entriesContainer.innerHTML = `
      <div class="empty">
        Sin entradas de tiempo registradas para esta tarjeta.
      </div>
    `
    await t.sizeTo('body').catch(console.error)
    return
  }

  const entries = await getProjectTimeEntries(project.id)

  // Compute total hours (exclude running timer)
  const totalHours = entries
    .filter((e) => e.timer_started_at === null)
    .reduce((sum, e) => sum + (e.hours ?? 0), 0)

  // Get user profiles for all unique user IDs
  const uniqueUserIds = [...new Set(entries.map((e) => e.user_id))]
  const profiles = await getUserProfiles(uniqueUserIds)

  // Update UI
  loadingState.style.display = 'none'
  mainContent.style.display = 'block'

  totalHoursElem.textContent = `⏱ ${formatHours(totalHours)}`

  renderEntries(entries, profiles)

  await t.sizeTo('body').catch(console.error)
}

init().catch((err) => {
  console.error('History popup init error:', err)
  loadingState.textContent = 'Error al cargar el historial.'
})
