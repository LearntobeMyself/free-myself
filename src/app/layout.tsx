import type { Metadata } from "next";
import { Instrument_Serif, Manrope, JetBrains_Mono } from "next/font/google";
import { SiteHeader } from "@/components/layout/nav";
import { CharacterDockLazy } from "@/components/live2d/character-dock-lazy";
import "./globals.css";

const display = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display-loaded",
  display: "swap",
});

const body = Manrope({
  subsets: ["latin"],
  variable: "--font-body-loaded",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-loaded",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Free myself",
  description: "展示真实项目，本机改 Word / Markdown 格式 — LearntobeMyself",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${display.variable} ${body.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <footer className="border-t border-[var(--border)] py-10 text-center text-sm text-[var(--text-faint)]">
          Free myself · 本机改稿，少为格式折腾 · LearntobeMyself
        </footer>
        <CharacterDockLazy />
      </body>
    </html>
  );
}
