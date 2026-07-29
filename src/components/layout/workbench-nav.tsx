"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/workbench", label: "Overview", exact: true },
  { href: "/workbench/passport", label: "Passport" },
  { href: "/workbench/open-loop", label: "Open Loop" },
  { href: "/workbench/docs", label: "Docs Studio" },
  { href: "/workbench/traces", label: "Traces" },
];

export function WorkbenchNav() {
  const pathname = usePathname();

  return (
    <aside className="h-fit md:sticky md:top-24">
      <div className="mb-3 px-1 text-[0.7rem] font-medium uppercase tracking-[0.16em] text-[var(--text-faint)]">
        Workbench
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
                className={`block rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  active
                    ? "bg-[var(--bg-2)] font-medium text-[var(--text)]"
                    : "text-[var(--text-muted)] hover:bg-[var(--bg-2)] hover:text-[var(--text)]"
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
