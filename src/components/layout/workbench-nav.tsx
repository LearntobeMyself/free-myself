"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/workbench/docs", label: "文档工坊" },
  { href: "/workbench/ppt", label: "PPT" },
];

export function WorkbenchNav() {
  const pathname = usePathname();

  return (
    <aside className="h-fit rounded-2xl border border-[var(--border)] bg-[rgba(255,255,255,0.55)] p-3 shadow-[var(--shadow-glass)] backdrop-blur-xl md:sticky md:top-24">
      <div className="mb-3 px-2 text-[0.72rem] font-medium tracking-[0.12em] text-[var(--text-faint)]">
        工作台
      </div>
      <ul className="space-y-0.5">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                prefetch
                className={`block rounded-xl px-3 py-2.5 text-sm transition-all duration-200 ${
                  active
                    ? "translate-x-0.5 bg-[var(--accent-soft)] font-medium text-[var(--accent)]"
                    : "text-[var(--text-muted)] hover:translate-x-0.5 hover:bg-[var(--bg-2)] hover:text-[var(--text)]"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
