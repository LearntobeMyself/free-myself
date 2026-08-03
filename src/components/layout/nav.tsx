"use client";

import Link from "next/link";
import { WorkbenchNav } from "@/components/layout/workbench-nav";
import { withCharacterAct } from "@/components/live2d/with-character-act";

export function SiteHeader() {
  const links = [
    { href: "/", label: "首页", act: undefined },
    { href: "/projects", label: "项目", act: "wave" as const },
    { href: "/workbench/docs", label: "工作台", act: "invite" as const },
  ];
  return (
    <header className="fm-nav">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link
          href="/"
          className="fm-display text-[1.35rem] tracking-tight text-[var(--text)]"
        >
          Free myself
        </Link>
        <nav className="flex items-center gap-1 text-sm text-[var(--text-muted)] sm:gap-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full px-3.5 py-1.5 transition-colors hover:bg-[rgba(255,255,255,0.7)] hover:text-[var(--text)] hover:shadow-[var(--shadow-soft)]"
              onPointerDown={l.act ? withCharacterAct(l.act) : undefined}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export { WorkbenchNav };
