"use client"

import { useMemo, useState } from "react"

type Mode = "QUICK" | "ANALYZE" | "DISCUSSION" | "AUTO"

async function sendLLMDirect(event: {
  sessionId: string
  mode: Mode
  text: string
}) {
  const res = await fetch("/api/llm", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sessionId: event.sessionId,
      mode: event.mode,
      messages: [
        {
          role: "system",
          content:
            "너는 KRXA 내부 논의 파트너다. 사용자의 말을 받아 직접 답한다. KRXAI가 막혀도 사용자의 의도를 우선 이해하고, 필요한 경우 현재 Render/KRXA 연결 상태를 설명한다.",
        },
        {
          role: "user",
          content: event.text,
        },
      ],
    }),
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(
      data?.message ?? data?.error ?? `LLM_DIRECT_ERROR_${res.status}`
    )
  }

  return data
}

function pickLLMResponse(data: any) {
  return (
    data?.response ??
    data?.choices?.[0]?.message?.content ??
    data?.message ??
    data?.text ??
    data?.answer ??
    "LLM 응답 없음"
  )
}

export function KRXALinkBar() {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<Mode>("AUTO")
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const sessionId = useMemo(
    () =>
      typeof crypto !== "undefined"
        ? crypto.randomUUID()
        : String(Date.now()),
    []
  )

  async function connectKRXA() {
    setOpen(true)

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        text: "KRXA LINK 준비됨. 이제 직접 LLM 호출 모드로 연결합니다.",
      },
    ])
  }

  async function sendMessage() {
    if (!input.trim()) return

    const text = input
    setInput("")
    setLoading(true)

    setMessages((prev) => [...prev, { role: "user", text }])

    try {
      const data = await sendLLMDirect({
        sessionId,
        mode,
        text,
      })

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: pickLLMResponse(data),
        },
      ])
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: error?.message ?? "LLM 직접 호출 실패",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={connectKRXA}
        className="fixed bottom-6 right-6 rounded-full shadow-lg px-4 py-3 bg-black text-white z-50"
      >
        ⚡ KRXA
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 h-96 bg-white border shadow-xl rounded-2xl flex flex-col overflow-hidden z-50">
      <div className="p-3 border-b flex justify-between items-center">
        <div>
          <div className="font-bold">KRXA LINK</div>
          <div className="text-xs text-gray-500">MODE: {mode}</div>
        </div>
        <button onClick={() => setOpen(false)}>×</button>
      </div>

      <div className="p-2 border-b flex gap-2 text-xs">
        {(["QUICK", "ANALYZE", "DISCUSSION", "AUTO"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-2 py-1 rounded ${
              mode === m ? "bg-black text-white" : "bg-gray-100"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="flex-1 p-3 overflow-y-auto text-sm space-y-2">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={msg.role === "user" ? "text-right" : "text-left"}
          >
            <span className="inline-block bg-gray-100 rounded-lg px-3 py-2 whitespace-pre-wrap">
              {msg.text}
            </span>
          </div>
        ))}

        {loading && <div className="text-gray-400">LLM 호출 중...</div>}
      </div>

      <div className="p-3 border-t flex gap-2">
        <input
          className="flex-1 border rounded px-2 py-1 text-sm"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="나와 직접 논의..."
        />
        <button
          onClick={sendMessage}
          className="px-3 py-1 bg-black text-white rounded"
        >
          전송
        </button>
      </div>
    </div>
  )
}