import { summaryHeadline, summaryPoints } from "@/lib/insights";
import type { InstructorScorecard } from "@/lib/types";

// 분석 요약문 박스 — 하단 '최종 피드백(종합 분석)'을 LLM이 요약한 문장을 표시.
// summary 가 없으면(백엔드 미연결/생성 실패) 점수 기반 템플릿으로 폴백.
export function SummaryBox({
  card,
  summary,
  loading = false,
}: {
  card: InstructorScorecard;
  summary?: string | null;
  loading?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-line bg-brand-soft p-5">
      <p className="text-sm font-semibold text-brand">분석 요약</p>
      <p className="mt-1 text-lg font-bold text-ink">{summaryHeadline(card)}</p>
      {loading ? (
        <p className="mt-3 text-sm text-subtle">요약 생성 중…</p>
      ) : summary ? (
        <p className="mt-3 text-sm leading-relaxed text-ink">{summary}</p>
      ) : (
        <ul className="mt-3 space-y-1.5">
          {summaryPoints(card).map((p, i) => (
            <li key={i} className="flex gap-2 text-sm text-ink">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
              <span className="leading-relaxed">{p}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
