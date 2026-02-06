import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = process.env.GEMINI_API_KEY

if (!apiKey) {
  console.warn('GEMINI_API_KEY is not set. Add it to backend/.env')
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

/**
 * Ask Gemini to explain the given code: summary (overview, inputs, outputs) + line-by-line.
 * @param {string} code - Raw code string
 * @param {string} language - e.g. "JavaScript", "Python"
 * @returns {Promise<{ summary: string, lineByLine: string, timeComplexity?: string, spaceComplexity?: string }>}
 */
export async function explainCode(code, language) {
  if (!genAI) {
    throw new Error('API key not configured. Add GEMINI_API_KEY to backend/.env')
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' })

  const CODE_SUMMARY_LABEL = '---CODE SUMMARY---'
  const COMPLEXITY_LABEL = '---COMPLEXITY---'
  const LINE_BY_LINE_LABEL = '---LINE BY LINE---'

  const prompt = `
You are a friendly, experienced developer explaining code to a colleague.
Write like a human: clear, conversational, and helpful.
Avoid robotic or overly formal language.
Use "you" and "we" where it feels natural.
Prefer simple words and short sentences when they make things clearer.

Explain intent and reasoning, not just syntax. When useful, explain *why* the code is written this way, not only *what* it does.

The user will paste a code snippet.
Detect the ACTUAL programming language from the code's syntax (Java, Python, JavaScript, C++, etc.).
Explain everything strictly in that language's context.
Use correct terms (e.g., "method" for Java, "function" for Python/JS).

Your response must have exactly three sections.
Use these exact labels on their own line (one label per line):

${CODE_SUMMARY_LABEL}

- Start with one short sentence: "This is [detected language] code."
- Explain what the code does in 2–4 sentences, in plain language.
- Explain the core idea or pattern being used.
- List inputs (parameters, data structures, user input).
- List outputs (return value, side effects).
Do NOT repeat time/space complexity here; put them only in the next section.

Be concise, friendly, and human.

---COMPLEXITY---

On the next two lines only, write exactly:
Time: O(...) — one short reason
Space: O(...) — one short reason
Use Big O notation (e.g. O(1), O(n), O(n²), O(log n)). If trivial or not applicable, use O(1) and say "constant" or "negligible".

${LINE_BY_LINE_LABEL}

Explain the code line by line or in logical groups.
Group lines when it makes sense.
Skip blank lines or mention them briefly.
For each group, explain what it means and why it exists, as if talking to a teammate reviewing the code.
Avoid repeating obvious syntax explanations unless they help understanding.

Code to explain:

\`\`\`
${code}
\`\`\`
`

  const result = await model.generateContent(prompt)
  const response = result.response
  if (!response.text) {
    throw new Error('No explanation returned from the API.')
  }

  let text = response.text().trim()
  if (text.startsWith('```')) {
    text = text.replace(/^```\s*/i, '').replace(/```\s*$/, '').trim()
  }

  // Parse by section labels
  const complexityIndex = text.indexOf(COMPLEXITY_LABEL)
  const lineByLineIndex = text.indexOf(LINE_BY_LINE_LABEL)
  let summary = ''
  let lineByLine = ''
  let timeComplexity = ''
  let spaceComplexity = ''

  // Extract summary (before COMPLEXITY or LINE BY LINE)
  const summaryEnd = complexityIndex !== -1 ? complexityIndex : lineByLineIndex
  if (summaryEnd !== -1) {
    summary = text.slice(0, summaryEnd).trim()
    summary = summary.replace(new RegExp(`^${CODE_SUMMARY_LABEL}\\s*`, 'i'), '').trim() || summary
  }

  // Extract time/space from ---COMPLEXITY--- block (between COMPLEXITY and LINE BY LINE)
  if (complexityIndex !== -1 && lineByLineIndex > complexityIndex) {
    const complexityBlock = text.slice(complexityIndex + COMPLEXITY_LABEL.length, lineByLineIndex).trim()
    const lines = complexityBlock.split('\n').map((s) => s.trim()).filter(Boolean)
    for (const line of lines) {
      if (/^Time\s*:/i.test(line)) {
        timeComplexity = line.replace(/^Time\s*:\s*/i, '').trim()
      } else if (/^Space\s*:/i.test(line)) {
        spaceComplexity = line.replace(/^Space\s*:\s*/i, '').trim()
      }
    }
  }

  // Extract line-by-line
  if (lineByLineIndex !== -1) {
    lineByLine = text.slice(lineByLineIndex + LINE_BY_LINE_LABEL.length).trim()
  } else {
    lineByLine = 'Line-by-line section was not found. See Code Summary for the full explanation.'
  }

  return {
    summary: summary || 'No summary.',
    lineByLine: lineByLine || 'No line-by-line explanation.',
    timeComplexity: timeComplexity || null,
    spaceComplexity: spaceComplexity || null,
  }
}
