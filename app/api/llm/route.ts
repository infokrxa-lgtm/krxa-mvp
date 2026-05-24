import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const requestMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(sessionId: string) {
  const limit = Number(process.env.KRXA_RATE_LIMIT_PER_MINUTE ?? 20)
  const now = Date.now(), windowMs = 60_000
  const cur = requestMap.get(sessionId)
  if (!cur || cur.resetAt < now) { requestMap.set(sessionId, { count: 1, resetAt: now + windowMs }); return { allowed: true } }
  if (cur.count >= limit) return { allowed: false, reason: "RATE_LIMIT_EXCEEDED", resetAt: cur.resetAt }
  cur.count += 1; return { allowed: true }
}

function decideMaxTokens(mode: string) {
  const key = `KRXA_LLM_MAX_TOKENS_${mode}`
  return Number(process.env[key] ?? process.env.KRXA_LLM_MAX_TOKENS_AUTO ?? 800)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const sessionId = body.sessionId ?? "anonymous"
    const rate = checkRateLimit(sessionId)
    if (!rate.allowed) return NextResponse.json({ error: true, message: rate.reason, resetAt: rate.resetAt }, { status: 429 })
    if (process.env.KRXA_LLM_ENABLED === "false") return NextResponse.json({ error: true, message: "LLM_DISABLED" }, { status: 403 })
    if (!process.env.OPENAI_API_KEY) return NextResponse.json({ response: "LLM mock response: OPENAI_API_KEY가 없어 모의 응답을 반환합니다.", mode: body.mode ?? "AUTO", usage: { total_tokens: 0 } })

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const mode = body.mode ?? "AUTO"
    const completion = await openai.chat.completions.create({ model: body.model ?? process.env.KRXA_LLM_DEFAULT_MODEL ?? "gpt-4.1-mini", messages: body.messages ?? [], max_tokens: decideMaxTokens(mode), temperature: mode === "DISCUSSION" ? 0.4 : 0.2 })
    return NextResponse.json({ response: completion.choices[0]?.message?.content ?? "", mode, usage: completion.usage })
  } catch (error: any) {
    return NextResponse.json({ error: true, message: error?.message ?? "LLM_ROUTE_FAILED" }, { status: 500 })
  }
}
