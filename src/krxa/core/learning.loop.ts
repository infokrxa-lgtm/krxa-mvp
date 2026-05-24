import { LanguageDB } from "@/src/krxa/memory/language.db"

export class LearningLoop {
  constructor(private languageDB = new LanguageDB()) {}
  async save({ context, decision, result, autoResult }: any) {
    if ((result?.confidence ?? decision?.confidence ?? 0) < 0.5) return null
    return this.languageDB.save({
      input_signature: {
        state: context.state_machine.session_state,
        intent: context.ui_context.user_action,
        retry: context.system_context.retry_count,
      },
      context_summary: `${context.state_machine.session_state} / ${context.request.reason}`,
      decision: {
        response: result?.response ?? decision?.reason ?? "",
        actions: result?.action_suggestion ?? decision?.recommended_actions ?? [],
        source: result?.fallback_used ? "KRXAI" : (decision?.type === "CALL_LLM" ? "LLM" : "KRXAI"),
        confidence: result?.confidence ?? decision?.confidence ?? 0.5,
      },
      result: { success: autoResult?.executed ?? false },
      learning: { usage_count: 1, success_score: autoResult?.executed ? 1 : 0 },
    })
  }
}
