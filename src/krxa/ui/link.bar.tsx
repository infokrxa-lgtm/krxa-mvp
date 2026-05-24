"use client"

import { useMemo, useState } from "react"

type Mode = "QUICK" | "ANALYZE" | "DISCUSSION" | "AUTO"

async function sendKRXAEvent(event: any) {
  const res = await fetch("/api/krxa/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
  })

  return res.json()
}

function pickKRXAResponse(result: any) {
  return (
    result?.result?.response ??
    result?.result?.message ??
    result?.result?.text ??
    result?.result?.answer ??
    result?.result?.reason ??
    result?.decision?.response ??
    result?.decision?.reason ??
    result?.policy?.reason ??
    result?.error ??
    "KRXA 응답 없음"
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

  async function connectKRXA(action = "link_bar_clicked", requestType: Mode = mode) {
    setOpen(true)
    setLoading(true)

    try {
      const result = await sendKRXAEvent({
        source: "KRXA_LINK_BAR",
        action,
        mode,
        llmMode: "LIMITED",
        requestType,
        screen: window.location.pathname,
        sessionId,
      })

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: pickKRXAResponse(result),
        },
      ])
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: error?.message ?? "KRXA 호출 실패",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  async function sendMessage() {
    if (!input.trim()) return

    const text = input
    setInput("")

    setMessages((prev) => [...prev, { role: "user", text }])

    await connectKRXA(text, "DISCUSSION")
  }

  if (!open) {
    return (
      <button
        onClick={() => connectKRXA()}
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
          <div key={i} className={msg.role === "user" ? "text-right" : "text-left"}>
            <span className="inline-block bg-gray-100 rounded-lg px-3 py-2">
              {msg.text}
            </span>
          </div>
        ))}

        {loading && <div className="text-gray-400">KRXA 판단 중...</div>}
      </div>

      <div className="p-3 border-t flex gap-2">
        <input
          className="flex-1 border rounded px-2 py-1 text-sm"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="KRXA와 논의..."
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
