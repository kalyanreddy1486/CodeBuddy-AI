const API_BASE = import.meta.env.VITE_API_URL || ''

/**
 * Call backend to explain code.
 * @param {string} code - Raw code string
 * @param {string} language - e.g. "JavaScript", "Python"
 * @returns {Promise<{ summary: string, lineByLine: string }>}
 */
export async function explainCode(code, language) {
  let res
  try {
    res = await fetch(`${API_BASE}/api/explain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, language }),
    })
  } catch (err) {
    throw new Error('Could not reach the backend. Make sure the backend is running (in backend folder: npm run dev).')
  }
  const text = await res.text()
  let data
  try {
    data = text ? JSON.parse(text) : {}
  } catch {
    throw new Error('Could not reach the backend. Make sure the backend is running (in backend folder: npm run dev).')
  }
  if (!res.ok) {
    throw new Error(data.error || `Request failed: ${res.status}`)
  }
  return {
    summary: data.summary ?? '',
    lineByLine: data.lineByLine ?? '',
    timeComplexity: data.timeComplexity ?? null,
    spaceComplexity: data.spaceComplexity ?? null,
  }
}
