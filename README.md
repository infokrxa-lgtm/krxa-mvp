# KRXA MVP

KRXA MVP는 Link Bar, Context Engine, KRXAI, LLM Connector, 언어DB, Auto Mode, Learning Loop, Admin Dashboard를 포함한 프로토타입입니다.

## 기본 구조

```text
사용자
 ↓
말대말 UI
 ↓
KRXA
 ├─ KRXA_LINK_BAR
 ├─ CONTEXT ENGINE
 ├─ LLM CONNECTOR ⇄ ChatGPT / LLM
 ├─ KRXAI
 ├─ 언어DB
 ├─ AUTO MODE
 ├─ LEARNING LOOP
 └─ 상태 머신 / 흐름 프로그램
```

## 설치

```bash
npm install
```

## 환경변수

```bash
cp .env.example .env.local
```

필수/권장 값:

```env
OPENAI_API_KEY=
DATABASE_URL="file:./krxa.db"
KRXA_LLM_ENABLED=true
KRXA_LLM_MODE=LIMITED
KRXA_AUTO_MODE=ASSIST
KRXA_COST_MODE=LIMITED
KRXA_POLICY_LEVEL=STRICT
```

`OPENAI_API_KEY`가 비어 있으면 `/api/llm`은 모의 응답을 반환합니다.

## DB 생성

```bash
npx prisma migrate dev --name init_krxa
```

## 실행

```bash
npm run dev
```

## 접속

```text
사용자 화면: http://localhost:3000
관리자 화면: http://localhost:3000/admin/krxa
```

## 기본 테스트

1. 화면 우측 하단 `⚡ KRXA` Link Bar 클릭
2. Context 생성 확인
3. Admin Dashboard에서 로그 확인
4. LLM OFF / LIMITED 모드 변경 테스트
5. Memory 저장 여부 확인

## 운영 기본값

```text
LLM_MODE = LIMITED
AUTO_MODE = ASSIST
COST_MODE = LIMITED
POLICY_LEVEL = STRICT
```

## 보안 원칙

- `.env.local`은 ZIP/배포 저장소에 포함하지 않습니다.
- API Key는 서버 라우트에서만 사용합니다.
- AUTO_FULL은 초기 운영에서 사용하지 않는 것을 권장합니다.
- DELETE / PAYMENT / SECURITY 류 작업은 자동 실행 금지 정책으로 유지합니다.
