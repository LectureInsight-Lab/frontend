import { summaryHeadline, summaryPoints } from "@/lib/insights";
import type { InstructorScorecard } from "@/lib/types";

// 분석 요약문 박스 (요약 + 핵심 피드백)
export function SummaryBox({ card }: { card: InstructorScorecard }) {
  const points = summaryPoints(card);
  return (
    <div className="rounded-2xl border border-line bg-brand-soft p-5">
      <p className="text-sm font-semibold text-brand">분석 요약</p>
      <p className="mt-1 text-lg font-bold text-ink">{summaryHeadline(card)}</p>
      <ul className="mt-3 space-y-1.5">
        {points.map((p, i) => (
          <li key={i} className="flex gap-2 text-sm text-ink">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
            <span className="leading-relaxed">{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
