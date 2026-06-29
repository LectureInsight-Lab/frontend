"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import { CategorySection } from "@/components/dashboard/CategorySection";
import { FileScoreChart } from "@/components/dashboard/FileScoreChart";
import { FinalFeedback } from "@/components/dashboard/FinalFeedback";
import { RadarScore } from "@/components/dashboard/RadarScore";
import { SummaryBox } from "@/components/dashboard/SummaryBox";
import { TopBar } from "@/components/dashboard/TopBar";
import { api } from "@/lib/api";
import { OVERALL_VIEW, buildAggregate } from "@/lib/aggregate";
import { CATEGORIES } from "@/lib/catalog";
import { fmtScore, trendMeta } from "@/lib/format";
import { mockSession } from "@/lib/mock";
import { loadSession, type AnalysisSession } from "@/lib/store";
import type { InstructorScorecard } from "@/lib/types";

// 분석 완료 후 기본 선택: 강의가 여러 개면 '종합'(최종), 하나면 그 강의
function initialView(cards: InstructorScorecard[]): string {
  return cards.length > 1 ? OVERALL_VIEW : cards[0].lecture_date;
}

export default function AnalysisPage() {
  const [session, setSession] = useState<AnalysisSession | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [narrative, setNarrative] = useState<{
    overall_feedback: string;
    summary: string;
  } | null>(null);
  const [narrLoading, setNarrLoading] = useState(false);

  useEffect(() => {
    const s = loadSession() ?? mockSession();
    setSession(s);
    setDate(initialView(s.scorecards));
  }, []);

  // 보고 있는 카드(단일 일자/종합)가 바뀌면 종합 분석+요약을 백엔드에서 생성.
  // 흐름: 최종 분석(overall_feedback) → 그 요약(summary)을 한 번의 호출로 받는다.
  useEffect(() => {
    if (!session || !date) return;
    const cards = [...session.scorecards].sort((a, b) =>
      a.lecture_date.localeCompare(b.lecture_date)
    );
    const isOverall = date === OVERALL_VIEW;
    const card = isOverall
      ? buildAggregate(cards)
      : cards.find((c) => c.lecture_date === date) ?? cards[cards.length - 1];

    let cancelled = false;
    setNarrLoading(true);
    setNarrative(null);
    api
      .narrative(card, isOverall, cards.length)
      .then((n) => {
        if (!cancelled) setNarrative(n);
      })
      .catch(() => {
        if (!cancelled) setNarrative(null); // 폴백: 컴포넌트가 템플릿 표시
      })
      .finally(() => {
        if (!cancelled) setNarrLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [session, date]);

  if (!session || !date) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-20 text-center text-subtle">
        분석 결과를 불러오는 중…
      </main>
    );
  }

  const cards = [...session.scorecards].sort((a, b) =>
    a.lecture_date.localeCompare(b.lecture_date)
  );
  const multi = cards.length > 1;
  const isOverall = date === OVERALL_VIEW;
  const primary = isOverall
    ? buildAggregate(cards)
    : cards.find((c) => c.lecture_date === date) ?? cards[cards.length - 1];
  const trend = trendMeta(primary.trend_label);

  return (
    <div className="min-h-screen">
      <TopBar
        cards={cards}
        primary={primary}
        selected={date}
        onSelect={setDate}
        source={session.source}
      />

      <main className="mx-auto max-w-6xl space-y-8 px-6 py-8">
        <header className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-ink">
              강의 분석 리포트{isOverall ? " — 전체 기간 종합" : ""}
            </h1>
            <p className="mt-1 text-sm text-subtle">
              {primary.instructor_id} ·{" "}
              {isOverall
                ? `${cards.length}개 강의 종합 (${primary.lecture_date})`
                : primary.lecture_date}
            </p>
          </div>
        </header>

        {/* ── 요약 ── */}
        <section className="space-y-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-subtle">
            요약
          </h2>

          <Card>
            <CardHeader title="종합 평가" desc="카테고리 5축 종합 점수" />
            <CardBody>
              <div className="grid gap-6 md:grid-cols-2">
                {/* 왼쪽: 오각형 */}
                <div className="flex items-center justify-center">
                  <div className="w-full">
                    <RadarScore card={primary} />
                  </div>
                </div>

                {/* 오른쪽: 설명 (최종 점수 + 카테고리 분해) */}
                <div className="flex flex-col justify-center">
                  <div className="flex items-baseline gap-3">
                    <span
                      className="text-5xl font-extrabold tabular-nums"
                      style={{ color: trend.color }}
                    >
                      {fmtScore(primary.overall_score)}
                    </span>
                    <span className="text-lg text-subtle">/ 5.0</span>
                    <ScoreBadge score={primary.overall_score} size="lg" />
                  </div>
                  {multi ? (
                    <p className="mt-1 text-sm" style={{ color: trend.color }}>
                      {trend.arrow} 추이 {trend.label} (기울기{" "}
                      {fmtScore(primary.trend_slope ?? 0)})
                    </p>
                  ) : null}

                  <ul className="mt-5 space-y-2.5">
                    {CATEGORIES.map((c) => {
                      const cs = primary.category_scores.find(
                        (x) => x.category === c.key
                      );
                      const score = cs?.score ?? 0;
                      return (
                        <li key={c.key} className="flex items-center gap-3">
                          <span className="w-24 shrink-0 text-sm text-ink">
                            {c.short}
                          </span>
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-line">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${(score / 5) * 100}%`,
                                backgroundColor: trendMeta(null).color,
                              }}
                            />
                          </div>
                          <span className="w-20 text-right text-sm">
                            <ScoreBadge
                              score={score}
                              showLabel={false}
                              size="sm"
                            />
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </CardBody>
          </Card>

          <SummaryBox
            card={primary}
            summary={narrative?.summary}
            loading={narrLoading}
          />

          {/* 파일 다수일 경우: 강의별 최종 점수 점 그래프 */}
          {multi ? (
            <Card>
              <CardHeader
                title="강의별 종합 점수 추이"
                desc="각 강의(일자)의 최종 점수"
              />
              <CardBody>
                <FileScoreChart cards={cards} />
              </CardBody>
            </Card>
          ) : null}
        </section>

        {/* ── 상세 설명 ── */}
        <section className="space-y-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-subtle">
            상세 설명
          </h2>
          {CATEGORIES.map((c) => (
            <CategorySection
              key={c.key}
              category={c.key}
              primary={primary}
              cards={cards}
            />
          ))}
        </section>

        {/* ── 최종 피드백 ── */}
        <section className="space-y-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-subtle">
            최종 피드백
          </h2>
          <FinalFeedback
            card={primary}
            overallFeedback={narrative?.overall_feedback}
            loading={narrLoading}
          />
        </section>

        <footer className="no-print flex justify-between border-t border-line pt-6 text-sm">
          <Link href="/" className="text-subtle hover:text-ink">
            ← 새 분석
          </Link>
          <Link href="/compare" className="text-subtle hover:text-ink">
            비교 / 추이 →
          </Link>
        </footer>
      </main>
    </div>
  );
}
