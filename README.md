# LectureInsight — 강의 분석 대시보드 (프론트엔드)

**강의 녹취록(STT 텍스트)을 올리면, AI가 강의력을 항목별로 채점해 점수·강점·개선점을 한 화면 리포트로 보여주는 웹 화면**입니다.

이 문서는 두 부분으로 나뉩니다.
- **1부 — 무엇을 하고, 어떻게 쓰나** (누구나 읽는 화면 흐름)
- **2부 — 어떻게 실행하나 / 구조** (개발/실행용)

---

# 1부. 무엇을 하고, 어떻게 쓰나

## 한눈에

강사의 강의 녹취록을 넣으면 → AI가 5개 영역·여러 항목으로 채점 → **오각형 점수 그래프 + 항목별 표 + 종합 피드백**을 만들어 줍니다. 강의가 여러 개면 **여러 강의를 합친 '종합' 리포트**와 **회차별 추이**도 함께 보여줍니다.

평가하는 5개 영역:

| 영역 | 보는 것 |
|---|---|
| 언어 표현 품질 | 군더더기 표현, 말투 일관성 등 |
| 강의 도입·구조 | 학습 목표 안내, 설명 순서, 마무리 요약 등 |
| 개념 설명 명확성 | 용어 정의, 비유·예시, 발화 속도 등 |
| 예시·실습 연계 | 예시 적절성, 이론-실습 연결 등 |
| 수강생 상호작용 | 이해 확인 질문, 참여 유도, 질문 응답 등 |

## 화면 흐름

```
 ① 입력           ② 진행            ③ 분석 결과              ④ 리포트
  (/)      →    (/analyzing)  →    (/analysis)      →     (/report)
 파일 올리기     진행률·로그        점수·표·피드백          DOCX·인쇄
              실시간 표시        (종합/회차별)            다운로드
```

### ① 입력 화면 (`/`)
- 강의 녹취록 **`.txt` 파일을 끌어다 놓거나 클릭해서 첨부** (여러 개 가능)
- 강사 ID, (선택) 강의 일자·과목 입력
- **[분석 시작]** → 분석이 돌기 시작하고 진행 화면으로 넘어갑니다
- 백엔드 없이 화면만 보고 싶으면 **[데모 데이터로 보기]** (예시 데이터로 전체 화면을 바로 봅니다)

### ② 진행 화면 (`/analyzing`)
- 분석이 끝날 때까지 **진행률 막대 + 단계별 실시간 로그**를 보여줍니다
- 파일이 여러 개면 파일별 상태(대기/분석 중/완료)를 함께 표시
- 다 끝나면 **자동으로 분석 결과 화면으로 이동**합니다

### ③ 분석 결과 화면 (`/analysis`) — 핵심 화면
- 상단에서 **'종합'(전체 강의 합산)** 과 **회차별(일자별)** 을 전환할 수 있습니다. 강의가 여러 개면 기본은 **종합**.
- **요약 영역**: 오각형 점수 그래프 + 종합 점수 + AI 분석 요약문
- **상세 영역**: 5개 영역별로 항목 점수표(항목·설명·점수·해설). 강의가 여러 개면 항목별 추이 그래프도 표시
- **최종 피드백**: 강의 전반에 대한 AI 종합 코멘트 + 잘한 점/개선할 점
- 우측 상단 **[출력]** 으로 리포트 생성/인쇄

### ④ 리포트 (`/report`)
- 분석 결과를 **DOCX/HTML 문서로 생성**하거나 **인쇄(PDF 저장)** 할 수 있습니다

### (보조) 비교·추이 (`/compare`)
- 강의가 여러 개일 때 회차별 점수 변화, 영역별 비교를 한 화면에서 봅니다

> **참고**: 실제 분석에는 분석 서버(백엔드)가 켜져 있어야 합니다. 서버 없이 화면 구성만 확인하려면 입력 화면의 **[데모 데이터로 보기]** 를 사용하세요.

---

# 2부. 실행 방법 / 구조 (개발용)

## 빠른 실행

### A) 화면만 보기 — 백엔드 불필요
```bash
npm install
npm run dev
```
→ http://localhost:3000 접속 → **[데모 데이터로 보기]** 클릭 → 예시 데이터로 전체 화면 렌더.

### B) 실제 분석까지 — 백엔드 함께 실행
```bash
# 1) 분석 서버 (별도 터미널, backend/)
#    Gemini API 키 필요 (backend/.env)
uvicorn app.main:app --reload --port 8000

# 2) 프론트엔드 (frontend/)
npm install
cp .env.example .env.local        # 백엔드 주소 설정
npm run dev
```
→ http://localhost:3000 → 파일 첨부 + 강사 ID → **[분석 시작]**

### 프로덕션 빌드
```bash
npm run build && npm run start    # :3000
```

### 환경 변수 (`.env.local`)
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000   # 분석 서버 주소
```

## 기술 스택

- **Next.js 15** (App Router) / **React 19** / **TypeScript**
- **Tailwind CSS** (스타일) · **Recharts** (오각형·추이 그래프) · **SWR**

## 폴더 구조

```
app/
├── page.tsx            # ① 입력 화면 (파일 첨부·메타데이터·분석 시작)
├── analyzing/page.tsx  # ② 진행 화면 (진행률·로그 폴링)
├── analysis/page.tsx   # ③ 분석 결과 (종합/회차별·오각형·표·피드백)
├── compare/page.tsx    # 비교·추이
└── report/page.tsx     # ④ 리포트 생성·다운로드
components/
├── ui/                 # Card, ScoreBadge 등 공통 요소
└── dashboard/          # RadarScore(오각형), TrendChart/FileScoreChart(추이),
                        # ItemTable·CategorySection(표), SummaryBox·FinalFeedback,
                        # TopBar, ExportButton
lib/
├── api.ts              # 백엔드 호출 (분석 시작/진행 조회/종합분석/리포트)
├── types.ts            # 백엔드 스키마 매핑 타입
├── store.ts            # 세션 저장 (분석 결과 / 진행 중 작업)
├── aggregate.ts        # '종합' 카드 계산 (여러 강의 평균 + 추이)
├── catalog.ts          # 5개 영역·항목 메타데이터
├── insights.ts         # 점수 기반 요약·피드백 템플릿 (폴백용)
├── format.ts           # 점수 색상·라벨·날짜 포맷
└── mock.ts             # 데모 데이터
```

## 백엔드 연동

기본 주소 `http://localhost:8000` (`NEXT_PUBLIC_API_BASE_URL`). 사용하는 엔드포인트:

| 동작 | 엔드포인트 | 화면 |
|---|---|---|
| 분석 시작(백그라운드) | `POST /api/v1/analysis/lecture/async` → `{ job_id }` | 입력 |
| 진행 상태 폴링 | `GET /api/v1/analysis/job/{id}` | 진행 |
| 종합 분석·요약(자연어) | `POST /api/v1/analysis/narrative` | 분석 |
| 리포트 생성 | `POST /api/v1/report/generate` | 리포트 |

### 분석 흐름 (데이터 관점)

```
입력 → /lecture/async (파일별 job_id) → store(pending) → /analyzing
   → /job/{id} 폴링 → 완료 시 결과 store(session) → /analysis
   → /narrative 로 요약·최종 피드백(자연어) 생성
```

- **종합 뷰**는 백엔드가 아니라 프론트(`lib/aggregate.buildAggregate`)가 여러 강의를 평균내 만듭니다(추이 기울기 포함).
- **자연어 요약/피드백**(`SummaryBox`, `FinalFeedback`)은 `/narrative` 응답을 표시하고, **호출 실패/백엔드 부재 시 `lib/insights.ts`의 점수 기반 템플릿으로 자동 폴백**합니다 → 백엔드가 없어도 화면이 깨지지 않습니다.
- 항목표(`ItemTable`)의 '해설' = `reason`(왜 이 점수인지) + `근거`(`evidence`).

> **주의**: 백엔드 스키마(`backend/app/analysis/schemas.py`)와 `lib/types.ts`는 **수동 동기화**입니다. 항목 수(진행률의 `total`)는 백엔드가 주는 값을 그대로 표시합니다.
