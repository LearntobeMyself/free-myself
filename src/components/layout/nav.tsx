import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/#projects", label: "Projects" },
  { href: "/workbench", label: "Workbench" },
];

export function SiteHeader() {
  return (
    <header className="fm-nav">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="fm-display text-[1.35rem] tracking-tight text-[var(--text)]">
          Free Myself
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

export function WorkbenchNav() {
  const items = [
    { href: "/workbench", label: "Overview" },
    { href: "/workbench/passport", label: "Passport" },
    { href: "/workbench/open-loop", label: "Open Loop" },
    { href: "/workbench/docs", label: "Docs Studio" },
    { href: "/workbench/traces", label: "Traces" },
  ];
  return (
    <aside className="fm-panel h-fit p-3 md:sticky md:top-24">
      <div className="mb-3 px-3 pt-1 text-[0.7rem] font-medium uppercase tracking-[0.16em] text-[var(--text-faint)]">
        Workbench
      </div>
      <ul className="space-y-0.5">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="block rounded-lg px-3 py-2.5 text-sm text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-2)] hover:text-[var(--text)]"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
