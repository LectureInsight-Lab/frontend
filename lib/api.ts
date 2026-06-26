import type {
  InstructorScorecard,
  LectureRequest,
  ReportResponse,
} from "./types";

export const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  health: () => apiFetch<{ status: string }>("/health"),

  // 단일 강의 분석 → InstructorScorecard
  analyzeLecture: (req: LectureRequest) =>
    apiFetch<InstructorScorecard>("/api/v1/analysis/lecture", {
      method: "POST",
      body: JSON.stringify(req),
    }),

  // 다중 강의 배치 분석 (시계열) → { scorecards, weekly }
  analyzeBatch: (lectures: LectureRequest[]) =>
    apiFetch<{ scorecards: InstructorScorecard[]; weekly: unknown }>(
      "/api/v1/analysis/batch",
      { method: "POST", body: JSON.stringify({ lectures }) }
    ),

  // 강사 누적 이력 조회
  instructorHistory: (instructorId: string) =>
    apiFetch<{
      instructor_id: string;
      scorecards: InstructorScorecard[];
      trend_slope: number;
      trend_label: string;
      weekly: unknown;
    }>(`/api/v1/analysis/instructor/${encodeURIComponent(instructorId)}`),

  // 리포트 생성 (HTML/DOCX) → 다운로드 경로
  generateReport: (
    scorecard: InstructorScorecard,
    formats: string[] = ["html", "docx"]
  ) =>
    apiFetch<ReportResponse>("/api/v1/report/generate", {
      method: "POST",
      body: JSON.stringify({ scorecard, formats }),
    }),
};

// /api/v1/report/download/{file_id} 같은 상대 경로 → 절대 URL
export function reportDownloadUrl(path: string): string {
  return path.startsWith("http") ? path : `${BASE_URL}${path}`;
}
