import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type TaskHelperRequest = {
  prompt: string
  context?: {
    priority?: string | null
    tags?: string[] | null
    due_date?: string | null
  }
}

type TaskHelperResponse = {
  title: string
  description: string
}

function safeJsonExtract(text: string): unknown {
  // Extract the first JSON object in the response.
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) return null
  try {
    return JSON.parse(match[0])
  } catch {
    return null
  }
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await request.json().catch(() => null)) as
    | TaskHelperRequest
    | null

  const prompt = body?.prompt?.trim()
  if (!prompt) {
    return NextResponse.json(
      { error: 'Missing prompt' },
      { status: 400 }
    )
  }

  const geminiApiKey = process.env.GEMINI_API_KEY
  if (!geminiApiKey) {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY is not set on the server' },
      { status: 500 }
    )
  }

  const context = body?.context ?? {}

  const contextLine = [
    context.priority ? `Priority: ${context.priority}` : null,
    context.tags?.length ? `Tags: ${context.tags.join(', ')}` : null,
    context.due_date ? `Due date: ${context.due_date}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  const systemInstruction =
    'You are a productivity assistant. Generate a concise task title and a clear task description. Return ONLY valid JSON. The response MUST start with "{" and MUST end with "}". Output keys must be exactly "title" and "description". No markdown, no code fences, no extra text.'

  const userText = [
    systemInstruction,
    contextLine ? `Context:\n${contextLine}` : null,
    `Task idea:\n${prompt}`,
    'Title must be short (max ~10 words). Description must be 1-3 sentences, actionable.',
  ]
    .filter(Boolean)
    .join('\n\n')

  // Model must exist for your API key + endpoint.
  // We use a known-working model for the provided key.
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${encodeURIComponent(
    geminiApiKey
  )}`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // Gemini response is not guaranteed to be strict JSON, so we parse safely.
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: userText }] }],
      generationConfig: {
        temperature: 0.35,
        maxOutputTokens: 400,
      },
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    return NextResponse.json(
      { error: `Gemini error: ${text || res.statusText}` },
      { status: 500 }
    )
  }

  const data = await res.json().catch(() => null)
  const parts = data?.candidates?.[0]?.content?.parts as
    | Array<{ text?: unknown }>
    | undefined

  // Gemini responses can arrive in multiple `parts`. We must concatenate them all,
  // otherwise JSON extraction can fail when the first part is only a preamble.
  const candidateText: string = Array.isArray(parts)
    ? parts
        .map((p) => (typeof p?.text === 'string' ? p.text : ''))
        .filter(Boolean)
        .join('')
    : ''

  const extracted = candidateText ? safeJsonExtract(candidateText) : null

  // Extra fallback: if the whole response is already a JSON object, try parsing directly.
  let extractedFallback: unknown = null
  if (!extracted && typeof candidateText === 'string') {
    const trimmed = candidateText.trim()
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        extractedFallback = JSON.parse(trimmed)
      } catch {
        extractedFallback = null
      }
    }
  }

  const extractedObj = (extracted ?? extractedFallback) as
    | { title?: unknown; description?: unknown }
    | null

  const title =
    extractedObj && typeof extractedObj.title === 'string'
      ? extractedObj.title
      : null
  const description =
    extractedObj && typeof extractedObj.description === 'string'
      ? extractedObj.description
      : null

  if (!title || !description) {
    const snippet = (candidateText ?? '').slice(0, 300)
    console.error('[gemini task-helper] failed to parse title/description', {
      snippet,
      extracted: extractedObj,
    })
    return NextResponse.json(
      {
        error: `Failed to generate a valid title/description. Gemini response snippet: ${snippet}`,
      },
      { status: 500 }
    )
  }

  const out: TaskHelperResponse = {
    title: title.trim(),
    description: description.trim(),
  }

  return NextResponse.json(out)
}

