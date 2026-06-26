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
