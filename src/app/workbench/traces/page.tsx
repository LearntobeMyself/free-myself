import Link from "next/link";
import { listRuns } from "@/harness";

export const dynamic = "force-dynamic";

const statusLabel: Record<string, string> = {
  completed: "已完成",
  failed: "失败",
  running: "进行中",
};

export default async function TracesPage() {
  const runs = await listRuns();
  return (
    <div className="fm-stack">
      <header>
        <h1 className="fm-workbench-title">运行轨迹</h1>
        <p className="fm-workbench-lead">
          每次自动流程都会落盘，可回放。出错先看工具和校验，而不是先怪模型。
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
                  {run.createdAt} · {run.steps.length} 步
                </p>
              </div>
              <span
                className={`fm-badge ${run.status === "completed" ? "fm-badge-ok" : "fm-badge-wip"}`}
              >
                {statusLabel[run.status] ?? run.status}
              </span>
            </div>
          </Link>
        ))}
        {!runs.length ? (
          <p className="text-[var(--text-muted)]">
            还没有记录。去「未闭环」或「文档工坊」跑一次就会出现。
          </p>
        ) : null}
      </div>
    </div>
  );
}
