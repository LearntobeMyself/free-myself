import Link from "next/link";
import { notFound } from "next/navigation";
import { loadRun } from "@/harness";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

const statusLabel: Record<string, string> = {
  completed: "已完成",
  failed: "失败",
  running: "进行中",
};

const stepTypeLabel: Record<string, string> = {
  thought: "思考",
  tool: "工具",
  verify: "校验",
  error: "错误",
};

export default async function TraceDetailPage({ params }: Props) {
  const { id } = await params;
  const run = await loadRun(id);
  if (!run) notFound();

  return (
    <div className="space-y-6">
      <Link href="/workbench/traces" className="text-sm text-[var(--text-muted)]">
        ← 返回轨迹列表
      </Link>
      <div>
        <h1 className="fm-display text-3xl">一次运行</h1>
        <p className="mt-2 text-[var(--text-muted)]">{run.goal}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="fm-badge">{statusLabel[run.status] ?? run.status}</span>
          <span className="fm-badge fm-mono">{run.id}</span>
        </div>
      </div>

      <ol className="space-y-3">
        {run.steps.map((step) => (
          <li key={step.id} className="fm-panel p-4">
            <div className="mb-1 flex items-center gap-2 text-xs tracking-wide text-[var(--text-faint)]">
              <span>{stepTypeLabel[step.type] ?? step.type}</span>
              {step.toolName ? <span className="fm-mono">{step.toolName}</span> : null}
              {typeof step.ok === "boolean" ? (
                <span className={step.ok ? "fm-badge-ok" : "fm-badge-bad"}>
                  {step.ok ? "通过" : "失败"}
                </span>
              ) : null}
            </div>
            <p>{step.message}</p>
            {step.output ? (
              <pre className="fm-mono mt-2 max-h-40 overflow-auto rounded bg-[var(--bg-0)] p-2 text-[10px]">
                {JSON.stringify(step.output, null, 2)}
              </pre>
            ) : null}
          </li>
        ))}
      </ol>

      {run.verifier ? (
        <section className="fm-panel p-4">
          <h2 className="font-medium">验收结果</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {run.verifier.checks.map((c) => (
              <li key={c.id} className="flex gap-2">
                <span className={c.passed ? "fm-badge-ok" : "fm-badge-bad"}>
                  {c.passed ? "通过" : "失败"}
                </span>
                <span>
                  {c.label}
                  {c.detail ? (
                    <span className="text-[var(--text-faint)]"> — {c.detail}</span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
