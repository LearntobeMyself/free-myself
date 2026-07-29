"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/workbench", label: "总览", exact: true },
  { href: "/workbench/passport", label: "上下文护照" },
  { href: "/workbench/open-loop", label: "未闭环" },
  { href: "/workbench/docs", label: "文档工坊" },
  { href: "/workbench/traces", label: "运行轨迹" },
];

export function WorkbenchNav() {
  const pathname = usePathname();

  return (
    <aside className="h-fit md:sticky md:top-24">
      <div className="mb-3 px-1 text-[0.72rem] font-medium tracking-[0.12em] text-[var(--text-faint)]">
        工作台
      </div>
      <ul className="space-y-0.5">
        {items.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                prefetch
                className={`block rounded-lg px-3 py-2.5 text-sm transition-all duration-200 ${
                  active
                    ? "translate-x-0.5 bg-[var(--bg-2)] font-medium text-[var(--text)]"
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
