// 입력 화면 → 분석 화면으로 결과를 넘기기 위한 세션 저장소 (sessionStorage).

import type { InstructorScorecard } from "./types";

const KEY = "lecture-insight:session";

export type AnalysisSource = "api" | "demo";

export type AnalysisSession = {
  instructorId: string;
  scorecards: InstructorScorecard[]; // 파일 1개 또는 다수
  source: AnalysisSource;
  createdAt: string;
};

export function saveSession(s: AnalysisSession): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY, JSON.stringify(s));
}

export function loadSession(): AnalysisSession | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AnalysisSession;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(KEY);
}
