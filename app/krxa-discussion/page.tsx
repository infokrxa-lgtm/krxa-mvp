"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"

export default function KRXADiscussionPage() {
  const params = useSearchParams()
  const sessionId = params.get("sessionId") ?? "discussion-session"

  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  async function sendMessage() {
    if (!input.trim()) return

    const text = input
    setInput("")
    setLoading(true)

    setMessages((prev) => [...prev, { role: "user", text }])

    try {
      const res = await fetch("/api/llm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          mode: "DISCUSSION",
          messages: [
            {
              role: "system",
              content:
                "너는 KRXA 내부 논의 파트너다. 사용자의 질문에 직접 답하고, KRXAI를 가르칠 수 있도록 구조적으로 설명한다.",
            },
            {
              role: "user",
              content: text,
            },
          ],
        }),
      })

      const data = await res.json()

      const reply =
        data?.response ??
        data?.choices?.[0]?.message?.content ??
        data?.message ??
        "응답 없음"

      setMessages((prev) => [...prev, { role: "assistant", text: reply }])
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: error?.message ?? "LLM 호출 실패" },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="w-full h-screen bg-white flex flex-col">
      <header className="p-4 border-b">
        <div className="text-xl font-bold">KRXA DISCUSSION</div>
        <div className="text-sm text-gray-500">Session: {sessionId}</div>
      </header>

      <section className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={msg.role === "user" ? "text-right" : "text-left"}
          >
            <div className="inline-block max-w-3xl rounded-xl bg-gray-100 px-4 py-3 whitespace-pre-wrap text-sm">
              {msg.text}
            </div>
          </div>
        ))}

        {loading && <div className="text-gray-400">LLM 호출 중...</div>}
      </section>

      <footer className="p-4 border-t flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="KRXA와 크게 논의..."
        />
        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-black text-white rounded"
        >
          전송
        </button>
      </footer>
    </main>
  )
}