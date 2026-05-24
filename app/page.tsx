export default function Home() {
  return <main className="p-6 space-y-4">
    <h1 className="text-2xl font-bold">KRXA MVP</h1>
    <p>우측 하단 ⚡ KRXA Link Bar를 클릭하면 현재 화면 context가 자동 생성되고 KRXA 판단 흐름이 실행됩니다.</p>
    <div className="border rounded-xl p-4">
      <strong>샘플 흐름</strong>
      <p>/samples/m2m/user 상태 머신 기반 흐름을 KRXA Link Bar와 연결하는 MVP입니다.</p>
    </div>
  </main>
}
