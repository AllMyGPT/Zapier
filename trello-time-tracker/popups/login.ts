import { supabase } from '../src/supabase.js'

declare const TrelloPowerUp: {
  iframe: () => TrelloContext
}

interface TrelloContext {
  set: (scope: string, visibility: string, key: string, value: unknown) => Promise<void>
  closePopup: () => void
  sizeTo: (selector: string) => Promise<void>
}

const t: TrelloContext = TrelloPowerUp.iframe()

const form = document.getElementById('login-form') as HTMLFormElement
const emailInput = document.getElementById('email') as HTMLInputElement
const passwordInput = document.getElementById('password') as HTMLInputElement
const submitBtn = document.getElementById('submit-btn') as HTMLButtonElement
const errorMsg = document.getElementById('error-msg') as HTMLDivElement

function showError(message: string): void {
  errorMsg.textContent = message
  errorMsg.classList.add('visible')
}

function clearError(): void {
  errorMsg.textContent = ''
  errorMsg.classList.remove('visible')
}

function setLoading(loading: boolean): void {
  submitBtn.disabled = loading
  submitBtn.textContent = loading ? 'Iniciando sesión...' : 'Iniciar sesión'
  emailInput.disabled = loading
  passwordInput.disabled = loading
}

form.addEventListener('submit', async (e) => {
  e.preventDefault()
  clearError()

  const email = emailInput.value.trim()
  const password = passwordInput.value

  if (!email || !password) {
    showError('Por favor ingresa tu correo y contraseña.')
    return
  }

  setLoading(true)

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      showError(
        error.message === 'Invalid login credentials'
          ? 'Correo o contraseña incorrectos.'
          : `Error: ${error.message}`,
      )
      setLoading(false)
      return
    }

    if (!data.session) {
      showError('No se pudo crear la sesión. Intenta de nuevo.')
      setLoading(false)
      return
    }

    // Store session tokens in Trello private member storage
    await t.set('member', 'private', 'session', {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at,
    })

    // Close the popup — Trello will reload the card view
    t.closePopup()
  } catch (err) {
    console.error('Login error:', err)
    showError('Error inesperado. Verifica tu conexión e intenta de nuevo.')
    setLoading(false)
  }
})

// Resize the iframe to fit content
t.sizeTo('body').catch(console.error)
