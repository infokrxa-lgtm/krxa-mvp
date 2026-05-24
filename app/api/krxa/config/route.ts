import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/src/lib/prisma.client"

const defaults = { id: "default", llm_mode: "LIMITED", auto_mode: "ASSIST", cost_mode: "LIMITED", policy_level: "STRICT" }

export async function GET() {
  const config = await prisma.kRXAConfig.upsert({ where: { id: "default" }, update: {}, create: defaults })
  return NextResponse.json(config)
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const config = await prisma.kRXAConfig.upsert({ where: { id: "default" }, update: body, create: { ...defaults, ...body } })
  return NextResponse.json(config)
}
