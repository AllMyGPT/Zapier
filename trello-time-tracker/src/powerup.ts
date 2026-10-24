import {
  supabase,
  restoreSession,
  getCurrentUserId,
  getActiveTimer,
  getProjectTotalHours,
  type StoredSession,
} from './supabase.js'
import { formatHours, formatElapsed } from './format.js'

// Trello Power-Up client is loaded via CDN script in index.html
declare const TrelloPowerUp: {
  initialize: (capabilities: Record<string, unknown>, options?: unknown) => void
}

// Trello context type (simplified)
interface TrelloContext {
  card: (...fields: string[]) => Promise<{ id: string; name: string }>
  get: (scope: string, visibility: string, key: string, defaultValue?: unknown) => Promise<unknown>
  set: (scope: string, visibility: string, key: string, value: unknown) => Promise<void>
  remove: (scope: string, visibility: string, key: string) => Promise<void>
  popup: (options: {
    title: string
    url: string
    height?: number
    width?: number
    mouseEvent?: MouseEvent
  }) => Promise<void>
  closePopup: () => void
  signUrl: (url: string, args?: Record<string, string>) => string
  sizeTo: (target: string | HTMLElement) => Promise<void>
  alert: (options: { message: string; duration?: number; display?: string }) => Promise<void>
  hideAlert: () => void
}

/**
 * Attempt to restore Supabase session from Power-Up storage.
 * Returns the user ID if successful, null otherwise.
 */
async function ensureAuth(t: TrelloContext): Promise<string | null> {
  const session = (await t.get('member', 'private', 'session', null)) as StoredSession | null

  if (!session?.access_token) return null

  const ok = await restoreSession(session)
  if (!ok) {
    // Clear invalid session
    await t.remove('member', 'private', 'session')
    return null
  }

  // Refresh stored session with new tokens if available
  const { data: { session: newSession } } = await supabase.auth.getSession()
  if (newSession) {
    await t.set('member', 'private', 'session', {
      access_token: newSession.access_token,
      refresh_token: newSession.refresh_token,
      expires_at: newSession.expires_at,
    })
  }

  return getCurrentUserId()
}

/**
 * Open the login popup.
 */
function openLoginPopup(t: TrelloContext): Promise<void> {
  return t.popup({
    title: 'Iniciar sesión',
    url: './popups/login.html',
    height: 280,
  })
}

TrelloPowerUp.initialize({
  /**
   * Card buttons shown in the card back.
   */
  'card-buttons': async (t: TrelloContext) => {
    const userId = await ensureAuth(t)

    if (!userId) {
      return [
        {
          icon: '',
          text: '🔑 Iniciar sesión',
          callback: (t: TrelloContext) => openLoginPopup(t),
        },
      ]
    }

    const activeTimer = await getActiveTimer(userId)

    const buttons: unknown[] = []

    if (activeTimer) {
      buttons.push({
        icon: '',
        text: '⏹ Parar timer',
        callback: (t: TrelloContext) =>
          t.popup({
            title: 'Timer activo',
            url: './popups/timer.html',
            height: 320,
          }),
      })
    } else {
      buttons.push({
        icon: '',
        text: '⏱ Iniciar timer',
        callback: (t: TrelloContext) =>
          t.popup({
            title: 'Iniciar timer',
            url: './popups/timer.html',
            height: 320,
          }),
      })
    }

    buttons.push(
      {
        icon: '',
        text: '➕ Tiempo manual',
        callback: (t: TrelloContext) =>
          t.popup({
            title: 'Agregar tiempo',
            url: './popups/timer.html?mode=manual',
            height: 360,
          }),
      },
      {
        icon: '',
        text: '📋 Historial',
        callback: (t: TrelloContext) =>
          t.popup({
            title: 'Historial de tiempo',
            url: './popups/history.html',
            height: 400,
          }),
      },
    )

    return buttons
  },

  /**
   * Card badges shown in card list view.
   */
  'card-badges': async (t: TrelloContext) => {
    const userId = await ensureAuth(t)
    if (!userId) return []

    const card = await t.card('id')

    // Check cache first for speed
    const cached = (await t.get('card', 'shared', 'badge_cache', null)) as {
      totalHours: number
      hasTimer: boolean
      timerStart: string | null
      cachedAt: number
    } | null

    const now = Date.now()
    const CACHE_TTL = 30_000 // 30 seconds

    let totalHours: number
    let hasTimer: boolean
    let timerStart: string | null

    if (cached && now - cached.cachedAt < CACHE_TTL) {
      totalHours = cached.totalHours
      hasTimer = cached.hasTimer
      timerStart = cached.timerStart
    } else {
      // Check for active timer on this card
      const activeTimer = await getActiveTimer(userId)
      let timerOnThisCard = false

      if (activeTimer) {
        // Get project for this card to check if timer belongs here
        const { data: project } = await supabase
          .from('everhour_projects')
          .select('id')
          .eq('trello_card_id', card.id)
          .maybeSingle()

        if (project && project.id === activeTimer.everhour_project_id) {
          timerOnThisCard = true
        }
      }

      hasTimer = timerOnThisCard
      timerStart = timerOnThisCard && activeTimer ? activeTimer.timer_started_at : null

      // Get project + total hours
      const { data: project } = await supabase
        .from('everhour_projects')
        .select('id')
        .eq('trello_card_id', card.id)
        .maybeSingle()

      totalHours = project ? await getProjectTotalHours(project.id) : 0

      // Store cache
      await t.set('card', 'shared', 'badge_cache', {
        totalHours,
        hasTimer,
        timerStart,
        cachedAt: now,
      })
    }

    const badges: unknown[] = []

    if (hasTimer && timerStart) {
      const elapsedSeconds = (Date.now() - new Date(timerStart).getTime()) / 1000
      badges.push({
        text: `⏱ ${formatElapsed(elapsedSeconds)}`,
        color: 'red',
        refresh: 30,
      })
    } else if (totalHours > 0) {
      badges.push({
        text: `⏱ ${formatHours(totalHours)}`,
        color: 'blue',
      })
    }

    return badges
  },

  /**
   * Card detail badges shown in card back.
   */
  'card-detail-badges': async (t: TrelloContext) => {
    const userId = await ensureAuth(t)
    if (!userId) return []

    const card = await t.card('id')

    const { data: project } = await supabase
      .from('everhour_projects')
      .select('id')
      .eq('trello_card_id', card.id)
      .maybeSingle()

    if (!project) return []

    const totalHours = await getProjectTotalHours(project.id)
    const activeTimer = await getActiveTimer(userId)

    let timerOnThisCard = false
    if (activeTimer && activeTimer.everhour_project_id === project.id) {
      timerOnThisCard = true
    }

    const badges: unknown[] = []

    if (timerOnThisCard && activeTimer?.timer_started_at) {
      const elapsedSeconds = (Date.now() - new Date(activeTimer.timer_started_at).getTime()) / 1000
      badges.push({
        title: 'Timer',
        text: `⏱ ${formatElapsed(elapsedSeconds)} (en curso)`,
        color: 'red',
      })
    }

    badges.push({
      title: 'Tiempo total',
      text: totalHours > 0 ? formatHours(totalHours) : '—',
      color: totalHours > 0 ? 'blue' : undefined,
    })

    return badges
  },

  /**
   * Card back section showing recent time entries.
   */
  'card-back-section': async (t: TrelloContext) => {
    return {
      title: 'Registro de Tiempo',
      content: {
        type: 'iframe',
        url: t.signUrl('./popups/history.html', { mode: 'section' }),
        height: 200,
      },
    }
  },
})
