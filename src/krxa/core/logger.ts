import { prisma } from "@/src/lib/prisma.client"

export class KRXALogger {
  async write(log: any) {
    return prisma.kRXALog.create({
      data: {
        session_id: log.session_id ?? "anonymous",
        user_id: log.user_id,
        type: log.type,
        level: log.level ?? "info",
        state: log.state,
        action: log.action,
        decision_source: log.decision_source,
        message: log.message,
        payload_json: log.payload ? JSON.stringify(log.payload) : null,
      },
    })
  }
  async list() {
    return prisma.kRXALog.findMany({ orderBy: { timestamp: "desc" }, take: 300 })
  }
}
