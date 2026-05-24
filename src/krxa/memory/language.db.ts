import { prisma } from "@/src/lib/prisma.client"

export class LanguageDB {
  async search(context: any) {
    const state = context.state_machine.session_state
    const intent = context.ui_context.user_action
    const rows = await prisma.memoryRecord.findMany({
      where: { state, OR: [{ intent }, { intent: null }] },
      orderBy: [{ success_score: "desc" }, { usage_count: "desc" }, { last_used: "desc" }],
      take: 3,
    })
    for (const row of rows) {
      await prisma.memoryRecord.update({ where: { id: row.id }, data: { usage_count: { increment: 1 }, last_used: new Date() } })
    }
    return rows
  }

  async save(record: any) {
    return prisma.memoryRecord.create({
      data: {
        state: record.input_signature.state,
        intent: record.input_signature.intent,
        retry: record.input_signature.retry,
        context_summary: record.context_summary ?? "",
        response: record.decision.response ?? record.decision.reason ?? "",
        actions_json: JSON.stringify(record.decision.actions ?? record.decision.recommended_actions ?? []),
        source: record.decision.source ?? "KRXAI",
        confidence: record.decision.confidence ?? 0.5,
        success: record.result?.success,
        user_feedback: record.result?.user_feedback,
        usage_count: record.learning?.usage_count ?? 0,
        success_score: record.learning?.success_score ?? 0,
        last_used: new Date(),
      },
    })
  }
}
