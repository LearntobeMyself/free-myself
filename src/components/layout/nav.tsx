import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/#projects", label: "Projects" },
  { href: "/workbench", label: "Workbench" },
];

export function SiteHeader() {
  return (
    <header className="fm-nav">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="fm-display text-lg tracking-tight">
          Free Myself
        </Link>
        <nav className="flex items-center gap-5 text-sm text-[var(--text-muted)]">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="transition-colors hover:text-[var(--text)]"
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
    <aside className="fm-panel h-fit p-3 md:sticky md:top-20">
      <div className="mb-3 px-2 text-xs uppercase tracking-[0.14em] text-[var(--text-faint)]">
        Workbench
      </div>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="block rounded-md px-3 py-2 text-sm text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-2)] hover:text-[var(--text)]"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
