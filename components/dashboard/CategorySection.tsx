import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import { CategoryTrendChart } from "@/components/dashboard/CategoryTrendChart";
import { ItemTable } from "@/components/dashboard/ItemTable";
import { categoryMeta } from "@/lib/catalog";
import type { CategoryKey, InstructorScorecard } from "@/lib/types";

// 중분류(카테고리) 하나: 타이틀 + 점수 + 표 + (다중 파일 시) 항목별 추이
export function CategorySection({
  category,
  primary,
  cards,
}: {
  category: CategoryKey;
  primary: InstructorScorecard; // 표·점수 기준이 되는 강의
  cards: InstructorScorecard[]; // 추이용 전체 강의
}) {
  const meta = categoryMeta(category);
  const cs = primary.category_scores.find((c) => c.category === category);
  const items = primary.item_scores.filter((i) => i.category === category);
  const multi = cards.length > 1;

  return (
    <Card>
      <CardHeader
        title={meta.label}
        desc={`가중치 ${Math.round(meta.weight * 100)}% · ${items.length}개 항목`}
        right={cs ? <ScoreBadge score={cs.score} size="lg" /> : null}
      />
      <CardBody className="space-y-4">
        <ItemTable items={items} />
        {multi ? (
          <div className="rounded-xl border border-line p-3">
            <p className="mb-1 px-1 text-xs font-semibold text-subtle">
              항목별 점수 추이
            </p>
            <CategoryTrendChart cards={cards} category={category} />
          </div>
        ) : null}
      </CardBody>
    </Card>
  );
}
