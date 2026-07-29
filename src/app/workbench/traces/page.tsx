import Link from "next/link";
import { listRuns } from "@/harness";

export const dynamic = "force-dynamic";

export default async function TracesPage() {
  const runs = await listRuns();
  return (
    <div className="fm-stack">
      <header>
        <h1 className="fm-workbench-title">Traces</h1>
        <p className="fm-workbench-lead">
          每次 harness run 落盘可回放。失败先看工具与校验，而不是骂模型。
        </p>
      </header>
      <div className="fm-stack">
        {runs.map((run) => (
          <Link
            key={run.id}
            href={`/workbench/traces/${run.id}`}
            prefetch
            className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-1)] p-4 shadow-[var(--shadow-soft)] transition-colors hover:bg-[var(--bg-2)]"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium">{run.goal}</p>
                <p className="text-xs text-[var(--text-faint)]">
                  {run.createdAt} · {run.steps.length} steps
                </p>
              </div>
              <span
                className={`fm-badge ${run.status === "completed" ? "fm-badge-ok" : "fm-badge-wip"}`}
              >
                {run.status}
              </span>
            </div>
          </Link>
        ))}
        {!runs.length ? (
          <p className="text-[var(--text-muted)]">尚无 trace。去 Open Loop 或 Docs Studio 跑一次。</p>
        ) : null}
      </div>
    </div>
  );
}
