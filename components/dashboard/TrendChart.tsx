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

import { fmtDate } from "@/lib/format";

export type TrendDatum = { date: string; score: number };

// 단일 시계열 추이 (종합 점수 등)
export function TrendChart({
  data,
  color = "#4f46e5",
  height = 220,
}: {
  data: TrendDatum[];
  color?: string;
  height?: number;
}) {
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
          formatter={(v) => [Number(v).toFixed(2), "종합"]}
          contentStyle={{ borderRadius: 12, border: "1px solid #e6e8ec", fontSize: 13 }}
        />
        <Line
          type="monotone"
          dataKey="score"
          stroke={color}
          strokeWidth={2.5}
          dot={{ r: 4, fill: color }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
