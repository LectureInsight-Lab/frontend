// 여러 강의(파일)를 하나로 종합한 합성 스코어카드.
// "종합" 뷰는 이 카드를 기존 컴포넌트(RadarScore/CategorySection/...)에 그대로 먹인다.

import { CATEGORIES } from "./catalog";
import type {
  CategoryScore,
  InstructorScorecard,
  ItemScore,
  TrendPoint,
} from "./types";

// 일자 선택과 구분되는 "종합" 뷰 식별자
export const OVERALL_VIEW = "__all__";

function mean(xs: number[]): number {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// 제공된 모든 강의의 항목/카테고리 점수를 평균내 종합 카드를 만든다.
export function buildAggregate(cards: InstructorScorecard[]): InstructorScorecard {
  const ordered = [...cards].sort((a, b) =>
    a.lecture_date.localeCompare(b.lecture_date)
  );
  const latest = ordered[ordered.length - 1];
  const first = ordered[0];

  // 항목별 평균 (해설 텍스트는 가장 최근 강의 기준으로 표기)
  const ids = [...latest.item_scores]
    .map((i) => i.item_id)
    .sort((a, b) => a - b);

  const item_scores: ItemScore[] = ids.map((id) => {
    const variants = ordered
      .map((c) => c.item_scores.find((i) => i.item_id === id))
      .filter((v): v is ItemScore => Boolean(v));
    const last = variants[variants.length - 1];
    return {
      ...last,
      final_score: round2(mean(variants.map((v) => v.final_score))),
      llm_score: round2(mean(variants.map((v) => v.llm_score))),
      bow_score: round2(mean(variants.map((v) => v.bow_score))),
      final_confidence: round2(mean(variants.map((v) => v.final_confidence))),
      needs_human_review: variants.some((v) => v.needs_human_review),
    };
  });

  const category_scores: CategoryScore[] = CATEGORIES.map((c) => {
    const members = item_scores.filter((i) => i.category === c.key);
    return {
      category: c.key,
      score: round2(mean(members.map((m) => m.final_score))),
      weight: c.weight,
    };
  });

  const totalWeight = category_scores.reduce((a, b) => a + b.weight, 0);
  const overall_score = round2(
    category_scores.reduce((a, b) => a + b.score * b.weight, 0) / totalWeight
  );

  const trend_points: TrendPoint[] =
    latest.trend_points && latest.trend_points.length
      ? latest.trend_points
      : ordered.map((c) => ({ date: c.lecture_date, score: c.overall_score }));

  return {
    instructor_id: latest.instructor_id,
    lecture_date: `${first.lecture_date} ~ ${latest.lecture_date}`,
    overall_score,
    category_scores,
    item_scores,
    trend_slope: latest.trend_slope ?? null,
    trend_label: latest.trend_label ?? null,
    trend_points,
  };
}
