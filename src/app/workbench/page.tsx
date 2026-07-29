import Link from "next/link";

const cards = [
  {
    href: "/workbench/passport",
    title: "Context Passport",
    body: "身份、偏好、项目护照、决策日志与会话交接。一键导出 AGENTS.md / Cursor rules。",
  },
  {
    href: "/workbench/open-loop",
    title: "Open Loop",
    body: "粘贴聊天或纪要，抽取「我的承诺」，带原文引用与状态机。",
  },
  {
    href: "/workbench/docs",
    title: "Document Studio",
    body: "Format Spec 驱动的 Word 一键排版与 Markdown↔Word，同一规范验收。",
  },
  {
    href: "/workbench/traces",
    title: "Traces",
    body: "回放 harness run：thought / tool / verify / decision。",
  },
];

export default function WorkbenchHome() {
  return (
    <div className="fm-stack">
      <header>
        <p className="fm-section-label">Private</p>
        <h1 className="fm-workbench-title">Workbench</h1>
        <p className="fm-workbench-lead">
          Agent = Model + Harness。这里是你的 Outer Harness：上下文、工具、循环、校验与观测——一屏一事。
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            prefetch
            className="group rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-1)] p-6 shadow-[var(--shadow-soft)] transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--bg-2)]"
          >
            <h2 className="text-lg font-semibold tracking-tight group-hover:text-[var(--accent)]">
              {c.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{c.body}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
