import { NextRequest, NextResponse } from "next/server"
import { createKRXAEngine } from "@/src/app/main"
import { prisma } from "@/src/lib/prisma.client"

const krxaEngine = createKRXAEngine()

async function getConfig() {
  return prisma.kRXAConfig.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default", llm_mode: "LIMITED", auto_mode: "ASSIST", cost_mode: "LIMITED", policy_level: "STRICT" },
  })
}

export async function POST(req: NextRequest) {
  try {
    const event = await req.json()
    const config = await getConfig()
    const result = await krxaEngine.handleEvent(event, config)
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: true, message: error?.message ?? "KRXA_EVENT_FAILED" }, { status: 500 })
  }
}
