"use client"

export const dynamic = "force-dynamic"

import { useEffect, useRef, useState } from "react"

type Msg = {
  role: "user" | "assistant" | "system"
  text: string
}

export default function KRXADiscussionPage() {
  const [sessionId, setSessionId] = useState("discussion-session")
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Msg[]>([
    { role: "system", text: "KRXA DISCUSSION WINDOW 준비됨. @gpt 로 직접 호출 가능." },
  ])
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setSessionId(params.get("sessionId") ?? "discussion-session")
  }, [])

  async function callGPT(text: string) {
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
              "너는 KRXA 내부 논의 파트너다. KRXA는 최상위 운영 체계이고, KRXAI는 내부 판단/학습 엔진이며, 말대말 UI는 하위 제품/서비스 UI다. 사용자의 질문에 직접 답하고, 필요하면 KRXAI를 가르칠 수 있도록 구조적으로 정리한다.",
          },
          { role: "user", content: text },
        ],
      }),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data?.message ?? data?.error ?? "LLM 호출 실패")

    return (
      data?.response ??
      data?.choices?.[0]?.message?.content ??
      data?.message ??
      data?.text ??
      data?.answer ??
      "응답 없음"
    )
  }

  async function sendMessage() {
    if (!input.trim()) return

    const text = input
    setInput("")
    setLoading(true)
    setMessages((prev) => [...prev, { role: "user", text }])

    try {
      const reply = await callGPT(text)
      setMessages((prev) => [...prev, { role: "assistant", text: reply }])
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: error?.message ?? "호출 실패" },
      ])
    } finally {
      setLoading(false)
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const text = await file.text().catch(() => "")
    const summary = text
      ? `파일 업로드됨: ${file.name}\n\n${text.slice(0, 5000)}`
      : `파일 업로드됨: ${file.name}\n\n텍스트로 읽을 수 없는 파일입니다.`

    setMessages((prev) => [...prev, { role: "user", text: summary }])
    setInput(`@gpt 업로드한 파일 ${file.name} 내용을 KRXA 관점에서 분석해줘.`)
  }

  function downloadChat() {
    const content = messages
      .map((m) => `[${m.role.toUpperCase()}]\n${m.text}`)
      .join("\n\n---\n\n")

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `krxa-discussion-${sessionId}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  function clearChat() {
    setMessages([{ role: "system", text: "KRXA DISCUSSION WINDOW 초기화됨." }])
  }

  return (
    <main className="w-full h-screen bg-[#e9edf3] flex items-center justify-center p-4">
      <section className="w-full max-w-6xl h-[92vh] bg-white border border-gray-300 shadow-2xl rounded-xl overflow-hidden flex flex-col">
        <header className="h-11 bg-[#202124] text-white flex items-center justify-between px-4">
          <div>
            <div className="font-bold text-sm">KRXA DISCUSSION WINDOW</div>
            <div className="text-[11px] text-gray-300">Session: {sessionId}</div>
          </div>

          <div className="flex gap-2 text-xs">
            <button onClick={() => fileRef.current?.click()} className="px-3 py-1 rounded bg-white text-black">
              파일 업로드
            </button>
            <button onClick={downloadChat} className="px-3 py-1 rounded bg-white text-black">
              대화 다운로드
            </button>
            <button onClick={clearChat} className="px-3 py-1 rounded bg-red-600 text-white">
              초기화
            </button>
          </div>

          <input ref={fileRef} type="file" className="hidden" onChange={handleFileUpload} />
        </header>

        <div className="h-8 bg-[#f5f5f5] border-b px-4 flex items-center gap-4 text-xs text-gray-600">
          <span>파일</span>
          <span>편집</span>
          <span>보기</span>
          <span>도구</span>
          <span>KRXA</span>
        </div>

        <section className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={
                msg.role === "user"
                  ? "text-right"
                  : msg.role === "system"
                  ? "text-center"
                  : "text-left"
              }
            >
              <div
                className={`inline-block max-w-4xl rounded-xl px-4 py-3 whitespace-pre-wrap text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-black text-white"
                    : msg.role === "system"
                    ? "bg-yellow-100 text-gray-700"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {loading && <div className="text-gray-400">LLM 호출 중...</div>}
        </section>

        <footer className="p-4 border-t bg-white flex gap-2">
          <input
            className="flex-1 border rounded-xl px-4 py-3 text-sm"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="@gpt KRXA 내부 논의 파트너를 호출..."
          />

          <button onClick={sendMessage} className="px-6 py-3 bg-black text-white rounded-xl">
            전송
          </button>
        </footer>
      </section>
    </main>
  )
}