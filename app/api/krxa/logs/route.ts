import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/src/lib/prisma.client"

export async function GET() {
  const logs = await prisma.kRXALog.findMany({ orderBy: { timestamp: "desc" }, take: 300 })
  return NextResponse.json(logs)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const log = await prisma.kRXALog.create({ data: { session_id: body.session_id ?? "anonymous", user_id: body.user_id, type: body.type, level: body.level ?? "info", state: body.state, action: body.action, decision_source: body.decision_source, message: body.message, payload_json: body.payload ? JSON.stringify(body.payload) : null } })
  return NextResponse.json(log)
}
