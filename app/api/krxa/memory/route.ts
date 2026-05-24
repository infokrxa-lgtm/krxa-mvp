import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/src/lib/prisma.client"

export async function GET() {
  const records = await prisma.memoryRecord.findMany({ orderBy: [{ success_score: "desc" }, { usage_count: "desc" }, { updated_at: "desc" }], take: 100 })
  return NextResponse.json(records)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const record = await prisma.memoryRecord.create({ data: { state: body.state, intent: body.intent, retry: body.retry, context_summary: body.context_summary ?? "", response: body.response ?? "", actions_json: JSON.stringify(body.actions ?? []), source: body.source ?? "KRXAI", confidence: body.confidence ?? 0.5, success: body.success, user_feedback: body.user_feedback, usage_count: body.usage_count ?? 0, success_score: body.success_score ?? 0, last_used: new Date() } })
  return NextResponse.json(record)
}
