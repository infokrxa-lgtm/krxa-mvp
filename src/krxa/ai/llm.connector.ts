export class LLMConnector {
  constructor(
    private options: {
      endpoint?: string
      model?: string
      timeoutMs?: number
    } = {}
  ) {}

  async call({ context, decision }: any) {
    if (context.session.llm_mode === "OFF") {
      return {
        response: null,
        confidence: 0,
        action_suggestion: [],
        usage: { tokens: 0, cost_level: "low" },
        fallback_used: true,
        reason: "LLM_OFF",
      }
    }

    const requestType = decision.llm_request_type ?? context.request?.type ?? "AUTO"
    const prompt = this.buildPrompt(context, requestType, decision.reason)
    const raw = await this.callApi(prompt, requestType, context.session.session_id)

    return this.normalizeResponse(raw, requestType)
  }

  private buildPrompt(context: any, requestType: string, reason?: string) {
    return {
      system:
        "너는 KRXA 내부 논의 파트너다. context 기반으로 판단하고, 불확실하면 명시한다. 비용·위험·자동실행 가능성을 함께 판단한다.",
      user: JSON.stringify(
        {
          request_type: requestType,
          reason,
          context,
        },
        null,
        2
      ),
    }
  }

  private getEndpoint() {
    if (this.options.endpoint) return this.options.endpoint

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ??
      process.env.RENDER_EXTERNAL_URL ??
      "https://krxa-mvp.onrender.com"

    return `${baseUrl.replace(/\/$/, "")}/api/llm`
  }

  private async callApi(prompt: any, mode: string, sessionId: string) {
    const endpoint = this.getEndpoint()

    const controller = new AbortController()
    const timeout = setTimeout(
      () => controller.abort(),
      this.options.timeoutMs ?? 15000
    )

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          model:
            this.options.model ??
            process.env.KRXA_LLM_DEFAULT_MODEL ??
            "gpt-4.1-mini",
          mode,
          messages: [
            {
              role: "system",
              content: prompt.system,
            },
            {
              role: "user",
              content: prompt.user,
            },
          ],
        }),
        signal: controller.signal,
      })

      if (!res.ok) {
        const text = await res.text().catch(() => "")
        throw new Error(`LLM_API_ERROR_${res.status}${text ? `: ${text}` : ""}`)
      }

      return res.json()
    } catch (error: any) {
      return {
        error: true,
        message: error?.message ?? "LLM_API_FAILED",
      }
    } finally {
      clearTimeout(timeout)
    }
  }

  private normalizeResponse(raw: any, requestType: string) {
    if (raw?.error) {
      return {
        response: null,
        confidence: 0,
        action_suggestion: [],
        usage: {
          tokens: 0,
          cost_level: "low",
        },
        fallback_used: true,
        reason: raw.message,
      }
    }

    const content =
      raw?.response ??
      raw?.choices?.[0]?.message?.content ??
      raw?.message ??
      ""

    const tokens = raw?.usage?.total_tokens ?? raw?.usage?.tokens ?? 0

    return {
      response: content,
      confidence: content.includes("불확실")
        ? 0.55
        : requestType === "ANALYZE"
          ? 0.78
          : 0.72,
      action_suggestion: this.extractActions(content),
      usage: {
        tokens,
        cost_level: tokens < 1000 ? "low" : tokens < 4000 ? "medium" : "high",
      },
      fallback_used: false,
    }
  }

  private extractActions(content: string) {
    const a: string[] = []

    if (content.includes("재시도")) a.push("RETRY")
    if (content.includes("대기")) a.push("WAIT")
    if (content.includes("차단")) a.push("BLOCK")
    if (content.includes("사용자 확인")) a.push("ASK_USER")

    return a
  }
}
