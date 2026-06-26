// 백엔드 스키마(app/analysis/schemas.py)와 동기화 필요.

export type Evidence = {
  excerpt: string;
  comment: string;
  timestamp?: string;
};

export type CriterionResult = {
  criterion: string;
  score: number;
  summary: string;
  evidences: Evidence[];
  suggestions: string[];
};

export type LectureAnalysis = {
  lecture_id: string;
  instructor_id: string;
  criteria: CriterionResult[];
  overall_score: number;
};
