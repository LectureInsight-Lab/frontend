"use client";

import { useState } from "react";

import { api, reportDownloadUrl } from "@/lib/api";
import type { InstructorScorecard } from "@/lib/types";

// 출력 버튼: 백엔드 리포트(DOCX) 생성 + 브라우저 인쇄/PDF 폴백
export function ExportButton({ card }: { card: InstructorScorecard }) {
  const [busy, setBusy] = useState(false);

  async function exportReport() {
    setBusy(true);
    try {
      const res = await api.generateReport(card, ["html", "docx"]);
      const path = res.download.docx ?? res.download.html;
      if (!path) throw new Error("다운로드 경로 없음");
      window.open(reportDownloadUrl(path), "_blank");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      alert(
        `리포트 생성 실패: 백엔드(FastAPI :8000)가 실행 중인지 확인하세요.\n\n${msg}`
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => window.print()}
        className="rounded-lg border border-line bg-surface px-3 py-1.5 text-sm font-medium text-ink transition hover:bg-canvas"
      >
        인쇄 · PDF
      </button>
      <button
        onClick={exportReport}
        disabled={busy}
        className="rounded-lg bg-brand px-3 py-1.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {busy ? "생성 중…" : "리포트(DOCX)"}
      </button>
    </div>
  );
}
