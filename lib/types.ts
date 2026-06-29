// 백엔드 스키마(backend/app/analysis/schemas.py: InstructorScorecard)와 동기화.
// 분석 응답의 정본 타입. 변경 시 schemas.py 와 함께 수정할 것.

export type CategoryKey =
  | "language"
  | "structure"
  | "concept"
  | "practice"
  | "interaction";

export type ItemType = "discrete" | "high_inference";

export type CategoryScore = {
  category: CategoryKey;
  score: number; // 카테고리 내 평균 (1~5)
  weight: number; // 종합 점수 가중치
};

export type ItemScore = {
  item_id: number;
  name: string;
  category: CategoryKey;
  item_type: ItemType;
  final_score: number; // 1~5
  llm_score: number;
  bow_score: number;
  final_confidence: number; // 0~1
  evidence: string;
  reason?: string; // 점수 근거 해설 (왜 이 점수인지) — 항목표 '해설' 칸
  strengths: string;
  improvements: string;
  needs_human_review: boolean;
};

export type TrendLabel = "improving" | "stable" | "declining";

export type TrendPoint = { date: string; score: number };

export type InstructorScorecard = {
  instructor_id: string;
  lecture_date: string; // YYYY-MM-DD
  overall_score: number; // 1~5
  category_scores: CategoryScore[];
  item_scores: ItemScore[]; // 18개
  trend_slope?: number | null;
  trend_label?: TrendLabel | null;
  trend_points?: TrendPoint[];
  analyzed_at?: string;
};

// POST /api/v1/analysis/lecture 요청 본문
export type LectureRequest = {
  instructor_id: string;
  lecture_date: string; // YYYY-MM-DD
  raw_text?: string;
  course_id?: string;
};

// POST /api/v1/report/generate 응답
export type ReportResponse = {
  files: Record<string, string>;
  download: Record<string, string>;
};

// 비동기 분석 작업 진행 상태 (GET /api/v1/analysis/job/{id})
export type JobLog = { ts: string; level: string; message: string };

export type JobStatusValue = "pending" | "running" | "done" | "error";

export type JobStatus = {
  job_id: string;
  label?: string;
  status: JobStatusValue;
  percent: number;
  stage: string;
  completed: number;
  total: number;
  logs: JobLog[];
  result?: InstructorScorecard | null;
  error?: string | null;
};
