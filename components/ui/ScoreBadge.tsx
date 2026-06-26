import { fmtScore, scoreColors, scoreLabel } from "@/lib/format";

export function ScoreBadge({
  score,
  showLabel = true,
  size = "md",
}: {
  score: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const c = scoreColors(score);
  const pad =
    size === "lg" ? "px-3 py-1 text-sm" : size === "sm" ? "px-1.5 py-0.5 text-xs" : "px-2 py-0.5 text-xs";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold ${pad}`}
      style={{ backgroundColor: c.bg, color: c.text }}
    >
      <span>{fmtScore(score)}</span>
      {showLabel ? <span className="opacity-80">{scoreLabel(score)}</span> : null}
    </span>
  );
}

// 1~5 점수 막대 (표 안 시각 보조)
export function ScoreBar({ score }: { score: number }) {
  const c = scoreColors(score);
  const pct = (Math.min(5, Math.max(0, score)) / 5) * 100;
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-line">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: c.solid }} />
      </div>
      <span className="tabular-nums text-sm font-semibold" style={{ color: c.text }}>
        {fmtScore(score)}
      </span>
    </div>
  );
}
