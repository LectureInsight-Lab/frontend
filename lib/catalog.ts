// 평가 체계 정적 카탈로그.
// backend/configs/checklist.yaml (카테고리 가중치·18항목) 및
// backend/강의_품질_평가_루브릭_v2.md (항목 설명) 와 동기화.

import type { CategoryKey } from "./types";

export type CategoryMeta = {
  key: CategoryKey;
  label: string; // 전체 명칭
  short: string; // 레이더(오각형) 축 라벨
  weight: number; // 종합 점수 가중치
};

// checklist.yaml category_weights 순서/값과 일치 (오각형 축 순서)
export const CATEGORIES: CategoryMeta[] = [
  { key: "language", label: "언어 표현 품질", short: "언어 표현", weight: 0.15 },
  { key: "structure", label: "강의 도입 및 구조", short: "도입·구조", weight: 0.25 },
  { key: "concept", label: "개념 설명 명확성", short: "개념 명확성", weight: 0.25 },
  { key: "practice", label: "예시 및 실습 연계", short: "예시·실습", weight: 0.2 },
  { key: "interaction", label: "수강생 상호작용", short: "상호작용", weight: 0.15 },
];

export const CATEGORY_LABEL: Record<CategoryKey, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, c.label])
) as Record<CategoryKey, string>;

export function categoryMeta(key: CategoryKey): CategoryMeta {
  return CATEGORIES.find((c) => c.key === key) ?? CATEGORIES[0];
}

export type ItemMeta = {
  id: number;
  name: string;
  category: CategoryKey;
  description: string; // "항목 설명" 열에 들어갈 한 줄 정의
};

// 18개 항목 (checklist.yaml 의 id/name/category + 루브릭 조작적 정의 요약)
export const ITEMS: ItemMeta[] = [
  { id: 1, name: "불필요한 반복 표현", category: "language", description: "간투사·담화 표지 등 내용 전달에 기여하지 않는 표현의 빈도" },
  { id: 2, name: "발화 완결성", category: "language", description: "종결어미(EF)로 끝나는 완결 문장의 비율" },
  { id: 3, name: "언어 일관성", category: "language", description: "존댓말/반말 등 지배적 말투를 일관되게 유지하는 정도" },
  { id: 4, name: "학습 목표 안내", category: "structure", description: "도입부에서 학습 목표와 진행 순서를 명시했는가" },
  { id: 5, name: "전날 복습 연계", category: "structure", description: "이전 강의 내용을 복습하고 오늘 주제와 논리적으로 연결했는가" },
  { id: 6, name: "설명 순서", category: "structure", description: "개념→예시→실습의 구조적 진행과 순서 위반 정도" },
  { id: 7, name: "핵심 강조", category: "structure", description: "핵심 내용을 명시적으로 강조하고 심화 재설명했는가" },
  { id: 8, name: "마무리 요약", category: "structure", description: "마무리 구간에서 핵심 내용을 정리·요약했는가" },
  { id: 9, name: "개념 정의", category: "concept", description: "핵심 용어 등장 후 3문장 이내 정의를 제공한 비율" },
  { id: 10, name: "비유/예시 활용", category: "concept", description: "개념에 비유·실생활 예시를 적절히 연결했는가" },
  { id: 11, name: "선행 개념 확인", category: "concept", description: "주제 전환점에서 선행 개념을 확인·연결했는가" },
  { id: 12, name: "발화 속도 적절성", category: "concept", description: "분당 어절 수가 적정 범위이고 핵심 구간에서 감속했는가" },
  { id: 13, name: "예시 적절성", category: "practice", description: "예시가 수강생 수준·실무 현장과 연관성이 있는가" },
  { id: 14, name: "실습 연계", category: "practice", description: "이론과 실습이 동일 주제로 명시적으로 연결됐는가" },
  { id: 15, name: "오류 대응", category: "practice", description: "오류 발생 시 원인 설명·단계적 해결·확인을 했는가" },
  { id: 16, name: "이해 확인 질문", category: "interaction", description: "이해 여부를 확인하는 질문의 빈도와 타이밍" },
  { id: 17, name: "참여 유도", category: "interaction", description: "직접 시도를 유도하고 시도 시간·결과 확인을 제공했는가" },
  { id: 18, name: "질문 응답 충분성", category: "interaction", description: "질문에 충분한 길이·정보 밀도로 답했는가" },
];

export const ITEM_BY_ID: Record<number, ItemMeta> = Object.fromEntries(
  ITEMS.map((it) => [it.id, it])
);

export function itemsOfCategory(key: CategoryKey): ItemMeta[] {
  return ITEMS.filter((it) => it.category === key);
}
