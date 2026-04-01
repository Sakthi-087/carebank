const storageKey = 'carebank.supabase.session'

function getSupabaseConfig() {
  const url = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '')
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

  if (!url || !anonKey) {
    throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in the frontend environment.')
  }

  return { url, anonKey }
}

function getHeaders(accessToken) {
  const { anonKey } = getSupabaseConfig()
  const headers = {
    apikey: anonKey,
    'Content-Type': 'application/json',
  }

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  return headers
}

function saveSession(session) {
  localStorage.setItem(storageKey, JSON.stringify(session))
}

function loadStoredSession() {
  const raw = localStorage.getItem(storageKey)
  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch {
    localStorage.removeItem(storageKey)
    return null
  }
}

export function clearSession() {
  localStorage.removeItem(storageKey)
}

async function fetchJson(url, options) {
  const response = await fetch(url, options)
  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    const error = new Error(
      payload.message ||
      payload.msg ||
      payload.error_description ||
      payload.error ||
      `Supabase request failed with status ${response.status}.`,
    )
    error.status = response.status
    throw error
  }

  return payload
}

async function fetchUser(accessToken) {
  const { url } = getSupabaseConfig()
  return fetchJson(`${url}/auth/v1/user`, {
    headers: getHeaders(accessToken),
  })
}

async function refreshSession(refreshToken) {
  const { url } = getSupabaseConfig()
  const payload = await fetchJson(`${url}/auth/v1/token?grant_type=refresh_token`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ refresh_token: refreshToken }),
  })

  const session = {
    access_token: payload.access_token,
    refresh_token: payload.refresh_token || refreshToken,
    user: payload.user,
  }
  saveSession(session)
  return session
}

async function upsertProfile(session) {
  if (!session?.access_token || !session?.user?.id) return

  const { url } = getSupabaseConfig()
  try {
    await fetchJson(`${url}/rest/v1/profiles`, {
      method: 'POST',
      headers: {
        ...getHeaders(session.access_token),
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify([
        {
          id: session.user.id,
          email: session.user.email,
        },
      ]),
    })
  } catch (error) {
    console.warn('Profile sync failed:', error)
  }
}

export async function restoreSession() {
  const stored = loadStoredSession()
  if (!stored?.access_token) {
    return { session: null, notice: '' }
  }

  try {
    const user = await fetchUser(stored.access_token)
    const session = { ...stored, user }
    saveSession(session)
    return { session, notice: '' }
  } catch (error) {
    if (!stored.refresh_token) {
      clearSession()
      return {
        session: null,
        notice: error?.status === 401 || error?.status === 403 ? 'Your previous session expired. Please sign in again.' : '',
      }
    }

    try {
      const session = await refreshSession(stored.refresh_token)
      await upsertProfile(session)
      return { session, notice: '' }
    } catch {
      clearSession()
      return {
        session: null,
        notice: 'Your session could not be restored. Please sign in again.',
      }
    }
  }
}

export async function signUp(email, password) {
  const { url } = getSupabaseConfig()
  const payload = await fetchJson(`${url}/auth/v1/signup`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ email, password }),
  })

  if (!payload.access_token) {
    return {
      session: null,
      message: 'Account created. You can sign in now.',
    }
  }

  const session = {
    access_token: payload.access_token,
    refresh_token: payload.refresh_token,
    user: payload.user,
  }

  saveSession(session)
  await upsertProfile(session)
  return { session, message: 'Account created successfully.' }
}

export async function signIn(email, password) {
  const { url } = getSupabaseConfig()
  const payload = await fetchJson(`${url}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ email, password }),
  })

  const session = {
    access_token: payload.access_token,
    refresh_token: payload.refresh_token,
    user: payload.user,
  }

  saveSession(session)
  await upsertProfile(session)
  return session
}

export async function signOut(session) {
  const { url } = getSupabaseConfig()

  if (session?.access_token) {
    try {
      await fetch(`${url}/auth/v1/logout`, {
        method: 'POST',
        headers: getHeaders(session.access_token),
      })
    } catch {
      // Local session cleanup is still enough for the app.
    }
  }

  clearSession()
}

export async function requestPasswordReset(email) {
  const { url } = getSupabaseConfig()
  if (!email.trim()) {
    throw new Error('Enter your email address before requesting a reset link.')
  }

  await fetchJson(`${url}/auth/v1/recover`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ email }),
  })

  return 'If the account exists, a password reset link has been sent.'
}
