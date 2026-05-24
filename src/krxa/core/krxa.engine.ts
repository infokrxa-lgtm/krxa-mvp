import { StateMachine } from "@/src/krxa/state/state.machine"
import { ContextEngine } from "@/src/krxa/core/context.engine"
import { LanguageDB } from "@/src/krxa/memory/language.db"
import { KRXAI } from "@/src/krxa/ai/krxai"
import { PolicyEngine } from "@/src/krxa/core/policy.engine"
import { LLMConnector } from "@/src/krxa/ai/llm.connector"
import { LearningLoop } from "@/src/krxa/core/learning.loop"
import { AutoMode } from "@/src/krxa/auto/auto.mode"
import { KRXALogger } from "@/src/krxa/core/logger"

export class KRXAEngine {
  constructor(
    private stateMachine = new StateMachine(),
    private contextEngine = new ContextEngine(),
    private languageDB = new LanguageDB(),
    private krxai = new KRXAI(),
    private policyEngine = new PolicyEngine(),
    private llmConnector = new LLMConnector(),
    private learningLoop = new LearningLoop(),
    private autoMode = new AutoMode(),
    private logger = new KRXALogger()
  ) {}

  async handleEvent(event: any, config?: any) {
    const state = this.stateMachine.update(event)

    const context = this.contextEngine.build({
      state,
      event,
      config,
    })

    await this.logger.write({
      session_id: context.session.session_id,
      type: "CONTEXT_CREATED",
      level: "info",
      state: state.session_state,
      action: event.action,
      message: "Context 생성",
      payload: context,
    })

    const memory = await this.languageDB.search(context)

    const decision = this.krxai.decide({
      context,
      memory,
    })

    await this.logger.write({
      session_id: context.session.session_id,
      type: "KRXAI_DECISION",
      level: "info",
      state: state.session_state,
      decision_source: "KRXAI",
      message: decision.reason,
      payload: decision,
    })

    const policy = this.policyEngine.check(decision, context)

    await this.logger.write({
      session_id: context.session.session_id,
      type: policy.allowed ? "POLICY_CHECK" : "BLOCKED",
      level: policy.allowed ? "info" : "warn",
      state: state.session_state,
      decision_source: "POLICY",
      message: policy.reason,
      payload: policy,
    })

    if (!policy.allowed) {
      return {
        status: "BLOCKED",
        context,
        decision,
        policy,
      }
    }

    const result =
      decision.type === "CALL_LLM"
        ? await this.llmConnector.call({
            context,
            decision,
          })
        : decision

    if (decision.type === "CALL_LLM") {
      await this.logger.write({
        session_id: context.session.session_id,
        type: "LLM_CALL",
        level: (result as any).fallback_used ? "warn" : "info",
        state: state.session_state,
        decision_source: "LLM",
        message: (result as any).reason ?? "LLM 호출 완료",
        payload: result,
      })
    }

    const autoResult = await this.autoMode.run({
      context,
      decision,
      result,
      policy,
    })

    await this.logger.write({
      session_id: context.session.session_id,
      type: "AUTO_EXECUTE",
      level: autoResult.executed ? "info" : "warn",
      state: state.session_state,
      action: JSON.stringify(autoResult.action ?? []),
      decision_source: "KRXAI",
      message: autoResult.executed ? "자동 실행 완료" : autoResult.reason,
      payload: autoResult,
    })

    const saved = await this.learningLoop.save({
      context,
      decision,
      result,
      autoResult,
    })

    if (saved) {
      await this.logger.write({
        session_id: context.session.session_id,
        type: "LEARNING_SAVE",
        level: "info",
        state: state.session_state,
        message: "학습 기록 저장",
        payload: saved,
      })
    }

    return {
      status: "DONE",
      context,
      decision,
      result,
      autoResult,
    }
  }
}
