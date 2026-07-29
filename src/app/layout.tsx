import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Free Myself",
  description: "个人解放站 + Harness 练兵场 — LearntobeMyself",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <footer className="border-t border-[var(--border)] py-8 text-center text-sm text-[var(--text-faint)]">
          Free Myself · Agent = Model + Harness · LearntobeMyself
        </footer>
      </body>
    </html>
  );
}
