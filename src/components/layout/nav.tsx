import Link from "next/link";
import { WorkbenchNav } from "@/components/layout/workbench-nav";

export function SiteHeader() {
  const links = [
    { href: "/", label: "首页" },
    { href: "/#projects", label: "项目" },
    { href: "/workbench", label: "工作台" },
  ];
  return (
    <header className="fm-nav">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="fm-display text-[1.35rem] tracking-tight text-[var(--text)]">
          解放自己
        </Link>
        <nav className="flex items-center gap-1 text-sm text-[var(--text-muted)] sm:gap-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-1.5 transition-colors hover:bg-[var(--bg-2)] hover:text-[var(--text)]"
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
