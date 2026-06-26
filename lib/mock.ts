// 데모용 목업 스코어카드.
// 백엔드(FastAPI)가 떠 있지 않아도 분석 화면 전체가 렌더되도록 한다.
// 동일 강사의 3개 강의(시계열, 점진적 개선)를 생성한다.

import { CATEGORIES, ITEM_BY_ID, ITEMS } from "./catalog";
import type {
  CategoryScore,
  InstructorScorecard,
  ItemScore,
  TrendPoint,
} from "./types";

const INSTRUCTOR = "INST_김멋사";

// 항목별 근거/강점/개선 (데모 텍스트)
const CANNED: Record<number, Pick<ItemScore, "evidence" | "strengths" | "improvements">> = {
  1: { evidence: "\"음, 그니까 이제...\" 류 담화 표지가 분당 9회 관찰됨", strengths: "후반부로 갈수록 군더더기 표현이 줄어듦", improvements: "도입부의 '이제/그니까' 사용 빈도를 절반으로 줄이기" },
  2: { evidence: "전체 문장의 91%가 종결어미로 마무리됨", strengths: "대부분의 발화가 문장 단위로 완결됨", improvements: "설명 중 끊기는 연결어미 종결을 줄이기" },
  3: { evidence: "격식 존댓말 비율 96%로 일관됨", strengths: "말투가 강의 전반에 걸쳐 일관적", improvements: "간헐적 반말 혼용 4회를 정리하기" },
  4: { evidence: "도입 3분 내 '오늘 배울 내용은' 언급, 순서 제시는 불명확", strengths: "학습 목표를 초반에 제시함", improvements: "목표와 함께 진행 순서(1·2·3)를 명시적으로 안내" },
  5: { evidence: "복습 키워드는 있으나 어절 수 8개로 짧음", strengths: "지난 시간 내용을 잠깐 언급함", improvements: "전날 핵심 개념을 오늘 주제와 인과적으로 연결" },
  6: { evidence: "개념→실습 전환 시 예시 단계 생략 2회", strengths: "전반적으로 개념 우선 설명 구조 유지", improvements: "개념 직후 예시를 거쳐 실습으로 이어가기" },
  7: { evidence: "'핵심은', '중요한 건' 강조 표현 2회", strengths: "핵심 지점을 짚어줌", improvements: "강조 후 한 번 더 풀어 설명하는 재설명 추가" },
  8: { evidence: "마무리에 '오늘 수업 마치겠습니다' 수준의 종료", strengths: "정시에 강의를 마무리함", improvements: "마무리 구간에서 목표 키워드 2~3개를 다시 정리" },
  9: { evidence: "핵심 용어의 정의 커버리지 72%", strengths: "주요 용어 대부분에 정의를 제공", improvements: "신규 용어 등장 후 3문장 내 정의를 붙이기" },
  10: { evidence: "비유·예시 동반 용어 비율 41%", strengths: "일부 개념에 실생활 비유를 사용", improvements: "추상 개념마다 비유를 1개씩 추가" },
  11: { evidence: "주제 전환점 6곳 중 3곳에서 선행 개념 확인", strengths: "절반 정도 전환점에서 연결을 시도", improvements: "전환마다 '앞서 본 X와 연결해서'로 이어가기" },
  12: { evidence: "평균 182 어절/분, 핵심 구간 감속 관찰됨", strengths: "적정 속도 범위 + 핵심부 감속", improvements: "현 속도 유지" },
  13: { evidence: "예시 중 실무 직접 연관 비율 38%", strengths: "수준에 맞는 예시를 다수 사용", improvements: "실제 백엔드 업무 맥락의 예시 비중 높이기" },
  14: { evidence: "이론-실습 코사인 유사도 0.58, 연결 표현 없음", strengths: "실습 구간 자체는 존재", improvements: "'방금 배운 걸 코드로' 같은 명시적 연결 추가" },
  15: { evidence: "오류 발화 3건, 원인 설명 후 해결 안내", strengths: "오류 상황을 회피하지 않고 다룸", improvements: "해결 후 '잘 되셨나요' 확인 단계 추가" },
  16: { evidence: "이해 확인 질문 0.04회/분 (약 25분당 1회)", strengths: "간헐적으로 이해를 확인함", improvements: "10~15분마다 이해 확인 질문 배치" },
  17: { evidence: "참여 유도 1회, 평균 대기 시간 짧음", strengths: "직접 해보도록 유도하는 시도가 있음", improvements: "유도 후 30초 이상 시도 시간 확보 + 결과 확인" },
  18: { evidence: "질문 응답 평균 14어절, 부분 해소", strengths: "질문을 무시하지 않고 답변", improvements: "원인+해결을 포함해 답변 길이·정보량 늘리기" },
};

function buildItems(scores: Record<number, number>): ItemScore[] {
  return ITEMS.map((it) => {
    const s = scores[it.id] ?? 3;
    const c = CANNED[it.id] ?? { evidence: "", strengths: "", improvements: "" };
    return {
      item_id: it.id,
      name: it.name,
      category: it.category,
      item_type: ITEM_BY_ID[it.id]?.category === "structure" ? "discrete" : "high_inference",
      final_score: s,
      llm_score: s,
      bow_score: Math.max(1, Math.min(5, s + (it.id % 2 === 0 ? 0.3 : -0.2))),
      final_confidence: 0.7 + (it.id % 3) * 0.08,
      evidence: c.evidence,
      strengths: c.strengths,
      improvements: c.improvements,
      needs_human_review: s <= 2,
    };
  });
}

function categoryScores(items: ItemScore[]): CategoryScore[] {
  return CATEGORIES.map((c) => {
    const members = items.filter((i) => i.category === c.key);
    const avg = members.reduce((a, b) => a + b.final_score, 0) / members.length;
    return { category: c.key, score: round2(avg), weight: c.weight };
  });
}

function overall(cats: CategoryScore[]): number {
  const tw = cats.reduce((a, b) => a + b.weight, 0);
  return round2(cats.reduce((a, b) => a + b.score * b.weight, 0) / tw);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function makeCard(date: string, scores: Record<number, number>): InstructorScorecard {
  const items = buildItems(scores);
  const cats = categoryScores(items);
  return {
    instructor_id: INSTRUCTOR,
    lecture_date: date,
    overall_score: overall(cats),
    category_scores: cats,
    item_scores: items,
    analyzed_at: `${date}T18:00:00`,
  };
}

// 3개 강의: 점진적 개선 (낮은 항목이 회차마다 오름)
const WEEK1: Record<number, number> = {
  1: 3, 2: 4, 3: 5, 4: 2, 5: 2, 6: 3, 7: 3, 8: 2, 9: 3,
  10: 3, 11: 2, 12: 4, 13: 3, 14: 2, 15: 3, 16: 2, 17: 2, 18: 3,
};
const WEEK2: Record<number, number> = {
  1: 4, 2: 4, 3: 5, 4: 3, 5: 3, 6: 3, 7: 4, 8: 3, 9: 4,
  10: 3, 11: 3, 12: 4, 13: 3, 14: 3, 15: 3, 16: 3, 17: 2, 18: 3,
};
const WEEK3: Record<number, number> = {
  1: 4, 2: 5, 3: 5, 4: 4, 5: 3, 6: 4, 7: 4, 8: 4, 9: 4,
  10: 4, 11: 3, 12: 5, 13: 4, 14: 4, 15: 4, 16: 3, 17: 3, 18: 4,
};

function attachTrend(cards: InstructorScorecard[]): InstructorScorecard[] {
  const points: TrendPoint[] = cards
    .map((c) => ({ date: c.lecture_date, score: c.overall_score }))
    .sort((a, b) => a.date.localeCompare(b.date));
  const slope =
    points.length >= 2
      ? round2(
          (points[points.length - 1].score - points[0].score) /
            (points.length - 1)
        )
      : 0;
  const label = slope >= 0.05 ? "improving" : slope <= -0.05 ? "declining" : "stable";
  return cards.map((c) => ({
    ...c,
    trend_points: points,
    trend_slope: slope,
    trend_label: label,
  }));
}

export const MOCK_CARDS: InstructorScorecard[] = attachTrend([
  makeCard("2026-02-02", WEEK1),
  makeCard("2026-02-09", WEEK2),
  makeCard("2026-02-16", WEEK3),
]);

export function mockSession() {
  return {
    instructorId: INSTRUCTOR,
    scorecards: MOCK_CARDS,
    source: "demo" as const,
    createdAt: "2026-02-16T18:00:00",
  };
}
