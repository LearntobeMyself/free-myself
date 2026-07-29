"use client";

import { useRef, useState, type DragEvent } from "react";

type SpecMeta = { id: string; name: string; scene: string };
type Tab = "word" | "markdown";

function base64ToObjectUrl(base64: string): string {
  const bin = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const blob = new Blob([bin], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
  return URL.createObjectURL(blob);
}

function isDocx(file: File): boolean {
  const name = file.name.toLowerCase();
  return (
    name.endsWith(".docx") ||
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  );
}

function isMarkdownFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return (
    name.endsWith(".md") ||
    name.endsWith(".markdown") ||
    name.endsWith(".txt") ||
    file.type.startsWith("text/")
  );
}

export function DocsStudioClient({ initialSpecs }: { initialSpecs: SpecMeta[] }) {
  const [specs, setSpecs] = useState(initialSpecs);
  const [selectedId, setSelectedId] = useState(initialSpecs[0]?.id ?? "");
  const [nl, setNl] = useState(
    "标题黑体三号居中，正文宋体小四 1.5 倍行距首行缩进两字符，页边距上下 2.54 左右 3.17",
  );
  const [specName, setSpecName] = useState("我的课程报告规范");
  const [specOpen, setSpecOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("word");
  const [docxFile, setDocxFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [markdown, setMarkdown] = useState(
    "# 人工智能导论\n\n## 背景\n\n本节讨论大模型与文档排版。\n\n## 结论\n\n按自己的规范改格式，比套漂亮模板靠谱。",
  );
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const docxFileRef = useRef<HTMLInputElement>(null);
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
      setSpecOpen(false);
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

  function pickDocx(file: File | null) {
    if (!file) return;
    if (!isDocx(file)) {
      setStatus("请选择 .docx 文件");
      return;
    }
    setDocxFile(file);
    setStatus(`已选：${file.name}`);
  }

  async function pickMarkdown(file: File | null) {
    if (!file) return;
    if (!isMarkdownFile(file)) {
      setStatus("请选择 .md / .txt 文件");
      return;
    }
    const text = await file.text();
    setMarkdown(text);
    setStatus(`已载入 ${file.name}`);
  }

  function onDocxDrop(e: DragEvent) {
    e.preventDefault();
    setDragOver(false);
    pickDocx(e.dataTransfer.files?.[0] ?? null);
  }

  function onMdDrop(e: DragEvent) {
    e.preventDefault();
    setDragOver(false);
    void pickMarkdown(e.dataTransfer.files?.[0] ?? null);
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

  return (
    <div className="fm-docs-studio">
      <header className="mb-5">
        <h1 className="fm-workbench-title">文档工坊</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          选规范 → 上传稿 → 下载 Word。本机排版，不上传云端。
        </p>
      </header>

      {/* 规范条 */}
      <section className="fm-docs-spec-bar">
        <select
          className="fm-select fm-docs-spec-select"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          aria-label="排版规范"
        >
          <option value="">选择规范</option>
          {specs.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}（{s.scene}）
            </option>
          ))}
        </select>
        <button
          type="button"
          className="fm-btn"
          disabled={busy}
          onClick={() => void ensureDefault()}
        >
          用默认规范
        </button>
        <button
          type="button"
          className="fm-btn"
          onClick={() => setSpecOpen((v) => !v)}
        >
          {specOpen ? "收起自定义" : "自定义规范"}
        </button>
      </section>

      {specOpen ? (
        <section className="fm-panel-quiet space-y-3 pb-4">
          <input
            className="fm-input"
            value={specName}
            onChange={(e) => setSpecName(e.target.value)}
            placeholder="规范名称"
          />
          <textarea
            className="fm-textarea fm-docs-spec-textarea"
            value={nl}
            onChange={(e) => setNl(e.target.value)}
            placeholder="用自然语言写字体、行距、页边距…"
          />
          <button
            type="button"
            className="fm-btn fm-btn-primary"
            disabled={busy}
            onClick={() => void saveSpecFromNl()}
          >
            从说明生成并保存
          </button>
        </section>
      ) : null}

      {/* Tabs */}
      <div className="fm-docs-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "word"}
          className={`fm-docs-tab ${tab === "word" ? "is-active" : ""}`}
          onClick={() => {
            setTab("word");
            setDragOver(false);
          }}
        >
          Word 改格式
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "markdown"}
          className={`fm-docs-tab ${tab === "markdown" ? "is-active" : ""}`}
          onClick={() => {
            setTab("markdown");
            setDragOver(false);
          }}
        >
          Markdown 转 Word
        </button>
      </div>

      {tab === "word" ? (
        <section className="space-y-3" role="tabpanel">
          <p className="text-sm text-[var(--text-muted)]">
            已写好的课程报告：只改字体、行距、页边距，尽量不动内容。
          </p>
          <input
            ref={docxFileRef}
            type="file"
            accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="sr-only"
            tabIndex={-1}
            onChange={(e) => {
              pickDocx(e.target.files?.[0] ?? null);
              e.target.value = "";
            }}
          />
          <div
            className={`fm-dropzone ${dragOver ? "is-dragover" : ""}`}
            onDragEnter={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              if (e.currentTarget.contains(e.relatedTarget as Node)) return;
              setDragOver(false);
            }}
            onDrop={onDocxDrop}
          >
            <p className="fm-dropzone-title">
              {docxFile ? docxFile.name : "把 .docx 拖到这里"}
            </p>
            <p className="fm-dropzone-hint">或</p>
            <button
              type="button"
              className="fm-btn fm-btn-primary"
              onClick={() => docxFileRef.current?.click()}
            >
              选择 .docx
            </button>
            {docxFile ? (
              <button
                type="button"
                className="fm-btn mt-2"
                onClick={() => {
                  setDocxFile(null);
                  setStatus("已清除文件");
                }}
              >
                清除
              </button>
            ) : null}
          </div>
          <button
            type="button"
            className="fm-btn fm-btn-primary"
            disabled={busy}
            onClick={() => void formatWord()}
          >
            按规范改格式
          </button>
        </section>
      ) : (
        <section className="space-y-3" role="tabpanel">
          <p className="text-sm text-[var(--text-muted)]">
            粘贴 Markdown，或上传 .md，按同一套规范生成 Word。
          </p>
          <input
            ref={mdFileRef}
            type="file"
            accept=".md,.markdown,.txt,text/markdown,text/plain"
            className="sr-only"
            tabIndex={-1}
            onChange={(e) => {
              void pickMarkdown(e.target.files?.[0] ?? null);
              e.target.value = "";
            }}
          />
          <div
            className={`fm-dropzone fm-dropzone-compact ${dragOver ? "is-dragover" : ""}`}
            onDragEnter={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              if (e.currentTarget.contains(e.relatedTarget as Node)) return;
              setDragOver(false);
            }}
            onDrop={onMdDrop}
          >
            <button
              type="button"
              className="fm-btn"
              onClick={() => mdFileRef.current?.click()}
            >
              选择 .md
            </button>
            <span className="text-sm text-[var(--text-faint)]">或直接在下方编辑</span>
          </div>
          <textarea
            className="fm-textarea fm-docs-md-textarea"
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
          />
          <button
            type="button"
            className="fm-btn fm-btn-primary"
            disabled={busy}
            onClick={() => void convertMarkdown()}
          >
            转为 Word
          </button>
        </section>
      )}

      {/* 结果条 */}
      <div className="fm-docs-result">
        <p className="fm-docs-result-status">{status || "准备好了就点上面的按钮。"}</p>
        {downloadUrl ? (
          <a className="fm-btn fm-btn-primary" href={downloadUrl} download="free-myself.docx">
            下载 Word
          </a>
        ) : null}
      </div>
    </div>
  );
}
