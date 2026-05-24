export type SessionState =
  | "INIT" | "TERMS_ACCEPTED" | "APP_ACTIVATED" | "ALIVE_HOME"
  | "SECURITY_SELECTED" | "TRANSLATE_SUCCESS" | "QUEUE_JOINED"
  | "MATCH_FOUND" | "ROOM_CONNECTED" | "RECONNECTING"
  | "ROOM_RECOVERED" | "ERROR"

export type KRXAState = {
  session_state: SessionState
  queue_state?: string
  presence_state?: string
  reconnect_state?: string
  recovery_state?: string
}

export class StateMachine {
  private state: KRXAState = {
    session_state: "INIT",
    queue_state: "idle",
    presence_state: "offline",
    reconnect_state: "none",
    recovery_state: "none",
  }

  update(event: any): KRXAState {
    if (event.errorCode) return (this.state = { ...this.state, session_state: "ERROR" })
    switch (event.action) {
      case "terms_accepted": this.state.session_state = "TERMS_ACCEPTED"; break
      case "app_activated": this.state.session_state = "APP_ACTIVATED"; this.state.presence_state = "online"; break
      case "alive_home": this.state.session_state = "ALIVE_HOME"; break
      case "security_selected": this.state.session_state = "SECURITY_SELECTED"; break
      case "translate_success": this.state.session_state = "TRANSLATE_SUCCESS"; break
      case "queue_joined": this.state.session_state = "QUEUE_JOINED"; this.state.queue_state = "active"; break
      case "match_found": this.state.session_state = "MATCH_FOUND"; break
      case "room_connected": this.state.session_state = "ROOM_CONNECTED"; this.state.presence_state = "in_room"; break
      case "reconnecting": this.state.session_state = "RECONNECTING"; this.state.reconnect_state = "RECONNECTING"; break
      case "room_recovered": this.state.session_state = "ROOM_RECOVERED"; this.state.recovery_state = "recovered"; this.state.reconnect_state = "none"; break
      default: break
    }
    return this.state
  }
  getState() { return this.state }
}
