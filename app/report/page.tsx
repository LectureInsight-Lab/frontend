"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import { api, reportDownloadUrl } from "@/lib/api";
import { CATEGORY_LABEL } from "@/lib/catalog";
import { fmtScore } from "@/lib/format";
import { feedbackNarrative } from "@/lib/insights";
import { mockSession } from "@/lib/mock";
import { loadSession, type AnalysisSession } from "@/lib/store";
import type { ReportResponse } from "@/lib/types";

export default function ReportPage() {
  const [session, setSession] = useState<AnalysisSession | null>(null);
  const [date, setDate] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ReportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const s = loadSession() ?? mockSession();
    setSession(s);
    setDate(s.scorecards[s.scorecards.length - 1].lecture_date);
  }, []);

  if (!session) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-20 text-center text-subtle">
        불러오는 중…
      </main>
    );
  }

  const card =
    session.scorecards.find((c) => c.lecture_date === date) ??
    session.scorecards[session.scorecards.length - 1];

  async function generate(formats: string[]) {
    setError(null);
    setResult(null);
    setBusy(true);
    try {
      const res = await api.generateReport(card, formats);
      setResult(res);
    } catch (e) {
      setError(
        `리포트 생성 실패: 백엔드(FastAPI :8000) 실행 여부를 확인하세요.\n${
          e instanceof Error ? e.message : String(e)
        }`
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-6 py-12">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">리포트</h1>
          <p className="mt-1 text-sm text-subtle">
            분석 결과 기반 HTML/DOCX 리포트 생성 및 다운로드
          </p>
        </div>
        <Link href="/analysis" className="text-sm text-subtle hover:text-ink">
          ← 분석 화면
        </Link>
      </header>

      <Card>
        <CardHeader
          title="대상 강의"
          desc={`${card.instructor_id}`}
          right={<ScoreBadge score={card.overall_score} size="lg" />}
        />
        <CardBody className="space-y-4">
          {session.scorecards.length > 1 ? (
            <div>
              <label className="text-sm font-medium text-ink">강의 선택</label>
              <select
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm"
              >
                {session.scorecards.map((c) => (
                  <option key={c.lecture_date} value={c.lecture_date}>
                    {c.lecture_date} (종합 {fmtScore(c.overall_score)})
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {/* 미리보기 */}
          <div className="rounded-xl border border-line bg-canvas p-4">
            <p className="text-sm font-semibold text-ink">미리보기</p>
            <p className="mt-2 text-[13px] leading-relaxed text-subtle">
              {feedbackNarrative(card)}
            </p>
            <ul className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {card.category_scores.map((cs) => (
                <li
                  key={cs.category}
                  className="flex items-center justify-between rounded-lg bg-surface px-3 py-1.5 text-sm"
                >
                  <span className="text-ink">{CATEGORY_LABEL[cs.category]}</span>
                  <ScoreBadge score={cs.score} showLabel={false} size="sm" />
                </li>
              ))}
            </ul>
          </div>

          {error ? (
            <p className="whitespace-pre-line rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          {result ? (
            <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              생성 완료 —{" "}
              {Object.entries(result.download).map(([fmt, path]) => (
                <a
                  key={fmt}
                  href={reportDownloadUrl(path)}
                  target="_blank"
                  rel="noreferrer"
                  className="mr-3 font-semibold underline"
                >
                  {fmt.toUpperCase()} 다운로드
                </a>
              ))}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => generate(["html", "docx"])}
              disabled={busy}
              className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {busy ? "생성 중…" : "리포트 생성 (HTML · DOCX)"}
            </button>
            <button
              onClick={() => window.print()}
              className="rounded-lg border border-line bg-surface px-4 py-2 text-sm font-medium text-ink transition hover:bg-canvas"
            >
              인쇄 · PDF
            </button>
          </div>
        </CardBody>
      </Card>
    </main>
  );
}
