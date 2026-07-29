"use client";

import { useState } from "react";
import type { Commitment } from "@/lib/open-loop";

export function OpenLoopClient({ initialItems }: { initialItems: Commitment[] }) {
  const [text, setText] = useState(
    "我下周把开题报告改完发给你。\n你那边先收材料。\n我今晚把会议纪要整理好。",
  );
  const [items, setItems] = useState(initialItems);
  const [runId, setRunId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  async function extract() {
    setMsg("running harness…");
    const res = await fetch("/api/open-loop", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "extract", text }),
    });
    const data = await res.json();
    setItems(data.items ?? []);
    setRunId(data.runId ?? null);
    setMsg(res.ok ? `extracted ${data.added ?? 0}` : data.error);
  }

  async function setStatus(id: string, status: Commitment["status"]) {
    const res = await fetch("/api/open-loop", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update", id, status }),
    });
    const data = await res.json();
    setItems(data.items ?? []);
  }

  return (
    <div className="fm-stack">
      <header>
        <h1 className="fm-workbench-title">Open Loop</h1>
        <p className="fm-workbench-lead">
          粘贴聊天/纪要 → 只抽「我该做的」→ 必须带原文引用。不做微信破解。
        </p>
      </header>

      <section className="fm-panel-quiet space-y-3">
        <h2 className="fm-section-label">Paste</h2>
        <textarea className="fm-textarea" value={text} onChange={(e) => setText(e.target.value)} />
        <button className="fm-btn fm-btn-primary" onClick={() => void extract()}>
          抽取承诺
        </button>
        <p className="text-xs text-[var(--text-faint)]">
          {msg}
          {runId ? (
            <>
              {" "}
              · run{" "}
              <a className="underline" href={`/workbench/traces/${runId}`}>
                {runId.slice(0, 8)}
              </a>
            </>
          ) : null}
        </p>
      </section>

      <section className="fm-stack">
        <h2 className="fm-section-label">Commitments</h2>
        {items.map((item) => (
          <article key={item.id} className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-1)] p-4 shadow-[var(--shadow-soft)]">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium">{item.text}</p>
                <p className="mt-1 text-xs text-[var(--text-faint)]">
                  source: 「{item.sourceSpan}」
                  {item.due ? ` · due ${item.due}` : ""}
                </p>
              </div>
              <select
                className="fm-select max-w-[140px]"
                value={item.status}
                onChange={(e) =>
                  void setStatus(item.id, e.target.value as Commitment["status"])
                }
              >
                <option value="open">open</option>
                <option value="waiting">waiting</option>
                <option value="done">done</option>
              </select>
            </div>
          </article>
        ))}
        {!items.length ? (
          <p className="text-[var(--text-muted)]">暂无承诺。粘贴一段对话试试。</p>
        ) : null}
      </section>
    </div>
  );
}
