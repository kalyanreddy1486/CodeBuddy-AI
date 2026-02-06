import { useState, useEffect } from 'react'
import { explainCode } from './api/explain'
import { checkBackendHealth } from './api/health'
import './App.css'

export default function App() {
  const [code, setCode] = useState('')
  const [result, setResult] = useState(null) // { summary, lineByLine }
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [backendOk, setBackendOk] = useState(null)
  const [activeTab, setActiveTab] = useState('summary') // 'summary' | 'lineByLine'

  useEffect(() => {
    checkBackendHealth().then(setBackendOk)
    const t = setInterval(() => checkBackendHealth().then(setBackendOk), 15000)
    return () => clearInterval(t)
  }, [])

  async function handleExplain() {
    const trimmed = code.trim()
    if (!trimmed) {
      setError('Please paste some code first.')
      return
    }
    setError('')
    setResult(null)
    setLoading(true)
    try {
      const data = await explainCode(trimmed, 'auto')
      setResult(data)
      setActiveTab('summary')
    } catch (err) {
      setError(err.message || 'Failed to get explanation.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Code Explainer</h1>
        <p>Paste code and get a line-by-line explanation. Language is detected automatically.</p>
        {backendOk === false && (
          <p className="backend-warning">
            Backend not running. Open a terminal, run: <code>cd backend</code> then <code>npm run dev</code>
          </p>
        )}
        {backendOk === true && (
          <p className="backend-ok">Backend connected</p>
        )}
      </header>

      <main className="main">
        <section className="input-section">
          <div className="code-wrap">
            <label htmlFor="code">Your code</label>
            <textarea
              id="code"
              className="code-input"
              placeholder="Paste your code here..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={14}
              spellCheck={false}
            />
          </div>
          <button
            type="button"
            className="btn-explain"
            onClick={handleExplain}
            disabled={loading}
          >
            {loading ? 'Explaining…' : 'Explain code'}
          </button>
          {error && <p className="error">{error}</p>}
        </section>

        <section className="output-section">
          <h2>Explanation</h2>
          {result ? (
            <div className="output-layout">
              <div className="output-main">
                <div className="tabs">
                  <button
                    type="button"
                    className={`tab ${activeTab === 'summary' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('summary')}
                  >
                    Code Summary
                  </button>
                  <button
                    type="button"
                    className={`tab ${activeTab === 'lineByLine' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('lineByLine')}
                  >
                    Line-by-Line
                  </button>
                </div>
                <div className="explanation-panel">
                  {activeTab === 'summary' && (
                    <div className="explanation">
                      <pre className="explanation-text">{result.summary}</pre>
                    </div>
                  )}
                  {activeTab === 'lineByLine' && (
                    <div className="explanation">
                      <pre className="explanation-text">{result.lineByLine}</pre>
                    </div>
                  )}
                </div>
              </div>
              {(result.timeComplexity || result.spaceComplexity) && (
                <aside className="complexity-side">
                  <h3 className="complexity-side-title">Complexity</h3>
                  {result.timeComplexity && (
                    <div className="complexity-item">
                      <span className="complexity-label">Time</span>
                      <span className="complexity-value">{result.timeComplexity}</span>
                    </div>
                  )}
                  {result.spaceComplexity && (
                    <div className="complexity-item">
                      <span className="complexity-label">Space</span>
                      <span className="complexity-value">{result.spaceComplexity}</span>
                    </div>
                  )}
                </aside>
              )}
            </div>
          ) : (
            <p className="placeholder">
              {loading ? 'Waiting for response…' : 'Explanation will appear here after you click "Explain code".'}
            </p>
          )}
        </section>
      </main>
    </div>
  )
}
