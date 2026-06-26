import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-bold">LectureInsight</h1>
      <p className="mt-2 text-gray-600">
        강의 스크립트를 분석해 강사별 강의력 리포트를 자동 생성합니다.
      </p>

      <section className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Link
          href="/analysis"
          className="rounded-xl border p-6 transition hover:border-gray-900"
        >
          <h2 className="text-lg font-semibold">강의 분석</h2>
          <p className="mt-1 text-sm text-gray-600">스크립트 업로드 및 항목별 분석</p>
        </Link>

        <Link
          href="/report"
          className="rounded-xl border p-6 transition hover:border-gray-900"
        >
          <h2 className="text-lg font-semibold">리포트</h2>
          <p className="mt-1 text-sm text-gray-600">PDF/DOCX 리포트 생성 및 다운로드</p>
        </Link>

        <Link
          href="/compare"
          className="rounded-xl border p-6 transition hover:border-gray-900"
        >
          <h2 className="text-lg font-semibold">비교/추이</h2>
          <p className="mt-1 text-sm text-gray-600">강사 비교 및 주차별 변화</p>
        </Link>
      </section>
    </main>
  );
}
