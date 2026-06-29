"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { api } from "@/lib/api";
import {
  clearPending,
  loadPending,
  saveSession,
  type PendingAnalysis,
} from "@/lib/store";
import type { InstructorScorecard, JobStatus } from "@/lib/types";

const POLL_MS = 1200;

const STATUS_LABEL: Record<JobStatus["status"], string> = {
  pending: "대기",
  running: "분석 중",
  done: "완료",
  error: "오류",
};

const STATUS_COLOR: Record<JobStatus["status"], string> = {
  pending: "#94a3b8",
  running: "#4f46e5",
  done: "#059669",
  error: "#dc2626",
};

const LOG_COLOR: Record<string, string> = {
  info: "#cbd5e1",
  success: "#6ee7b7",
  error: "#fca5a5",
};

export default function AnalyzingPage() {
  const router = useRouter();
  const [pending, setPending] = useState<PendingAnalysis | null>(null);
  const [statuses, setStatuses] = useState<Record<string, JobStatus>>({});
  const [error, setError] = useState<string | null>(null);
  const stoppedRef = useRef(false);
  const logRef = useRef<HTMLDivElement | null>(null);

  // 1) 대기 중 작업 로드 (없으면 입력 화면으로)
  useEffect(() => {
    const p = loadPending();
    if (!p || p.jobs.length === 0) {
      router.replace("/");
      return;
    }
    setPending(p);
  }, [router]);

  // 2) 폴링
  useEffect(() => {
    if (!pending) return;
    let cancelled = false;

    async function tick() {
      if (stoppedRef.current) return;
      const results = await Promise.all(
        pending!.jobs.map((j) => api.jobStatus(j.jobId).catch(() => null))
      );
      if (cancelled) return;

      const map: Record<string, JobStatus> = {};
      results.forEach((s, i) => {
        if (s) map[pending!.jobs[i].jobId] = s;
      });
      setStatuses(map);

      const all = pending!.jobs
        .map((j) => map[j.jobId])
        .filter((s): s is JobStatus => Boolean(s));

      const failed = all.find((s) => s.status === "error");
      if (failed) {
        stoppedRef.current = true;
        setError(failed.error ?? "분석 중 오류가 발생했습니다.");
        return;
      }

      const allDone =
        all.length === pending!.jobs.length &&
        all.every((s) => s.status === "done");
      if (allDone) {
        stoppedRef.current = true;
        const scorecards = all
          .map((s) => s.result)
          .filter((r): r is InstructorScorecard => Boolean(r));
        saveSession({
          instructorId: pending!.instructorId,
          scorecards,
          source: "api",
          createdAt: new Date().toISOString(),
        });
        clearPending();
        router.replace("/analysis");
      }
    }

    tick();
    const id = setInterval(tick, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [pending, router]);

  const jobs = pending?.jobs ?? [];
  const multi = jobs.length > 1;

  const overall = useMemo(() => {
    if (jobs.length === 0) return 0;
    const sum = jobs.reduce((a, j) => a + (statuses[j.jobId]?.percent ?? 0), 0);
    return Math.round(sum / jobs.length);
  }, [jobs, statuses]);

  // 로그 병합 (다중 파일이면 파일명 태그)
  const logLines = useMemo(() => {
    const lines: { ts: string; level: string; text: string }[] = [];
    for (const j of jobs) {
      const s = statuses[j.jobId];
      if (!s) continue;
      for (const l of s.logs) {
        lines.push({
          ts: l.ts,
          level: l.level,
          text: multi ? `[${j.fileName}] ${l.message}` : l.message,
        });
      }
    }
    return lines.slice(-60);
  }, [jobs, statuses, multi]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [logLines]);

  const currentStage =
    jobs.map((j) => statuses[j.jobId]).find((s) => s?.status === "running")
      ?.stage ?? "작업을 준비하고 있습니다…";

  function cancelAndBack() {
    stoppedRef.current = true;
    clearPending();
    router.replace("/");
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-ink">강의 분석 진행 중</h1>
        <p className="mt-1 text-sm text-subtle">
          {pending?.instructorId}
          {multi ? ` · ${jobs.length}개 강의` : ""}
        </p>
      </header>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="font-semibold text-red-700">분석 실패</p>
          <p className="mt-2 whitespace-pre-line text-sm text-red-600">{error}</p>
          <button
            onClick={cancelAndBack}
            className="mt-4 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            입력 화면으로
          </button>
        </div>
      ) : (
        <>
          {/* 전체 진행률 */}
          <div className="rounded-2xl border border-line bg-surface p-6 shadow-card">
            <div className="flex items-end justify-between">
              <span className="text-sm font-medium text-ink">{currentStage}</span>
              <span className="text-3xl font-extrabold tabular-nums text-brand">
                {overall}%
              </span>
            </div>
            <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-line">
              <div
                className="h-full rounded-full bg-brand transition-all duration-500"
                style={{ width: `${overall}%` }}
              />
            </div>

            {/* 파일별 상태 */}
            <ul className="mt-5 space-y-2">
              {jobs.map((j) => {
                const s = statuses[j.jobId];
                const st = s?.status ?? "pending";
                return (
                  <li
                    key={j.jobId}
                    className="flex items-center gap-3 rounded-lg bg-canvas px-3 py-2 text-sm"
                  >
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: STATUS_COLOR[st] }}
                    />
                    <span className="min-w-0 flex-1 truncate text-ink">
                      {j.fileName}
                    </span>
                    {s && s.total > 0 ? (
                      <span className="tabular-nums text-xs text-subtle">
                        {s.completed}/{s.total} 항목
                      </span>
                    ) : null}
                    <span
                      className="w-14 text-right text-xs font-medium"
                      style={{ color: STATUS_COLOR[st] }}
                    >
                      {STATUS_LABEL[st]}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* 실시간 로그 콘솔 */}
          <div className="mt-5 overflow-hidden rounded-2xl border border-line">
            <div className="flex items-center justify-between border-b border-line bg-canvas px-4 py-2">
              <span className="text-xs font-semibold text-subtle">진행 로그</span>
              <span className="text-xs text-subtle">{logLines.length}건</span>
            </div>
            <div
              ref={logRef}
              className="h-64 overflow-y-auto bg-[#0f1115] px-4 py-3 font-mono text-xs leading-relaxed"
            >
              {logLines.length === 0 ? (
                <p className="text-slate-500">로그 수신 대기 중…</p>
              ) : (
                logLines.map((l, i) => (
                  <p key={i} style={{ color: LOG_COLOR[l.level] ?? "#cbd5e1" }}>
                    <span className="text-slate-500">{l.ts}</span> {l.text}
                  </p>
                ))
              )}
            </div>
          </div>

          <div className="mt-5 text-center">
            <button
              onClick={cancelAndBack}
              className="text-sm text-subtle underline-offset-4 hover:underline"
            >
              취소하고 돌아가기
            </button>
          </div>
        </>
      )}
    </main>
  );
}
