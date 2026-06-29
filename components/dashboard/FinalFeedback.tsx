import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import { feedbackNarrative, highItems, lowItems } from "@/lib/insights";
import type { InstructorScorecard, ItemScore } from "@/lib/types";

function ItemPill({ item, tone }: { item: ItemScore; tone: "good" | "warn" }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-ink">{item.name}</span>
        <ScoreBadge score={item.final_score} showLabel={false} size="sm" />
      </div>
      <p className="mt-1.5 text-[13px] leading-relaxed text-subtle">
        {tone === "good" ? item.strengths : item.improvements}
      </p>
    </div>
  );
}

// 최종 피드백 — 강의 전반에 대한 LLM 종합 분석(자연어) + 강점/개선 항목.
// overallFeedback 가 없으면(백엔드 미연결/생성 실패) 점수 기반 템플릿으로 폴백.
export function FinalFeedback({
  card,
  overallFeedback,
  loading = false,
}: {
  card: InstructorScorecard;
  overallFeedback?: string | null;
  loading?: boolean;
}) {
  const highs = highItems(card, 3);
  const lows = lowItems(card, 3);

  return (
    <Card>
      <CardHeader title="최종 피드백" desc="강의 전반에 대한 종합 분석" />
      <CardBody className="space-y-5">
        {loading ? (
          <p className="text-[15px] leading-relaxed text-subtle">
            종합 분석 생성 중…
          </p>
        ) : (
          <p className="whitespace-pre-line text-[15px] leading-relaxed text-ink">
            {overallFeedback ?? feedbackNarrative(card)}
          </p>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-semibold text-emerald-700">
              잘하고 있는 점
            </p>
            <div className="space-y-2">
              {highs.map((it) => (
                <ItemPill key={it.item_id} item={it} tone="good" />
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-orange-700">
              우선 개선할 점
            </p>
            <div className="space-y-2">
              {lows.map((it) => (
                <ItemPill key={it.item_id} item={it} tone="warn" />
              ))}
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
