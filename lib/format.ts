// 점수 → 밴드/색상/라벨 변환 유틸.
// 동적 색상은 Tailwind purge 영향을 피하기 위해 inline style 로 사용한다.

import type { TrendLabel } from "./types";

export type Band = 1 | 2 | 3 | 4 | 5;

export const SCORE_LABEL: Record<Band, string> = {
  5: "우수",
  4: "양호",
  3: "보통",
  2: "미흡",
  1: "부족",
};

export function scoreBand(score: number): Band {
  const r = Math.round(score);
  return Math.min(5, Math.max(1, r)) as Band;
}

export type BandColor = { solid: string; bg: string; text: string };

// 밴드별 색상 (1 부족 → 5 우수)
export const BAND_COLOR: Record<Band, BandColor> = {
  5: { solid: "#059669", bg: "#ecfdf5", text: "#047857" },
  4: { solid: "#65a30d", bg: "#f7fee7", text: "#4d7c0f" },
  3: { solid: "#d97706", bg: "#fffbeb", text: "#b45309" },
  2: { solid: "#ea580c", bg: "#fff7ed", text: "#c2410c" },
  1: { solid: "#dc2626", bg: "#fef2f2", text: "#b91c1c" },
};

export function scoreColor(score: number): string {
  return BAND_COLOR[scoreBand(score)].solid;
}

export function scoreColors(score: number): BandColor {
  return BAND_COLOR[scoreBand(score)];
}

export function scoreLabel(score: number): string {
  return SCORE_LABEL[scoreBand(score)];
}

export function fmtScore(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "–";
  return n.toFixed(1);
}

export type TrendMeta = { label: string; color: string; arrow: string };

export function trendMeta(label: TrendLabel | null | undefined): TrendMeta {
  switch (label) {
    case "improving":
      return { label: "상승", color: "#059669", arrow: "▲" };
    case "declining":
      return { label: "하락", color: "#dc2626", arrow: "▼" };
    default:
      return { label: "유지", color: "#64748b", arrow: "▬" };
  }
}

export function fmtDate(date: string): string {
  // "2026-02-02" → "02.02"
  const parts = date.split("-");
  if (parts.length === 3) return `${parts[1]}.${parts[2]}`;
  return date;
}
