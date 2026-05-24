export class ContextEngine {
  build({ state, event, config }: any) {
    return {
      session: {
        session_id: event.sessionId ?? "anonymous",
        user_id: event.userId,
        mode: event.mode ?? "AUTO",
        llm_mode: event.llmMode ?? config?.llm_mode ?? process.env.KRXA_LLM_MODE ?? "LIMITED",
      },
      state_machine: state,
      ui_context: {
        current_screen: event.screen ?? "unknown",
        user_action: event.action ?? "unknown",
        source: event.source ?? "KRXA_LINK_BAR",
      },
      system_context: {
        connection_status: event.connectionStatus ?? "unknown",
        retry_count: event.retryCount ?? 0,
        error_code: event.errorCode ?? null,
      },
      request: {
        type: event.requestType ?? this.decideRequestType(state, event),
        reason: this.decideReason(state, event),
      },
      policy: {
        auto_mode: config?.auto_mode ?? process.env.KRXA_AUTO_MODE ?? "ASSIST",
        cost_mode: config?.cost_mode ?? process.env.KRXA_COST_MODE ?? "LIMITED",
        policy_level: config?.policy_level ?? process.env.KRXA_POLICY_LEVEL ?? "STRICT",
      },
    }
  }
  decideRequestType(state: any, event: any) {
    if (event.errorCode) return "ANALYZE"
    if (state.reconnect_state === "RECONNECTING") return "ANALYZE"
    if (state.session_state === "ROOM_CONNECTED") return "DISCUSSION"
    if (state.queue_state === "active") return "QUICK"
    return "AUTO"
  }
  decideReason(state: any, event: any) {
    if (event.errorCode) return "오류 분석 필요"
    if (state.reconnect_state === "RECONNECTING") return "재연결 복구 판단 필요"
    if (state.session_state === "ROOM_CONNECTED") return "대화방 연결 상태 분석 필요"
    return "현재 상태 기반 자동 판단"
  }
}
