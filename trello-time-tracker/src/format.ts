/**
 * Format elapsed seconds into human-readable string.
 * e.g. 45 → "45s", 3600 → "1h 00m", 5100 → "1h 25m"
 */
export function formatElapsed(seconds: number): string {
  if (seconds < 60) {
    return `${Math.floor(seconds)}s`
  }
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h === 0) {
    return `${m}m`
  }
  return `${h}h ${String(m).padStart(2, '0')}m`
}

/**
 * Format decimal hours into human-readable string.
 * e.g. 0.75 → "45m", 1.25 → "1h 15m"
 */
export function formatHours(hours: number): string {
  return formatElapsed(Math.round(hours * 3600))
}

/**
 * Format an ISO date string (YYYY-MM-DD) or Date object to locale date.
 */
export function formatDate(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.slice(0, 10).split('-').map(Number)
    const d = new Date(year, month - 1, day)
    return d.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

/**
 * Return today's date as YYYY-MM-DD.
 */
export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

/**
 * Parse an "HH:MM" or "H:MM" time string into decimal hours.
 * Returns null if invalid.
 */
export function parseTimeInput(input: string): number | null {
  const trimmed = input.trim()

  // Format: "1:30" → 1.5
  const colonMatch = trimmed.match(/^(\d+):(\d{2})$/)
  if (colonMatch) {
    const h = parseInt(colonMatch[1], 10)
    const m = parseInt(colonMatch[2], 10)
    if (m >= 60) return null
    return h + m / 60
  }

  // Format: "1.5" or "0.75"
  const decimalMatch = trimmed.match(/^(\d+(?:\.\d+)?)$/)
  if (decimalMatch) {
    const val = parseFloat(decimalMatch[1])
    if (isNaN(val) || val <= 0) return null
    return val
  }

  // Format: "90m" → 1.5
  const minuteMatch = trimmed.match(/^(\d+)m$/)
  if (minuteMatch) {
    return parseInt(minuteMatch[1], 10) / 60
  }

  // Format: "1h" → 1
  const hourMatch = trimmed.match(/^(\d+(?:\.\d+)?)h$/)
  if (hourMatch) {
    return parseFloat(hourMatch[1])
  }

  return null
}
