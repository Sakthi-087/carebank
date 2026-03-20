const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export async function fetchAnalysis() {
  const response = await fetch(`${API_BASE_URL}/analyze`)
  if (!response.ok) {
    throw new Error('Failed to load analysis')
  }
  return response.json()
}

export async function sendChat(message) {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  })

  if (!response.ok) {
    throw new Error('Failed to send message')
  }

  return response.json()
}
