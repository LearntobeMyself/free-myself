"use client";

import { useState } from "react";
import type { Passport } from "@/lib/passport";

type Drift = Array<{ id: string; ok: boolean; detail: string }>;

export function PassportClient({
  initialPassport,
  initialDrift,
}: {
  initialPassport: Passport;
  initialDrift: Drift;
}) {
  const [passport, setPassport] = useState(initialPassport);
  const [prefInput, setPrefInput] = useState("");
  const [decisionTitle, setDecisionTitle] = useState("");
  const [decisionDetail, setDecisionDetail] = useState("");
  const [handoff, setHandoff] = useState("");
  const [exportText, setExportText] = useState("");
  const [drift, setDrift] = useState(initialDrift);
  const [status, setStatus] = useState("");

  async function patch(body: Record<string, unknown>) {
    setStatus("saving…");
    const res = await fetch("/api/passport", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setPassport(data.passport);
    setDrift(data.drift ?? []);
    if (data.export) setExportText(data.export);
    setStatus(res.ok ? "saved" : data.error ?? "error");
  }

  return (
    <div className="fm-stack">
      <header>
        <h1 className="fm-workbench-title">Context Passport</h1>
        <p className="fm-workbench-lead">
          分层上下文：身份 / 偏好 / 项目护照 / 决策 / 交接。导出给 Cursor 与其他 Agent。
        </p>
      </header>

      <section className="fm-panel-quiet space-y-3">
        <h2 className="fm-section-label">Identity</h2>
        <input
          className="fm-input"
          value={passport.identity.displayName}
          onChange={(e) =>
            setPassport({
              ...passport,
              identity: { ...passport.identity, displayName: e.target.value },
            })
          }
        />
        <input
          className="fm-input"
          value={passport.identity.tagline}
          onChange={(e) =>
            setPassport({
              ...passport,
              identity: { ...passport.identity, tagline: e.target.value },
            })
          }
        />
        <button
          className="fm-btn fm-btn-primary"
          onClick={() => patch({ action: "save", passport })}
        >
          保存身份
        </button>
      </section>

      <section className="fm-panel-quiet space-y-3">
        <h2 className="fm-section-label">Preferences</h2>
        <ul className="space-y-1 text-sm text-[var(--text-muted)]">
          {passport.preferences.map((p) => (
            <li key={p}>· {p}</li>
          ))}
        </ul>
        <div className="flex gap-2">
          <input
            className="fm-input"
            placeholder="新增偏好"
            value={prefInput}
            onChange={(e) => setPrefInput(e.target.value)}
          />
          <button
            className="fm-btn"
            onClick={() => {
              if (!prefInput.trim()) return;
              void patch({
                action: "save",
                passport: {
                  ...passport,
                  preferences: [...passport.preferences, prefInput.trim()],
                },
              });
              setPrefInput("");
            }}
          >
            添加
          </button>
        </div>
      </section>

      <section className="fm-panel-quiet space-y-3">
        <h2 className="fm-section-label">Decision Log</h2>
        <input
          className="fm-input"
          placeholder="标题"
          value={decisionTitle}
          onChange={(e) => setDecisionTitle(e.target.value)}
        />
        <textarea
          className="fm-textarea"
          placeholder="细节"
          value={decisionDetail}
          onChange={(e) => setDecisionDetail(e.target.value)}
        />
        <button
          className="fm-btn"
          onClick={() => {
            void patch({
              action: "add_decision",
              title: decisionTitle,
              detail: decisionDetail,
            });
            setDecisionTitle("");
            setDecisionDetail("");
          }}
        >
          记录决策
        </button>
        <ul className="space-y-2 text-sm">
          {passport.decisions.slice(0, 8).map((d) => (
            <li key={d.id} className="border-t border-[var(--border)] pt-2">
              <strong>{d.title}</strong>
              <span className="fm-faint"> · {d.at}</span>
              <div className="text-[var(--text-muted)]">{d.detail}</div>
            </li>
          ))}
        </ul>
      </section>

      <section className="fm-panel-quiet space-y-3">
        <h2 className="fm-section-label">Session Handoff</h2>
        <textarea
          className="fm-textarea"
          placeholder="本次会话结束时写下：完成了什么、下一步、坑点"
          value={handoff}
          onChange={(e) => setHandoff(e.target.value)}
        />
        <button
          className="fm-btn"
          onClick={() => {
            void patch({ action: "add_handoff", content: handoff });
            setHandoff("");
          }}
        >
          保存交接
        </button>
      </section>

      <section className="fm-panel-quiet space-y-3">
        <h2 className="fm-section-label">Export & Drift</h2>
        <div className="flex flex-wrap gap-2">
          <button className="fm-btn" onClick={() => patch({ action: "export_agents" })}>
            导出 AGENTS.md
          </button>
          <button className="fm-btn" onClick={() => patch({ action: "export_cursor" })}>
            导出 Cursor rules
          </button>
          <button className="fm-btn" onClick={() => patch({ action: "drift" })}>
            漂移检查
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {drift.map((d) => (
            <span key={d.id} className={`fm-badge ${d.ok ? "fm-badge-ok" : "fm-badge-bad"}`}>
              {d.id}: {d.ok ? "ok" : "drift"}
            </span>
          ))}
        </div>
        {exportText ? (
          <pre className="fm-mono max-h-80 overflow-auto rounded-md bg-[var(--bg-0)] p-3 text-xs">
            {exportText}
          </pre>
        ) : null}
        <p className="text-xs text-[var(--text-faint)]">{status}</p>
      </section>
    </div>
  );
}
