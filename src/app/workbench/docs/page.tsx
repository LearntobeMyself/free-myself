"use client";

import { useEffect, useState } from "react";

type SpecMeta = { id: string; name: string; scene: string };

export default function DocsStudioPage() {
  const [specs, setSpecs] = useState<SpecMeta[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [nl, setNl] = useState(
    "标题黑体三号居中，正文宋体小四 1.5 倍行距首行缩进两字符，页边距上下 2.54 左右 3.17，参考文献悬挂缩进",
  );
  const [specName, setSpecName] = useState("我的课程报告规范");
  const [plain, setPlain] = useState(
    "人工智能导论课程报告\n第一章 背景\n本节讨论大模型与 harness。\n一、研究方法\n本文采用文献综述。\n参考文献\n[1] Example 2026.",
  );
  const [markdown, setMarkdown] = useState(
    "# 人工智能导论\n\n## 背景\n\n本节讨论大模型与 harness。\n\n> 工具边界要清晰\n\n```\nrunAgentLoop()\n```\n\n## 结论\n\n规范驱动优于黑盒美化。",
  );
  const [report, setReport] = useState("");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [runId, setRunId] = useState<string | null>(null);
  const [mdOut, setMdOut] = useState("");
  const [mapping, setMapping] = useState("");

  useEffect(() => {
    let alive = true;
    void (async () => {
      const res = await fetch("/api/specs");
      const data = await res.json();
      if (!alive) return;
      setSpecs(data.specs ?? []);
      if (data.specs?.[0]) setSelectedId((prev) => prev || data.specs[0].id);
    })();
    return () => {
      alive = false;
    };
  }, []);

  async function refreshSpecs() {
    const res = await fetch("/api/specs");
    const data = await res.json();
    setSpecs(data.specs ?? []);
    if (!selectedId && data.specs?.[0]) setSelectedId(data.specs[0].id);
  }

  async function saveSpecFromNl() {
    const res = await fetch("/api/specs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "from_nl", text: nl, name: specName }),
    });
    const data = await res.json();
    setReport(JSON.stringify(data, null, 2));
    await refreshSpecs();
    if (data.spec?.id) setSelectedId(data.spec.id);
  }

  async function ensureDefault() {
    const res = await fetch("/api/specs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "ensure_default" }),
    });
    const data = await res.json();
    await refreshSpecs();
    if (data.spec?.id) setSelectedId(data.spec.id);
  }

  async function formatWord() {
    const res = await fetch("/api/docs/format", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ specId: selectedId, text: plain }),
    });
    const data = await res.json();
    setReport(JSON.stringify(data.verifier ?? data, null, 2));
    setRunId(data.runId ?? null);
    if (data.docxBase64) {
      const bin = Uint8Array.from(atob(data.docxBase64), (c) => c.charCodeAt(0));
      const blob = new Blob([bin], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      setDownloadUrl(URL.createObjectURL(blob));
    }
  }

  async function convert(direction: "md_to_docx" | "docx_to_md_roundtrip") {
    const res = await fetch("/api/docs/convert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        direction,
        specId: selectedId,
        markdown,
      }),
    });
    const data = await res.json();
    setRunId(data.runId ?? null);
    setMapping(JSON.stringify(data.mapping ?? data.lossy ?? data.diffs, null, 2));
    if (data.markdown) setMdOut(data.markdown);
    if (data.docxBase64) {
      const bin = Uint8Array.from(atob(data.docxBase64), (c) => c.charCodeAt(0));
      const blob = new Blob([bin], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      setDownloadUrl(URL.createObjectURL(blob));
    }
    setReport(JSON.stringify(data.verifier ?? { ok: data.ok, diffs: data.diffs }, null, 2));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="fm-display text-3xl">Document Studio</h1>
        <p className="mt-2 text-[var(--text-muted)]">
          你的规范 → 系统执行 → 同一规范验收。不是选个漂亮模板就完事。
        </p>
      </div>

      <section className="fm-panel space-y-3 p-5">
        <h2 className="font-medium">Format Spec</h2>
        <input
          className="fm-input"
          value={specName}
          onChange={(e) => setSpecName(e.target.value)}
          placeholder="规范名称"
        />
        <textarea className="fm-textarea" value={nl} onChange={(e) => setNl(e.target.value)} />
        <div className="flex flex-wrap gap-2">
          <button className="fm-btn fm-btn-primary" onClick={() => void saveSpecFromNl()}>
            从自然语言生成并保存
          </button>
          <button className="fm-btn" onClick={() => void ensureDefault()}>
            载入默认课程报告规范
          </button>
        </div>
        <select
          className="fm-select"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
        >
          <option value="">选择已保存规范</option>
          {specs.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.scene})
            </option>
          ))}
        </select>
      </section>

      <section className="fm-panel space-y-3 p-5">
        <h2 className="font-medium">Word 一键规范排版</h2>
        <textarea className="fm-textarea" value={plain} onChange={(e) => setPlain(e.target.value)} />
        <button className="fm-btn fm-btn-primary" onClick={() => void formatWord()}>
          按 Spec 排版
        </button>
      </section>

      <section className="fm-panel space-y-3 p-5">
        <h2 className="font-medium">Markdown ↔ Word</h2>
        <textarea
          className="fm-textarea min-h-48"
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          <button className="fm-btn fm-btn-primary" onClick={() => void convert("md_to_docx")}>
            Markdown → Word
          </button>
          <button className="fm-btn" onClick={() => void convert("docx_to_md_roundtrip")}>
            结构往返检查 MD→块→MD
          </button>
        </div>
        {mdOut ? (
          <pre className="fm-mono max-h-48 overflow-auto rounded-md bg-[var(--bg-0)] p-3 text-xs">
            {mdOut}
          </pre>
        ) : null}
        {mapping ? (
          <pre className="fm-mono max-h-40 overflow-auto rounded-md bg-[var(--bg-0)] p-3 text-xs">
            {mapping}
          </pre>
        ) : null}
      </section>

      <section className="fm-panel space-y-3 p-5">
        <h2 className="font-medium">验收 / 产物</h2>
        {downloadUrl ? (
          <a className="fm-btn" href={downloadUrl} download="free-myself.docx">
            下载 DOCX
          </a>
        ) : null}
        {runId ? (
          <p className="text-sm text-[var(--text-muted)]">
            harness run:{" "}
            <a className="underline" href={`/workbench/traces/${runId}`}>
              {runId}
            </a>
          </p>
        ) : null}
        <pre className="fm-mono max-h-80 overflow-auto rounded-md bg-[var(--bg-0)] p-3 text-xs">
          {report || "报告会显示在这里"}
        </pre>
      </section>
    </div>
  );
}
