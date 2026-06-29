import { ITEM_BY_ID } from "@/lib/catalog";
import { ScoreBar } from "@/components/ui/ScoreBadge";
import type { ItemScore } from "@/lib/types";

// 중분류 표: 항목 | 항목 설명 | 점수 | 해설
export function ItemTable({ items }: { items: ItemScore[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-line">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-canvas text-left text-xs font-semibold text-subtle">
            <th className="w-[18%] px-4 py-2.5">항목</th>
            <th className="w-[28%] px-4 py-2.5">항목 설명</th>
            <th className="w-[14%] px-4 py-2.5">점수</th>
            <th className="px-4 py-2.5">해설</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => {
            const meta = ITEM_BY_ID[it.item_id];
            return (
              <tr key={it.item_id} className="border-t border-line align-top">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 font-medium text-ink">
                    <span className="tabular-nums text-xs text-subtle">
                      {it.item_id}
                    </span>
                    <span>{it.name}</span>
                  </div>
                  {it.needs_human_review ? (
                    <span className="mt-1 inline-block rounded bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-700">
                      검토 권장
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-subtle">
                  {meta?.description ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <ScoreBar score={it.final_score} />
                </td>
                <td className="px-4 py-3 text-ink">
                  {/* 해설 = '왜 이 점수인지' (고득점→잘한 점, 저득점→부족한 점).
                      개선 코칭은 하단 '최종 피드백'에서 다룬다. */}
                  {it.reason || it.improvements ? (
                    <p className="text-[13px] leading-relaxed text-ink">
                      {it.reason || it.improvements}
                    </p>
                  ) : null}
                  {it.evidence ? (
                    <p className="mt-1 text-[13px] leading-relaxed text-subtle">
                      <span className="font-medium text-ink">근거 </span>
                      {it.evidence}
                    </p>
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
