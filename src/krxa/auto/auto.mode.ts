export class AutoMode {
  async run({ decision, policy, context }: any) {
    const mode = context?.policy?.auto_mode ?? "ASSIST"
    if (!policy.allowed) return { executed: false, reason: "정책 차단" }
    if (mode === "OFF" || mode === "ASSIST") return { executed: false, reason: `AUTO_${mode}` }
    if (decision.type === "USE_DB" && decision.confidence >= 0.75 && decision.risk_level !== "high") return { executed: true, action: decision.recommended_actions }
    return { executed: false, reason: "자동 실행 조건 미충족" }
  }
}
