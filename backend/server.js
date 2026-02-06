import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { explainCode } from './gemini.js'

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json({ limit: '1mb' }))

app.post('/api/explain', async (req, res) => {
  try {
    const { code, language } = req.body
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid "code" in body.' })
    }
    const lang = language || 'JavaScript'
    const { summary, lineByLine, timeComplexity, spaceComplexity } = await explainCode(code.trim(), lang)
    res.json({ summary, lineByLine, timeComplexity, spaceComplexity })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message || 'Failed to explain code.' })
  }
})

app.get('/api/health', (_, res) => {
  res.json({ ok: true })
})

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`)
})
