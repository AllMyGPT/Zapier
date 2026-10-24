import {
  supabase,
  restoreSession,
  getCurrentUserId,
  getOrCreateProjectForCard,
  getActiveTimer,
  startTimer,
  stopTimer,
  createManualEntry,
  type StoredSession,
  type TimeEntry,
} from '../src/supabase.js'
import { formatElapsed, parseTimeInput, todayISO } from '../src/format.js'

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
  alert: (options: { message: string; duration?: number; display?: string }) => Promise<void>
}

const t: TrelloContext = TrelloPowerUp.iframe()

// DOM elements
const loadingState = document.getElementById('loading-state') as HTMLDivElement
const mainContent = document.getElementById('main-content') as HTMLDivElement
const activeTimerPanel = document.getElementById('active-timer-panel') as HTMLDivElement
const timerElapsed = document.getElementById('timer-elapsed') as HTMLDivElement
const timerDescElem = document.getElementById('timer-description') as HTMLDivElement
const timerDescInput = document.getElementById('timer-description-input') as HTMLTextAreaElement
const errorMsg = document.getElementById('error-msg') as HTMLDivElement
const successMsg = document.getElementById('success-msg') as HTMLDivElement
const btnStartTimer = document.getElementById('btn-start-timer') as HTMLButtonElement
const btnStopTimer = document.getElementById('btn-stop-timer') as HTMLButtonElement
const btnSaveManual = document.getElementById('btn-save-manual') as HTMLButtonElement
const manualHoursInput = document.getElementById('manual-hours') as HTMLInputElement
const manualDateInput = document.getElementById('manual-date') as HTMLInputElement
const manualDescInput = document.getElementById('manual-description') as HTMLTextAreaElement
const manualBillableInput = document.getElementById('manual-billable') as HTMLInputElement

// Tab switching
document.querySelectorAll<HTMLButtonElement>('.tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    const targetId = tab.dataset.tab!
    document.querySelectorAll('.tab').forEach((t2) => t2.classList.remove('active'))
    document.querySelectorAll('.tab-content').forEach((c) => c.classList.remove('active'))
    tab.classList.add('active')
    document.getElementById(targetId)?.classList.add('active')
    t.sizeTo('body').catch(console.error)
  })
})

function showError(msg: string): void {
  errorMsg.textContent = msg
  errorMsg.classList.add('visible')
  successMsg.classList.remove('visible')
}

function showSuccess(msg: string): void {
  successMsg.textContent = msg
  successMsg.classList.add('visible')
  errorMsg.classList.remove('visible')
}

function clearMessages(): void {
  errorMsg.classList.remove('visible')
  successMsg.classList.remove('visible')
}

// Interval for updating elapsed timer display
let elapsedInterval: ReturnType<typeof setInterval> | null = null

function startElapsedCounter(timerStartedAt: string): void {
  if (elapsedInterval) clearInterval(elapsedInterval)

  const update = (): void => {
    const seconds = (Date.now() - new Date(timerStartedAt).getTime()) / 1000
    timerElapsed.textContent = formatElapsed(seconds)
  }

  update()
  elapsedInterval = setInterval(update, 5000)
}

function stopElapsedCounter(): void {
  if (elapsedInterval) {
    clearInterval(elapsedInterval)
    elapsedInterval = null
  }
}

let currentUserId: string | null = null
let currentCardId: string = ''
let currentCardName: string = ''
let currentTimer: TimeEntry | null = null

async function init(): Promise<void> {
  // Check URL params
  const urlParams = new URLSearchParams(window.location.search)
  const mode = urlParams.get('mode')

  if (mode === 'manual') {
    // Switch to manual tab
    document.getElementById('tab-manual')?.click()
  }

  // Set default date for manual entry
  manualDateInput.value = todayISO()

  // Restore session
  const session = (await t.get('member', 'private', 'session', null)) as StoredSession | null

  if (!session?.access_token) {
    loadingState.textContent = 'Sesión no encontrada. Cierra este popup e inicia sesión primero.'
    return
  }

  const ok = await restoreSession(session)
  if (!ok) {
    await t.remove('member', 'private', 'session')
    loadingState.textContent = 'Sesión expirada. Cierra este popup e inicia sesión de nuevo.'
    return
  }

  // Refresh stored session
  const { data: { session: newSession } } = await supabase.auth.getSession()
  if (newSession) {
    await t.set('member', 'private', 'session', {
      access_token: newSession.access_token,
      refresh_token: newSession.refresh_token,
      expires_at: newSession.expires_at,
    })
  }

  currentUserId = await getCurrentUserId()
  if (!currentUserId) {
    loadingState.textContent = 'No se pudo obtener el usuario. Intenta de nuevo.'
    return
  }

  // Get card info
  const card = await t.card('id', 'name')
  currentCardId = card.id
  currentCardName = card.name

  // Check for active timer globally and on this card
  currentTimer = await getActiveTimer(currentUserId)

  // Check if active timer is for this card
  let timerIsHere = false
  if (currentTimer) {
    const { data: project } = await supabase
      .from('everhour_projects')
      .select('id')
      .eq('trello_card_id', currentCardId)
      .maybeSingle()

    if (project && project.id === currentTimer.everhour_project_id) {
      timerIsHere = true
    }
  }

  // Render UI
  loadingState.style.display = 'none'
  mainContent.style.display = 'block'

  if (timerIsHere && currentTimer) {
    // Show active timer panel for this card
    activeTimerPanel.style.display = 'block'
    timerDescElem.textContent = currentTimer.description
      ? `📝 ${currentTimer.description}`
      : 'Sin descripción'
    startElapsedCounter(currentTimer.timer_started_at!)

    // Show stop button, hide start button
    btnStartTimer.style.display = 'none'
    btnStopTimer.style.display = 'block'
  } else if (currentTimer) {
    // Timer running on another card — warn user
    timerElapsed.textContent = '⚠ Timer activo en otra tarjeta'
    activeTimerPanel.style.display = 'block'
    activeTimerPanel.style.borderColor = '#ff8f00'
    activeTimerPanel.style.background = '#fff7e6'
    timerElapsed.style.fontSize = '14px'
    timerElapsed.style.color = '#974f0c'

    const timerLabel = document.querySelector('.timer-label') as HTMLElement
    timerLabel.style.color = '#974f0c'
    timerLabel.textContent = '⚠ Timer en otra tarjeta'

    // Disable start timer (can't have two timers)
    btnStartTimer.disabled = true
    btnStartTimer.title = 'Detén el timer de la otra tarjeta primero'
  }

  await t.sizeTo('body').catch(console.error)
}

// Start timer
btnStartTimer.addEventListener('click', async () => {
  if (!currentUserId) return
  clearMessages()
  btnStartTimer.disabled = true
  btnStartTimer.textContent = 'Iniciando...'

  try {
    const project = await getOrCreateProjectForCard(currentCardId, currentCardName, currentUserId)
    if (!project) {
      showError('No se pudo crear el proyecto para esta tarjeta.')
      btnStartTimer.disabled = false
      btnStartTimer.textContent = '▶ Iniciar timer'
      return
    }

    const description = timerDescInput.value.trim() || undefined
    const timer = await startTimer(project.id, currentUserId, description)

    if (!timer) {
      showError('Error al iniciar el timer. Intenta de nuevo.')
      btnStartTimer.disabled = false
      btnStartTimer.textContent = '▶ Iniciar timer'
      return
    }

    currentTimer = timer

    // Update UI
    activeTimerPanel.style.display = 'block'
    timerDescElem.textContent = description ? `📝 ${description}` : 'Sin descripción'
    startElapsedCounter(timer.timer_started_at!)
    btnStartTimer.style.display = 'none'
    btnStopTimer.style.display = 'block'

    // Invalidate badge cache
    await t.set('card', 'shared', 'badge_cache', null)

    await t.sizeTo('body').catch(console.error)
  } catch (err) {
    console.error('Error starting timer:', err)
    showError('Error inesperado al iniciar el timer.')
    btnStartTimer.disabled = false
    btnStartTimer.textContent = '▶ Iniciar timer'
  }
})

// Stop timer
btnStopTimer.addEventListener('click', async () => {
  if (!currentTimer) return
  clearMessages()
  btnStopTimer.disabled = true
  btnStopTimer.textContent = 'Deteniendo...'

  try {
    const stopped = await stopTimer(currentTimer)

    if (!stopped) {
      showError('Error al detener el timer. Intenta de nuevo.')
      btnStopTimer.disabled = false
      btnStopTimer.textContent = '⏹ Detener timer'
      return
    }

    stopElapsedCounter()
    currentTimer = null

    // Update UI
    activeTimerPanel.style.display = 'none'
    btnStopTimer.style.display = 'none'
    btnStartTimer.style.display = 'block'
    btnStartTimer.disabled = false
    btnStartTimer.textContent = '▶ Iniciar timer'

    // Invalidate badge cache
    await t.set('card', 'shared', 'badge_cache', null)

    const hours = stopped.hours
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    const timeStr = h > 0 ? `${h}h ${m}m` : `${m}m`
    showSuccess(`✅ Timer detenido. Se registraron ${timeStr}.`)

    await t.sizeTo('body').catch(console.error)
  } catch (err) {
    console.error('Error stopping timer:', err)
    showError('Error inesperado al detener el timer.')
    btnStopTimer.disabled = false
    btnStopTimer.textContent = '⏹ Detener timer'
  }
})

// Save manual entry
btnSaveManual.addEventListener('click', async () => {
  if (!currentUserId) return
  clearMessages()

  const hoursRaw = manualHoursInput.value.trim()
  const hours = parseTimeInput(hoursRaw)

  if (!hours || hours <= 0) {
    showError('Ingresa un tiempo válido. Ej: 1:30, 1.5, 90m, 2h')
    manualHoursInput.focus()
    return
  }

  if (hours > 24) {
    showError('El tiempo no puede superar 24 horas.')
    return
  }

  const loggedDate = manualDateInput.value
  if (!loggedDate) {
    showError('Selecciona una fecha.')
    manualDateInput.focus()
    return
  }

  btnSaveManual.disabled = true
  btnSaveManual.textContent = 'Guardando...'

  try {
    const project = await getOrCreateProjectForCard(currentCardId, currentCardName, currentUserId)
    if (!project) {
      showError('No se pudo crear el proyecto para esta tarjeta.')
      btnSaveManual.disabled = false
      btnSaveManual.textContent = '💾 Guardar entrada'
      return
    }

    const description = manualDescInput.value.trim() || undefined
    const billable = manualBillableInput.checked

    const entry = await createManualEntry(project.id, currentUserId, hours, loggedDate, description, billable)

    if (!entry) {
      showError('Error al guardar la entrada. Intenta de nuevo.')
      btnSaveManual.disabled = false
      btnSaveManual.textContent = '💾 Guardar entrada'
      return
    }

    // Invalidate badge cache
    await t.set('card', 'shared', 'badge_cache', null)

    // Clear form
    manualHoursInput.value = ''
    manualDescInput.value = ''
    manualBillableInput.checked = false
    manualDateInput.value = todayISO()

    showSuccess('✅ Entrada guardada correctamente.')

    await t.sizeTo('body').catch(console.error)
  } catch (err) {
    console.error('Error saving manual entry:', err)
    showError('Error inesperado al guardar la entrada.')
  } finally {
    btnSaveManual.disabled = false
    btnSaveManual.textContent = '💾 Guardar entrada'
  }
})

// Initialize
init().catch((err) => {
  console.error('Timer popup init error:', err)
  loadingState.textContent = 'Error al cargar. Recarga e intenta de nuevo.'
})
