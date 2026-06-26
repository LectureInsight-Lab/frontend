"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { fmtDate, scoreColor } from "@/lib/format";
import type { InstructorScorecard } from "@/lib/types";

// 파일(강의)별 최종 점수 점 그래프 — 다중 파일일 때 사용
type DotProps = { cx?: number; cy?: number; payload?: { score: number } };

function BandDot({ cx, cy, payload }: DotProps) {
  if (cx == null || cy == null || !payload) return null;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={6}
      fill={scoreColor(payload.score)}
      stroke="#ffffff"
      strokeWidth={2}
    />
  );
}

export function FileScoreChart({
  cards,
  height = 220,
}: {
  cards: InstructorScorecard[];
  height?: number;
}) {
  const data = [...cards]
    .sort((a, b) => a.lecture_date.localeCompare(b.lecture_date))
    .map((c) => ({ date: c.lecture_date, score: Number(c.overall_score.toFixed(2)) }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 12, right: 16, bottom: 4, left: -16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eef0f3" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={fmtDate}
          tick={{ fontSize: 12, fill: "#6b7280" }}
          axisLine={{ stroke: "#e6e8ec" }}
          tickLine={false}
        />
        <YAxis
          domain={[1, 5]}
          ticks={[1, 2, 3, 4, 5]}
          tick={{ fontSize: 12, fill: "#6b7280" }}
          axisLine={false}
          tickLine={false}
          width={36}
        />
        <Tooltip
          labelFormatter={(v) => fmtDate(String(v))}
          formatter={(v) => [Number(v).toFixed(2), "종합 점수"]}
          contentStyle={{ borderRadius: 12, border: "1px solid #e6e8ec", fontSize: 13 }}
        />
        <Line
          type="monotone"
          dataKey="score"
          stroke="#c7cad1"
          strokeWidth={2}
          dot={<BandDot />}
          activeDot={{ r: 7 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
