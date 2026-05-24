export class KRXAI {
  decide({ context, memory }: any) {
    const best = memory?.[0]
    if (best && best.success_score >= 2) {
      return { type: "USE_DB", confidence: 0.85, risk_level: "low", selected_memory_id: best.id, recommended_actions: JSON.parse(best.actions_json ?? "[]"), reason: "성공 패턴이 존재함" }
    }
    if (context.system_context.error_code) return { type: "CALL_LLM", confidence: 0.65, risk_level: "medium", llm_request_type: "ANALYZE", reason: "오류 원인 분석 필요" }
    if (context.request.type === "DISCUSSION" || context.request.type === "ANALYZE") return { type: "CALL_LLM", confidence: 0.7, risk_level: "medium", llm_request_type: context.request.type, reason: "확장 사고 필요" }
    return { type: "ASK_USER", confidence: 0.5, risk_level: "low", reason: "충분한 판단 근거 없음" }
  }
}
