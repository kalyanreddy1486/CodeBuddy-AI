const API_BASE = import.meta.env.VITE_API_URL || ''

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE}/api/health`, { method: 'GET' })
    return res.ok
  } catch {
    return false
  }
}
