import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LectureInsight",
  description: "AI 강의 분석 리포트 생성기",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
