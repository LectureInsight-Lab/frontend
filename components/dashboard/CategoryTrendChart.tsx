"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { itemsOfCategory } from "@/lib/catalog";
import { fmtDate } from "@/lib/format";
import type { CategoryKey, InstructorScorecard } from "@/lib/types";

const LINE_COLORS = ["#4f46e5", "#0891b2", "#db2777", "#ea580c", "#16a34a"];

// 한 카테고리에 속한 항목들의 점수 추이 (파일 여러 개)
export function CategoryTrendChart({
  cards,
  category,
  height = 240,
}: {
  cards: InstructorScorecard[];
  category: CategoryKey;
  height?: number;
}) {
  const items = itemsOfCategory(category);
  const ordered = [...cards].sort((a, b) =>
    a.lecture_date.localeCompare(b.lecture_date)
  );

  const data = ordered.map((card) => {
    const row: Record<string, string | number> = { date: card.lecture_date };
    for (const it of items) {
      const sc = card.item_scores.find((s) => s.item_id === it.id);
      if (sc) row[it.name] = Number(sc.final_score.toFixed(2));
    }
    return row;
  });

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 16, bottom: 4, left: -16 }}>
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
          contentStyle={{ borderRadius: 12, border: "1px solid #e6e8ec", fontSize: 12 }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {items.map((it, i) => (
          <Line
            key={it.id}
            type="monotone"
            dataKey={it.name}
            stroke={LINE_COLORS[i % LINE_COLORS.length]}
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
