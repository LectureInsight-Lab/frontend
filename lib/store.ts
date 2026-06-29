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

// ── 진행 중 분석 (입력 화면 → /analyzing 으로 넘기는 job 목록) ──
const PENDING_KEY = "lecture-insight:pending";

export type PendingJob = { jobId: string; fileName: string; date: string };

export type PendingAnalysis = {
  instructorId: string;
  jobs: PendingJob[];
  createdAt: string;
};

export function savePending(p: PendingAnalysis): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(PENDING_KEY, JSON.stringify(p));
}

export function loadPending(): PendingAnalysis | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(PENDING_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PendingAnalysis;
  } catch {
    return null;
  }
}

export function clearPending(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(PENDING_KEY);
}
