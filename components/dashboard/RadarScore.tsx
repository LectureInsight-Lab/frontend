"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";

import { CATEGORIES } from "@/lib/catalog";
import { scoreColor } from "@/lib/format";
import type { InstructorScorecard } from "@/lib/types";

// 오각형(5축) 종합 그래프 — 카테고리 평균 점수
export function RadarScore({
  card,
  height = 300,
}: {
  card: InstructorScorecard;
  height?: number;
}) {
  const data = CATEGORIES.map((c) => {
    const cs = card.category_scores.find((x) => x.category === c.key);
    return { axis: c.short, score: cs ? Number(cs.score.toFixed(2)) : 0 };
  });
  const color = scoreColor(card.overall_score);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data} outerRadius="70%">
        <PolarGrid stroke="#e6e8ec" />
        <PolarAngleAxis
          dataKey="axis"
          tick={{ fontSize: 12, fill: "#16181d" }}
        />
        <PolarRadiusAxis
          domain={[0, 5]}
          tickCount={6}
          tick={false}
          axisLine={false}
        />
        <Radar
          dataKey="score"
          stroke={color}
          fill={color}
          fillOpacity={0.22}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
