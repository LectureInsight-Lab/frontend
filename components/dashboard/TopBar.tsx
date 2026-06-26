"use client";

import Link from "next/link";

import { ExportButton } from "@/components/dashboard/ExportButton";
import { OVERALL_VIEW } from "@/lib/aggregate";
import { fmtDate } from "@/lib/format";
import type { InstructorScorecard } from "@/lib/types";

// 분석 화면 최상단 바: 강의 메타 + 파일(일자) 선택 + 출력 버튼
export function TopBar({
  cards,
  primary,
  selected,
  onSelect,
  source,
}: {
  cards: InstructorScorecard[];
  primary: InstructorScorecard;
  selected: string; // 선택된 일자 또는 OVERALL_VIEW
  onSelect: (value: string) => void;
  source: "api" | "demo";
}) {
  const ordered = [...cards].sort((a, b) =>
    a.lecture_date.localeCompare(b.lecture_date)
  );

  return (
    <div className="no-print sticky top-0 z-10 border-b border-line bg-surface/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-3">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-sm font-bold text-ink">
            LectureInsight
          </Link>
          <span className="text-line">/</span>
          <span className="text-sm text-subtle">{primary.instructor_id}</span>
          {source === "demo" ? (
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
              데모 데이터
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          {ordered.length > 1 ? (
            <div className="flex items-center gap-1 rounded-lg border border-line bg-canvas p-0.5">
              {ordered.map((c) => {
                const active = c.lecture_date === selected;
                return (
                  <button
                    key={c.lecture_date}
                    onClick={() => onSelect(c.lecture_date)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                      active
                        ? "bg-surface text-ink shadow-sm"
                        : "text-subtle hover:text-ink"
                    }`}
                  >
                    {fmtDate(c.lecture_date)}
                  </button>
                );
              })}
              {/* 최우측: 제공된 모든 강의 종합 */}
              <button
                onClick={() => onSelect(OVERALL_VIEW)}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                  selected === OVERALL_VIEW
                    ? "bg-brand text-white shadow-sm"
                    : "text-brand hover:bg-brand-soft"
                }`}
              >
                종합
              </button>
            </div>
          ) : null}
          <ExportButton card={primary} />
        </div>
      </div>
    </div>
  );
}
