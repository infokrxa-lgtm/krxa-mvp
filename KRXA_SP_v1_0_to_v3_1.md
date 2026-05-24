# KRXA SP v1.0 ~ v3.1 요약

## v1.x 설계

- v1.0 Context Engine: 상태 머신 + UI + 시스템 + 기억을 LLM용 Context JSON으로 변환
- v1.1 LLM Connector: KRXA와 외부 LLM 연결, 비용/속도/품질 제어
- v1.2 Learning Loop: 응답 → 판단 → 저장 → 반복 개선
- v1.3 Auto Mode: 신뢰도·위험·비용 기준 자동 실행
- v1.4 Link Bar: 어디서든 LLM/KRXA 연결 가능
- v1.5 Total Architecture: 엔진 + UI + 학습 + 자동화 통합
- v1.6 Language DB: 상황 + 판단 + 결과 + 평가 단위 기억
- v1.7 KRXAI: 내부 1차 판단 엔진
- v1.8 Policy Engine: 비용·권한·위험·보안 제어
- v1.9 State Machine Integration: 상태 전환을 판단/자동화/학습 트리거로 사용

## v2.x 구현

- v2.0 프로젝트 폴더 구조
- v2.1 핵심 엔진 코드 초안
- v2.2 React KRXA Link Bar
- v2.3 main.ts 엔진 조립
- v2.4 State Machine
- v2.5 Language DB
- v2.6 Memory Search 구조
- v2.7 LLM Connector API 연결
- v2.8 /api/llm 서버 라우트
- v2.9 환경변수 / 비용 제한 / Rate Limit
- v2.10 로그 / 감사 추적
- v2.11 Admin Dashboard
- v2.12 Admin Control Panel
- v2.13 Config Store
- v2.14 Config API
- v2.15 Prisma Persistent DB
- v2.16 Prisma API 라우트
- v2.17 MVP 조립 순서
- v2.18 배포/운영/비용 방어선
- v2.19 QA 체크리스트
- v2.20 ZIP 산출물 구조
- v2.21 README 실행 문서
- v2.22 ZIP 생성 체크리스트

## v3.x 실행

- v3.0 실제 실행 / 배포 / 사용자 붙이기
- v3.1 실제 ZIP 산출물 제작

## 핵심 정의

```text
너(ChatGPT/LLM)
   ⇅
KRXA
   ⇅
[ KRXAI + 언어DB ]
   +
흐름 프로그램 / 상태 머신
```

KRXA는 중앙 판단·제어 엔진이며, Link Bar는 시스템 어디서든 KRXA와 LLM을 연결하는 전역 사고 인터페이스입니다.
