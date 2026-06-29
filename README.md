# LectureInsight Frontend

강의 분석 결과를 시각화하고 리포트를 생성하는 대시보드.

## Stack

- Next.js 15 (App Router) / React 19
- TypeScript
- Tailwind CSS
- SWR (data fetching)
- Recharts (시각화)

## Layout

```
app/
├── layout.tsx
├── page.tsx           # 메인
├── analysis/          # 강의 분석
├── report/            # 리포트 미리보기/다운로드
└── compare/           # 강사 비교, 시계열
components/
├── ui/                # 공통 UI 컴포넌트
└── dashboard/         # 차트, 카드 등
lib/
├── api.ts             # 백엔드 API 클라이언트
├── types.ts           # 백엔드 스키마 매핑 타입
└── cn.ts
```

## Setup

```bash
npm install
cp .env.example .env.local   # API URL 설정
npm run dev
```

브라우저에서 http://localhost:3000

> `.env.example` → `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000`.
> 백엔드가 먼저 떠 있어야 실분석/해설이 동작합니다. 백엔드 없이 보려면 메인 화면의
> **"데모 데이터로 보기"** 사용.

## 백엔드 연동

- 기본 백엔드 URL: `http://localhost:8000` (`NEXT_PUBLIC_API_BASE_URL`)
- 백엔드 스키마(`backend/app/analysis/schemas.py`)와 `lib/types.ts` 동기화 필수
  (예: `ItemScore.reason` 필드).

### 분석 화면 데이터 흐름 (`app/analysis/page.tsx`)

- 분석 결과(스코어카드)는 `lib/store.ts` 세션에 저장 → 일자별/**종합** 탭 전환.
  종합 뷰는 `lib/aggregate.buildAggregate` 가 프론트에서 평균 계산.
- 보는 카드(단일/종합)가 바뀌면 **`POST /api/v1/analysis/narrative`** 를 호출해 LLM 종합 분석을 받아온다:
  - 상단 **분석 요약**(`SummaryBox`) ← `summary`
  - 하단 **최종 피드백**(`FinalFeedback`) ← `overall_feedback`
  - 호출 실패/백엔드 부재 시 `lib/insights.ts` 템플릿으로 자동 폴백.
- 항목별 표(`ItemTable`)의 '해설' = `reason`(1줄 코멘트) + `근거`(`evidence`).
