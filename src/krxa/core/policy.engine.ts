export class PolicyEngine {
  check(decision: any, context?: any) {
    if (decision.risk_level === "high") return { allowed: false, requires_confirm: true, reason: "고위험 작업 차단", fallback: "ASK_USER" }
    if (decision.confidence < 0.5) return { allowed: false, requires_confirm: true, reason: "신뢰도 부족", fallback: "ASK_USER" }
    if (context?.session?.llm_mode === "OFF" && decision.type === "CALL_LLM") return { allowed: false, requires_confirm: false, reason: "LLM_OFF", fallback: "KRXAI" }
    return { allowed: true, requires_confirm: false, reason: "정책 통과", fallback: "NONE" }
  }
}
