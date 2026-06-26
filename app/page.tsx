"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { api } from "@/lib/api";
import { mockSession } from "@/lib/mock";
import { saveSession } from "@/lib/store";
import type { InstructorScorecard } from "@/lib/types";

// 파일명에서 YYYY-MM-DD 추출 (예: 2026-02-02_java.txt)
function parseDate(name: string): string | null {
  const m = name.match(/(20\d{2})[-_.]?(\d{2})[-_.]?(\d{2})/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
}

const inputCls =
  "mt-1.5 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-brand";

export default function HomePage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [instructorId, setInstructorId] = useState("");
  const [lectureDate, setLectureDate] = useState("");
  const [courseId, setCourseId] = useState("");
  const [speakerNote, setSpeakerNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canAnalyze = files.length > 0 && instructorId.trim().length > 0;

  async function runAnalysis() {
    setError(null);
    if (!canAnalyze) {
      setError("강사 ID와 분석할 txt 파일을 입력하세요.");
      return;
    }
    setBusy(true);
    try {
      const cards: InstructorScorecard[] = [];
      for (const file of files) {
        const text = await file.text();
        const date = parseDate(file.name) ?? lectureDate;
        if (!date) {
          throw new Error(
            `'${file.name}'의 강의 일자를 알 수 없습니다. 파일명에 날짜를 넣거나 강의 일자를 입력하세요.`
          );
        }
        const card = await api.analyzeLecture({
          instructor_id: instructorId.trim(),
          lecture_date: date,
          raw_text: text,
          course_id: courseId.trim() || undefined,
        });
        cards.push(card);
      }
      saveSession({
        instructorId: instructorId.trim(),
        scorecards: cards,
        source: "api",
        createdAt: new Date().toISOString(),
      });
      router.push("/analysis");
    } catch (e) {
      setError(
        `분석 실패: 백엔드(FastAPI :8000) 실행 여부를 확인하세요.\n${
          e instanceof Error ? e.message : String(e)
        }`
      );
    } finally {
      setBusy(false);
    }
  }

  function viewDemo() {
    saveSession(mockSession());
    router.push("/analysis");
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-ink">LectureInsight</h1>
        <p className="mt-2 text-subtle">
          강의 스크립트를 분석해 강사별 강의력 리포트를 자동 생성합니다.
        </p>
      </header>

      <div className="rounded-2xl border border-line bg-surface p-6 shadow-card">
        <h2 className="text-lg font-semibold text-ink">분석 시작</h2>

        {/* 1. 데이터 첨부 */}
        <section className="mt-5">
          <label className="text-sm font-medium text-ink">
            데이터 첨부 <span className="text-subtle">(txt, 여러 개 가능)</span>
          </label>
          <label className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-line bg-canvas px-4 py-8 text-center transition hover:border-brand">
            <span className="text-sm text-subtle">
              클릭하여 STT 전사본(.txt) 선택
            </span>
            <input
              type="file"
              accept=".txt,text/plain"
              multiple
              className="hidden"
              onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
            />
          </label>
          {files.length > 0 ? (
            <ul className="mt-2 space-y-1">
              {files.map((f) => (
                <li
                  key={f.name}
                  className="flex items-center justify-between rounded-lg bg-canvas px-3 py-1.5 text-sm"
                >
                  <span className="text-ink">{f.name}</span>
                  <span className="text-xs text-subtle">
                    {parseDate(f.name) ?? "일자 미지정"}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </section>

        {/* 2. 메타데이터 */}
        <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="강사 ID *" >
            <input
              value={instructorId}
              onChange={(e) => setInstructorId(e.target.value)}
              placeholder="INST_김멋사"
              className={inputCls}
            />
          </Field>
          <Field label="강의 일자" hint="파일명에 날짜가 없을 때 사용">
            <input
              type="date"
              value={lectureDate}
              onChange={(e) => setLectureDate(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="과목 ID" hint="선택">
            <input
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              placeholder="java-backend-21"
              className={inputCls}
            />
          </Field>
          <Field label="강의 발화자 정보" hint="선택 (메모)">
            <input
              value={speakerNote}
              onChange={(e) => setSpeakerNote(e.target.value)}
              placeholder="강사 화자 ID 등"
              className={inputCls}
            />
          </Field>
        </section>

        {error ? (
          <p className="mt-4 whitespace-pre-line rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            onClick={runAnalysis}
            disabled={busy || !canAnalyze}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "분석 중…" : "분석 시작"}
          </button>
          <button
            onClick={viewDemo}
            className="rounded-lg border border-line bg-surface px-4 py-2 text-sm font-medium text-ink transition hover:bg-canvas"
          >
            데모 데이터로 보기
          </button>
          <Link
            href="/compare"
            className="ml-auto text-sm text-subtle underline-offset-4 hover:underline"
          >
            비교 / 추이 →
          </Link>
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-medium text-ink">{label}</label>
        {hint ? <span className="text-xs text-subtle">{hint}</span> : null}
      </div>
      {children}
    </div>
  );
}
