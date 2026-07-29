"use client";

import { useRef, useState } from "react";

type SpecMeta = { id: string; name: string; scene: string };

function base64ToObjectUrl(base64: string): string {
  const bin = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const blob = new Blob([bin], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
  return URL.createObjectURL(blob);
}

export function DocsStudioClient({ initialSpecs }: { initialSpecs: SpecMeta[] }) {
  const [specs, setSpecs] = useState(initialSpecs);
  const [selectedId, setSelectedId] = useState(initialSpecs[0]?.id ?? "");
  const [nl, setNl] = useState(
    "标题黑体三号居中，正文宋体小四 1.5 倍行距首行缩进两字符，页边距上下 2.54 左右 3.17",
  );
  const [specName, setSpecName] = useState("我的课程报告规范");
  const [docxFile, setDocxFile] = useState<File | null>(null);
  const [markdown, setMarkdown] = useState(
    "# 人工智能导论\n\n## 背景\n\n本节讨论大模型与文档排版。\n\n## 结论\n\n按自己的规范改格式，比套漂亮模板靠谱。",
  );
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const mdFileRef = useRef<HTMLInputElement>(null);

  async function refreshSpecs() {
    const res = await fetch("/api/specs");
    const data = await res.json();
    setSpecs(data.specs ?? []);
    if (!selectedId && data.specs?.[0]) setSelectedId(data.specs[0].id);
  }

  async function saveSpecFromNl() {
    setBusy(true);
    setStatus("正在保存规范…");
    try {
      const res = await fetch("/api/specs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "from_nl", text: nl, name: specName }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(data.error ?? "保存失败");
        return;
      }
      await refreshSpecs();
      if (data.spec?.id) setSelectedId(data.spec.id);
      setStatus("规范已保存");
    } finally {
      setBusy(false);
    }
  }

  async function ensureDefault() {
    setBusy(true);
    setStatus("正在载入默认规范…");
    try {
      const res = await fetch("/api/specs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ensure_default" }),
      });
      const data = await res.json();
      await refreshSpecs();
      if (data.spec?.id) setSelectedId(data.spec.id);
      setStatus(res.ok ? "已载入默认课程报告规范" : data.error ?? "载入失败");
    } finally {
      setBusy(false);
    }
  }

  async function formatWord() {
    if (!selectedId) {
      setStatus("请先选择规范");
      return;
    }
    if (!docxFile) {
      setStatus("请先上传 .docx 文件");
      return;
    }
    setBusy(true);
    setStatus("正在按规范改格式…");
    setDownloadUrl(null);
    try {
      const form = new FormData();
      form.append("file", docxFile);
      form.append("specId", selectedId);
      const res = await fetch("/api/docs/format", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setStatus(data.error ?? "改格式失败");
        return;
      }
      if (data.docxBase64) {
        setDownloadUrl(base64ToObjectUrl(data.docxBase64));
        setStatus("改好了，可以下载");
      } else {
        setStatus("服务没有返回文件");
      }
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "请求失败");
    } finally {
      setBusy(false);
    }
  }

  async function convertMarkdown() {
    if (!selectedId) {
      setStatus("请先选择规范");
      return;
    }
    if (!markdown.trim()) {
      setStatus("请粘贴 Markdown，或上传 .md 文件");
      return;
    }
    setBusy(true);
    setStatus("正在把 Markdown 转成 Word…");
    setDownloadUrl(null);
    try {
      const res = await fetch("/api/docs/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          direction: "md_to_docx",
          specId: selectedId,
          markdown,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(data.error ?? "转换失败");
        return;
      }
      if (data.docxBase64) {
        setDownloadUrl(base64ToObjectUrl(data.docxBase64));
        setStatus("转好了，可以下载");
      } else {
        setStatus("服务没有返回文件");
      }
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "请求失败");
    } finally {
      setBusy(false);
    }
  }

  async function onMdFile(file: File | null) {
    if (!file) return;
    const text = await file.text();
    setMarkdown(text);
    setStatus(`已载入 ${file.name}`);
  }

  return (
    <div className="fm-stack">
      <header>
        <h1 className="fm-workbench-title">文档工坊</h1>
        <p className="fm-workbench-lead">
          上传 Word 或 Markdown，按你写好的规范改格式，再下载
          .docx。排版在本机 Python 服务里跑，不上传云端。
        </p>
      </header>

      <section className="fm-panel-quiet space-y-3">
        <h2 className="fm-section-label">1. 排版规范</h2>
        <input
          className="fm-input"
          value={specName}
          onChange={(e) => setSpecName(e.target.value)}
          placeholder="规范名称"
        />
        <textarea className="fm-textarea" value={nl} onChange={(e) => setNl(e.target.value)} />
        <div className="flex flex-wrap gap-2">
          <button
            className="fm-btn fm-btn-primary"
            disabled={busy}
            onClick={() => void saveSpecFromNl()}
          >
            从说明生成并保存
          </button>
          <button className="fm-btn" disabled={busy} onClick={() => void ensureDefault()}>
            用默认课程报告规范
          </button>
        </div>
        <select
          className="fm-select"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
        >
          <option value="">选择已保存的规范</option>
          {specs.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}（{s.scene}）
            </option>
          ))}
        </select>
      </section>

      <section className="fm-panel-quiet space-y-3">
        <h2 className="fm-section-label">2a. Word → 改格式 → Word</h2>
        <p className="text-sm text-[var(--text-muted)]">
          适合已经写好的课程报告：只动字体、行距、页边距这些，尽量不改内容。
        </p>
        <input
          type="file"
          accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="block w-full text-sm text-[var(--text-muted)]"
          onChange={(e) => setDocxFile(e.target.files?.[0] ?? null)}
        />
        {docxFile ? (
          <p className="text-xs text-[var(--text-faint)]">已选：{docxFile.name}</p>
        ) : null}
        <button
          className="fm-btn fm-btn-primary"
          disabled={busy}
          onClick={() => void formatWord()}
        >
          按规范改格式
        </button>
      </section>

      <section className="fm-panel-quiet space-y-3">
        <h2 className="fm-section-label">2b. Markdown → Word</h2>
        <p className="text-sm text-[var(--text-muted)]">
          粘贴 Markdown，或上传 .md，按同一套规范生成 Word。
        </p>
        <input
          ref={mdFileRef}
          type="file"
          accept=".md,.markdown,text/markdown,text/plain"
          className="block w-full text-sm text-[var(--text-muted)]"
          onChange={(e) => void onMdFile(e.target.files?.[0] ?? null)}
        />
        <textarea
          className="fm-textarea min-h-48"
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
        />
        <button
          className="fm-btn fm-btn-primary"
          disabled={busy}
          onClick={() => void convertMarkdown()}
        >
          转为 Word
        </button>
      </section>

      <section className="fm-panel-quiet space-y-3">
        <h2 className="fm-section-label">3. 下载</h2>
        {downloadUrl ? (
          <a className="fm-btn fm-btn-primary" href={downloadUrl} download="free-myself.docx">
            下载 Word
          </a>
        ) : (
          <p className="text-sm text-[var(--text-muted)]">改完或转完后，下载按钮会出现在这里。</p>
        )}
        <p className="text-sm text-[var(--text-faint)]">{status}</p>
      </section>
    </div>
  );
}
