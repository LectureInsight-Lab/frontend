"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import { CategoryTrendChart } from "@/components/dashboard/CategoryTrendChart";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { CATEGORIES } from "@/lib/catalog";
import { fmtDate, fmtScore, trendMeta } from "@/lib/format";
import { mockSession } from "@/lib/mock";
import { loadSession, type AnalysisSession } from "@/lib/store";

export default function ComparePage() {
  const [session, setSession] = useState<AnalysisSession | null>(null);

  useEffect(() => {
    setSession(loadSession() ?? mockSession());
  }, []);

  if (!session) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-20 text-center text-subtle">
        불러오는 중…
      </main>
    );
  }

  const cards = [...session.scorecards].sort((a, b) =>
    a.lecture_date.localeCompare(b.lecture_date)
  );
  const overall = cards.map((c) => ({
    date: c.lecture_date,
    score: c.overall_score,
  }));
  const latest = cards[cards.length - 1];
  const trend = trendMeta(latest.trend_label);

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-6 py-12">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">비교 / 추이</h1>
          <p className="mt-1 text-sm text-subtle">
            {session.instructorId} · {cards.length}개 강의
          </p>
        </div>
        <Link href="/analysis" className="text-sm text-subtle hover:text-ink">
          ← 분석 화면
        </Link>
      </header>

      {cards.length < 2 ? (
        <Card>
          <CardBody className="py-12 text-center text-subtle">
            추이를 보려면 2개 이상의 강의가 필요합니다.
            <div className="mt-3">
              <Link href="/" className="text-brand hover:underline">
                여러 파일로 다시 분석하기 →
              </Link>
            </div>
          </CardBody>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader
              title="종합 점수 추이"
              desc="강의 회차별 종합 점수 변화"
              right={
                <span
                  className="text-sm font-semibold"
                  style={{ color: trend.color }}
                >
                  {trend.arrow} {trend.label}
                </span>
              }
            />
            <CardBody>
              <TrendChart data={overall} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="카테고리별 점수 비교" desc="강의 × 5개 영역" />
            <CardBody>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="text-left text-xs font-semibold text-subtle">
                      <th className="px-3 py-2">영역</th>
                      {cards.map((c) => (
                        <th
                          key={c.lecture_date}
                          className="px-3 py-2 text-center"
                        >
                          {fmtDate(c.lecture_date)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {CATEGORIES.map((cat) => (
                      <tr key={cat.key} className="border-t border-line">
                        <td className="px-3 py-2 font-medium text-ink">
                          {cat.short}
                        </td>
                        {cards.map((c) => {
                          const cs = c.category_scores.find(
                            (x) => x.category === cat.key
                          );
                          return (
                            <td
                              key={c.lecture_date}
                              className="px-3 py-2 text-center"
                            >
                              <ScoreBadge
                                score={cs?.score ?? 0}
                                showLabel={false}
                                size="sm"
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                    <tr className="border-t border-line bg-canvas">
                      <td className="px-3 py-2 font-semibold text-ink">종합</td>
                      {cards.map((c) => (
                        <td
                          key={c.lecture_date}
                          className="px-3 py-2 text-center font-semibold tabular-nums"
                        >
                          {fmtScore(c.overall_score)}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>

          {CATEGORIES.map((cat) => (
            <Card key={cat.key}>
              <CardHeader title={`${cat.label} — 항목 추이`} />
              <CardBody>
                <CategoryTrendChart cards={cards} category={cat.key} />
              </CardBody>
            </Card>
          ))}
        </>
      )}
    </main>
  );
}
