const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function apiRequest(path, { accessToken, ...options } = {}) {
  const headers = new Headers(options.headers || {})
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    let detail = 'Request failed'
    try {
      const payload = await response.json()
      detail = payload.detail || detail
    } catch {
      // Ignore JSON parsing errors and use the generic message.
    }
    const error = new Error(detail)
    error.status = response.status
    error.isAuthError = response.status === 401 || response.status === 403
    throw error
  }

  return response.json()
}

export function fetchAnalysis(accessToken) {
  return apiRequest('/analyze', { accessToken })
}

export function fetchFinancialScore(accessToken) {
  return apiRequest('/financial-score', { accessToken })
}

export function fetchFraudCheck(accessToken) {
  return apiRequest('/fraud-check', { accessToken })
}

export function sendChat(message, accessToken) {
  return apiRequest('/chat', {
    method: 'POST',
    accessToken,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  })
}

export function simulateDecision(payload, accessToken) {
  return apiRequest('/simulate', {
    method: 'POST',
    accessToken,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
}

export function fetchHealth() {
  return apiRequest('/health')
}

export function fetchPreferences(accessToken) {
  return apiRequest('/preferences', { accessToken })
}

export function savePreferences(preferences, accessToken) {
  return apiRequest('/preferences', {
    method: 'PUT',
    accessToken,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(preferences),
  })
}

export function uploadTransactionsCsv(file, accessToken) {
  const formData = new FormData()
  formData.append('file', file)

  return apiRequest('/transactions/upload-csv', {
    method: 'POST',
    accessToken,
    body: formData,
  })
}

export function createManualTransaction(payload, accessToken) {
  return apiRequest('/transactions/manual', {
    method: 'POST',
    accessToken,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
}
