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

## 백엔드 연동

- 기본 백엔드 URL: `http://localhost:8000`
- 백엔드 스키마(`backend/app/analysis/schemas.py`)와 `lib/types.ts` 동기화 필수
