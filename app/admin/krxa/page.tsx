"use client"
import { useEffect, useState } from "react"

export default function KRXAAdminPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [memory, setMemory] = useState<any[]>([])
  const [config, setConfig] = useState<any>(null)

  async function load() {
    setLogs(await fetch("/api/krxa/logs").then(r=>r.json()))
    setMemory(await fetch("/api/krxa/memory").then(r=>r.json()))
    setConfig(await fetch("/api/krxa/config").then(r=>r.json()))
  }
  useEffect(()=>{ load() }, [])

  async function update(key: string, value: string) {
    const next = await fetch("/api/krxa/config", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ [key]: value }) }).then(r=>r.json())
    setConfig(next)
  }

  return <main className="p-6 space-y-6">
    <h1 className="text-2xl font-bold">KRXA Admin Dashboard</h1>
    {config && <div className="border rounded-xl p-5 space-y-4">
      <h2 className="text-xl font-bold">Control Panel</h2>
      <Control label="LLM MODE" value={config.llm_mode} options={["OFF","LIMITED","ON","AUTO"]} onChange={(v)=>update("llm_mode", v)} />
      <Control label="AUTO MODE" value={config.auto_mode} options={["OFF","ASSIST","RUN","FULL"]} onChange={(v)=>update("auto_mode", v)} />
      <Control label="COST MODE" value={config.cost_mode} options={["LOW","LIMITED","HIGH"]} onChange={(v)=>update("cost_mode", v)} />
      <Control label="POLICY LEVEL" value={config.policy_level} options={["STRICT","NORMAL","FLEXIBLE"]} onChange={(v)=>update("policy_level", v)} />
    </div>}
    <div className="grid grid-cols-4 gap-4">
      <Card title="Logs" value={logs.length}/><Card title="Memory" value={memory.length}/><Card title="LLM Calls" value={logs.filter(l=>l.type==='LLM_CALL').length}/><Card title="Blocked" value={logs.filter(l=>l.type==='BLOCKED').length}/>
    </div>
    <section className="border rounded-xl p-4"><h2 className="text-xl font-bold">Recent Logs</h2>{logs.slice(0,50).map(log=><pre key={log.id} className="bg-gray-100 p-2 mt-2 rounded text-xs overflow-auto">{JSON.stringify(log,null,2)}</pre>)}</section>
  </main>
}
function Control({label,value,options,onChange}: any){return <div className="flex items-center justify-between gap-4"><div className="font-medium">{label}</div><select value={value} onChange={e=>onChange(e.target.value)} className="border rounded px-3 py-2">{options.map((o:string)=><option key={o}>{o}</option>)}</select></div>}
function Card({title,value}: {title:string;value:number}){return <div className="border rounded-xl p-4 shadow-sm"><div className="text-sm text-gray-500">{title}</div><div className="text-2xl font-bold">{value}</div></div>}
