// 스코어카드에서 요약문/피드백을 결정적으로 생성한다.
// (백엔드는 서술형 요약을 따로 주지 않으므로 점수 구조에서 파생)

import { CATEGORY_LABEL } from "./catalog";
import { fmtScore, scoreLabel, trendMeta } from "./format";
import type { CategoryScore, InstructorScorecard, ItemScore } from "./types";

export function sortedCategories(card: InstructorScorecard): CategoryScore[] {
  return [...card.category_scores].sort((a, b) => b.score - a.score);
}

export function bestCategory(card: InstructorScorecard): CategoryScore | null {
  return sortedCategories(card)[0] ?? null;
}

export function worstCategory(card: InstructorScorecard): CategoryScore | null {
  const s = sortedCategories(card);
  return s[s.length - 1] ?? null;
}

export function lowItems(card: InstructorScorecard, n = 3): ItemScore[] {
  return [...card.item_scores]
    .sort((a, b) => a.final_score - b.final_score)
    .slice(0, n);
}

export function highItems(card: InstructorScorecard, n = 3): ItemScore[] {
  return [...card.item_scores]
    .sort((a, b) => b.final_score - a.final_score)
    .slice(0, n);
}

export function reviewItems(card: InstructorScorecard): ItemScore[] {
  return card.item_scores.filter(
    (it) => it.needs_human_review || it.final_score <= 2
  );
}

export function summaryHeadline(card: InstructorScorecard): string {
  return `종합 ${fmtScore(card.overall_score)} / 5.0 — ${scoreLabel(
    card.overall_score
  )}`;
}

export function summaryPoints(card: InstructorScorecard): string[] {
  const points: string[] = [];
  const best = bestCategory(card);
  const worst = worstCategory(card);
  if (best && worst && best.category !== worst.category) {
    points.push(
      `가장 강한 영역은 '${CATEGORY_LABEL[best.category]}'(${fmtScore(
        best.score
      )}점), 가장 약한 영역은 '${CATEGORY_LABEL[worst.category]}'(${fmtScore(
        worst.score
      )}점)입니다.`
    );
  }
  const lows = lowItems(card, 3).filter((it) => it.final_score <= 3);
  if (lows.length) {
    points.push(
      `우선 점검이 필요한 항목: ${lows.map((it) => it.name).join(", ")}.`
    );
  }
  const review = reviewItems(card);
  if (review.length) {
    points.push(`사람 검토 권장 항목 ${review.length}건이 표시되어 있습니다.`);
  }
  const tp = card.trend_points ?? [];
  if (tp.length >= 2 && card.trend_label) {
    const t = trendMeta(card.trend_label);
    points.push(
      `최근 ${tp.length}개 강의 추이는 '${t.label}' 흐름입니다 (기울기 ${fmtScore(
        card.trend_slope ?? 0
      )}).`
    );
  }
  return points;
}

export function feedbackNarrative(card: InstructorScorecard): string {
  const worst = worstCategory(card);
  const lows = lowItems(card, 3);
  const highs = highItems(card, 2);
  const segments: string[] = [];

  segments.push(
    `이번 강의의 종합 점수는 ${fmtScore(card.overall_score)}점으로 '${scoreLabel(
      card.overall_score
    )}' 수준입니다.`
  );

  if (highs.length) {
    segments.push(
      `${highs
        .map((it) => `'${it.name}'(${fmtScore(it.final_score)})`)
        .join("과 ")} 항목이 특히 안정적입니다.`
    );
  }

  if (worst) {
    segments.push(
      `반면 '${CATEGORY_LABEL[worst.category]}' 영역이 ${fmtScore(
        worst.score
      )}점으로 가장 낮아 우선 개선 대상입니다.`
    );
  }

  if (lows.length) {
    segments.push(
      `구체적으로 ${lows
        .map((it) => `'${it.name}'`)
        .join(", ")} 항목의 개선이 종합 점수 향상에 가장 효과적입니다.`
    );
  }

  return segments.join(" ");
}
