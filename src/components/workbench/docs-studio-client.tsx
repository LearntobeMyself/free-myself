"use client";

import { useMemo, useRef, useState, type DragEvent } from "react";
import type { FormatSpec, StyleRole } from "@/lib/format-spec";
import {
  EDIT_ROLES,
  FONT_ASCII,
  FONT_EAST,
  ROLE_LABELS,
  cssFromStyle,
  patchMargins,
  patchRole,
  styleOf,
  visibleCourseReportSpec,
} from "@/lib/style-editor";

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

export function DocsStudioClient(_props: { initialSpecs: { id: string; name: string; scene: string }[] }) {
  const [spec, setSpec] = useState<FormatSpec>(() => visibleCourseReportSpec());
  const [activeRole, setActiveRole] = useState<StyleRole>("body");
  const [tab, setTab] = useState<Tab>("word");
  const [docxFile, setDocxFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [markdown, setMarkdown] = useState(
    "# 人工智能导论\n\n## 背景\n\n本节讨论大模型与文档排版。学校要求黑体标题、宋体正文。\n\n## 结论\n\n按自己的规范改格式，比套漂亮模板靠谱。",
  );
  const [status, setStatus] = useState("调左侧样式，右侧会马上变。改完再上传文件下载。");
  const [busy, setBusy] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const docxFileRef = useRef<HTMLInputElement>(null);
  const mdFileRef = useRef<HTMLInputElement>(null);

  const current = useMemo(() => styleOf(spec, activeRole), [spec, activeRole]);
  const titleCss = useMemo(() => cssFromStyle(styleOf(spec, "title")), [spec]);
  const h1Css = useMemo(() => cssFromStyle(styleOf(spec, "heading1")), [spec]);
  const h2Css = useMemo(() => cssFromStyle(styleOf(spec, "heading2")), [spec]);
  const bodyCss = useMemo(() => cssFromStyle(styleOf(spec, "body")), [spec]);

  const paperPad = {
    paddingTop: `${spec.meta.marginCm.top * 8}px`,
    paddingBottom: `${spec.meta.marginCm.bottom * 8}px`,
    paddingLeft: `${spec.meta.marginCm.left * 8}px`,
    paddingRight: `${spec.meta.marginCm.right * 8}px`,
  };

  function updateCurrent(patch: Partial<typeof current>) {
    setSpec((s) => patchRole(s, activeRole, patch));
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
    setMarkdown(await file.text());
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
    if (!docxFile) {
      setStatus("请先上传 .docx");
      return;
    }
    setBusy(true);
    setStatus("正在按当前样式改格式…");
    setDownloadUrl(null);
    try {
      const form = new FormData();
      form.append("file", docxFile);
      form.append("spec", JSON.stringify(spec));
      const res = await fetch("/api/docs/format", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setStatus(data.error ?? "改格式失败");
        return;
      }
      if (data.docxBase64) {
        setDownloadUrl(base64ToObjectUrl(data.docxBase64));
        const s = data.summary;
        setStatus(
          s
            ? `已改 ${s.paragraphsStyled ?? "?"} 段 · 正文 ${s.bodyFont ?? ""} ${s.bodySizePt ?? ""}pt · 可下载`
            : "改好了，可以下载",
        );
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
    if (!markdown.trim()) {
      setStatus("请粘贴 Markdown 或上传 .md");
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
          markdown,
          spec,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(data.error ?? "转换失败");
        return;
      }
      if (data.docxBase64) {
        setDownloadUrl(base64ToObjectUrl(data.docxBase64));
        const s = data.summary;
        setStatus(
          s
            ? `已生成 ${s.paragraphsStyled ?? "?"} 段 · 可下载`
            : "转好了，可以下载",
        );
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
    <div className="fm-docs-layout">
      <header className="fm-docs-layout-head">
        <div>
          <h1 className="fm-workbench-title">文档工坊</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            左边调样式，右边立刻预览；确认后再套到你的 Word / Markdown。
          </p>
        </div>
        <button
          type="button"
          className="fm-btn"
          onClick={() => {
            setSpec(visibleCourseReportSpec());
            setStatus("已载入课程报告预设，可继续微调");
          }}
        >
          重置为课程报告预设
        </button>
      </header>

      <div className="fm-docs-split">
        {/* 左：控件 */}
        <div className="fm-docs-editor">
          <div className="fm-docs-role-tabs">
            {EDIT_ROLES.map((role) => (
              <button
                key={role}
                type="button"
                className={`fm-docs-role-tab ${activeRole === role ? "is-active" : ""}`}
                onClick={() => setActiveRole(role)}
              >
                {ROLE_LABELS[role]}
              </button>
            ))}
          </div>

          <div className="fm-docs-knobs">
            <label className="fm-docs-knob">
              <span>中文字体</span>
              <select
                className="fm-select"
                value={current.fontEastAsia}
                onChange={(e) => updateCurrent({ fontEastAsia: e.target.value })}
              >
                {FONT_EAST.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </label>
            <label className="fm-docs-knob">
              <span>英文字体</span>
              <select
                className="fm-select"
                value={current.fontAscii}
                onChange={(e) => updateCurrent({ fontAscii: e.target.value })}
              >
                {FONT_ASCII.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </label>
            <label className="fm-docs-knob">
              <span>字号 (pt)</span>
              <input
                className="fm-input"
                type="number"
                min={8}
                max={36}
                step={0.5}
                value={current.fontSizePt}
                onChange={(e) => updateCurrent({ fontSizePt: Number(e.target.value) || 12 })}
              />
            </label>
            <label className="fm-docs-knob">
              <span>行距</span>
              <input
                className="fm-input"
                type="number"
                min={1}
                max={3}
                step={0.25}
                value={current.lineSpacing}
                onChange={(e) => updateCurrent({ lineSpacing: Number(e.target.value) || 1.5 })}
              />
            </label>
            <label className="fm-docs-knob">
              <span>对齐</span>
              <select
                className="fm-select"
                value={current.align}
                onChange={(e) =>
                  updateCurrent({
                    align: e.target.value as "left" | "center" | "right" | "both",
                  })
                }
              >
                <option value="left">左对齐</option>
                <option value="center">居中</option>
                <option value="right">右对齐</option>
                <option value="both">两端对齐</option>
              </select>
            </label>
            <label className="fm-docs-knob">
              <span>首行缩进（字符）</span>
              <input
                className="fm-input"
                type="number"
                min={0}
                max={4}
                step={1}
                value={current.firstLineIndentChars}
                onChange={(e) =>
                  updateCurrent({ firstLineIndentChars: Number(e.target.value) || 0 })
                }
              />
            </label>
            <label className="fm-docs-knob fm-docs-knob-check">
              <input
                type="checkbox"
                checked={current.bold}
                onChange={(e) => updateCurrent({ bold: e.target.checked })}
              />
              <span>加粗</span>
            </label>
            <label className="fm-docs-knob fm-docs-knob-check">
              <input
                type="checkbox"
                checked={current.italic}
                onChange={(e) => updateCurrent({ italic: e.target.checked })}
              />
              <span>斜体</span>
            </label>
          </div>

          <div className="fm-docs-margins">
            <p className="fm-section-label mb-2">页边距 (cm)</p>
            <div className="fm-docs-knobs">
              {(
                [
                  ["top", "上"],
                  ["bottom", "下"],
                  ["left", "左"],
                  ["right", "右"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="fm-docs-knob">
                  <span>{label}</span>
                  <input
                    className="fm-input"
                    type="number"
                    min={1}
                    max={5}
                    step={0.1}
                    value={spec.meta.marginCm[key]}
                    onChange={(e) =>
                      setSpec((s) =>
                        patchMargins(s, { [key]: Number(e.target.value) || 2.54 }),
                      )
                    }
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="fm-docs-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              className={`fm-docs-tab ${tab === "word" ? "is-active" : ""}`}
              onClick={() => setTab("word")}
            >
              套到 Word
            </button>
            <button
              type="button"
              role="tab"
              className={`fm-docs-tab ${tab === "markdown" ? "is-active" : ""}`}
              onClick={() => setTab("markdown")}
            >
              Markdown 转 Word
            </button>
          </div>

          {tab === "word" ? (
            <section className="space-y-3">
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
                <button
                  type="button"
                  className="fm-btn fm-btn-primary"
                  onClick={() => docxFileRef.current?.click()}
                >
                  选择 .docx
                </button>
              </div>
              <button
                type="button"
                className="fm-btn fm-btn-primary w-full"
                disabled={busy}
                onClick={() => void formatWord()}
              >
                应用当前样式并下载
              </button>
            </section>
          ) : (
            <section className="space-y-3">
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
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onMdDrop}
              >
                <button
                  type="button"
                  className="fm-btn"
                  onClick={() => mdFileRef.current?.click()}
                >
                  选择 .md
                </button>
              </div>
              <textarea
                className="fm-textarea fm-docs-md-textarea"
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
              />
              <button
                type="button"
                className="fm-btn fm-btn-primary w-full"
                disabled={busy}
                onClick={() => void convertMarkdown()}
              >
                转为 Word 并下载
              </button>
            </section>
          )}

          <div className="fm-docs-result">
            <p className="fm-docs-result-status">{status}</p>
            {downloadUrl ? (
              <a className="fm-btn fm-btn-primary" href={downloadUrl} download="free-myself.docx">
                下载 Word
              </a>
            ) : null}
          </div>
        </div>

        {/* 右：预览 */}
        <aside className="fm-docs-preview-pane" aria-label="样式预览">
          <p className="fm-section-label mb-3">即时预览</p>
          <div className="fm-docs-paper" style={paperPad}>
            <p style={titleCss}>人工智能导论课程报告</p>
            <p style={h1Css}>第一章 背景</p>
            <p style={h2Css}>一、研究问题</p>
            <p style={bodyCss}>
              本节讨论大模型与文档排版。你在左边改字体、字号、行距和对齐，这里会马上跟着变；确认后再套到上传的稿件。
            </p>
            <p style={bodyCss}>
              页边距也会反映在这张「纸」的内边距上。想看明显差异，可把正文字号调到 16，中文字体改成楷体。
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
