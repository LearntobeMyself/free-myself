"use client";

import { useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import {
  COLOR_PRESETS,
  EDIT_ROLES,
  FONT_ASCII,
  FONT_EAST,
  ROLE_LABELS,
  cssFromStyle,
  isCustomMatchRule,
  isPresetEnabled,
  getPresetRole,
  patchMargins,
  patchRole,
  patchTable,
  setMatchRules,
  setPresetRole,
  startsWithRule,
  styleOf,
  toggleMatchPreset,
  visibleCourseReportSpec,
} from "@/lib/style-editor";
import { withCharacterAct } from "@/components/live2d/with-character-act";
import { MATCH_PRESETS, type FormatSpec, type StyleRole } from "@/lib/format-spec";

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

const RULE_ROLES: StyleRole[] = [
  "title",
  "heading1",
  "heading2",
  "heading3",
  "heading4",
  "body",
  "bibliography",
  "caption",
];

export function DocsStudioClient(_props: {
  initialSpecs: { id: string; name: string; scene: string }[];
}) {
  const [spec, setSpec] = useState<FormatSpec>(() => visibleCourseReportSpec());
  const [activeRole, setActiveRole] = useState<StyleRole>("body");
  const [tab, setTab] = useState<Tab>("word");
  const [docxFile, setDocxFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(true);
  const [customStart, setCustomStart] = useState("第1章");
  const [customRole, setCustomRole] = useState<StyleRole>("heading1");
  const [markdown, setMarkdown] = useState(
    "# 人工智能导论\n\n## 背景\n\n本节讨论大模型与文档排版。\n\n### 方法\n\n#### 细节\n\n正文段落。",
  );
  const [status, setStatus] = useState(
    "勾选你文章里有的标题样子即可，不用写正则。任意 .docx 都能上传。",
  );
  const [busy, setBusy] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [engineHealth, setEngineHealth] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);

  const docxFileRef = useRef<HTMLInputElement>(null);
  const mdFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function check() {
      try {
        const res = await fetch("/api/docs/health", { cache: "no-store" });
        const data = (await res.json()) as { ok?: boolean; message?: string };
        if (!cancelled) {
          setEngineHealth({
            ok: Boolean(data.ok),
            message: data.message ?? (data.ok ? "排版服务就绪" : "排版服务不可用"),
          });
        }
      } catch {
        if (!cancelled) {
          setEngineHealth({
            ok: false,
            message: "无法检查排版服务状态",
          });
        }
      }
    }
    void check();
    return () => {
      cancelled = true;
    };
  }, []);

  const current = useMemo(() => styleOf(spec, activeRole), [spec, activeRole]);
  const titleCss = useMemo(() => cssFromStyle(styleOf(spec, "title")), [spec]);
  const h1Css = useMemo(() => cssFromStyle(styleOf(spec, "heading1")), [spec]);
  const h2Css = useMemo(() => cssFromStyle(styleOf(spec, "heading2")), [spec]);
  const h3Css = useMemo(() => cssFromStyle(styleOf(spec, "heading3")), [spec]);
  const h4Css = useMemo(() => cssFromStyle(styleOf(spec, "heading4")), [spec]);
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

  function addCustomStartsWith() {
    const rule = startsWithRule(customRole, customStart);
    if (!rule) {
      setStatus("请先填写「以什么开头」");
      return;
    }
    setSpec((s) => {
      const without = s.matchRules.filter((r) => r.pattern !== rule.pattern);
      // Prepend so custom rules beat overlapping presets
      return setMatchRules(s, [rule, ...without]);
    });
    setStatus(
      `已添加：以「${customStart.trim()}」开头 → ${ROLE_LABELS[customRole] ?? customRole}`,
    );
  }

  function pickDocx(file: File | null) {
    if (!file) return;
    if (!isDocx(file)) {
      setStatus("请选择 .docx 文件");
      return;
    }
    setDocxFile(file);
    setStatus(`已选：${file.name}（任意稿件均可）`);
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

  async function formatWord() {
    if (!docxFile) {
      setStatus("请先上传任意 .docx");
      return;
    }
    setBusy(true);
    setStatus("正在按当前样式与匹配规则改格式…");
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
        const roles = s?.rolesUsed
          ? Object.entries(s.rolesUsed)
              .map(([k, v]) => `${ROLE_LABELS[k] ?? k}:${v}`)
              .join(" · ")
          : "";
        setStatus(
          s
            ? `已改 ${s.paragraphsStyled ?? "?"} 处 · 字色 ${s.forcedColor ?? "#000"} · ${roles}`
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
        body: JSON.stringify({ direction: "md_to_docx", markdown, spec }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(data.error ?? "转换失败");
        return;
      }
      if (data.docxBase64) {
        setDownloadUrl(base64ToObjectUrl(data.docxBase64));
        setStatus(`已生成 ${data.summary?.paragraphsStyled ?? "?"} 段 · 可下载`);
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
            勾选标题长什么样即可（不用正则）。任意 Word 都能上传；字色默认黑色。
          </p>
          {engineHealth ? (
            <p
              className={`mt-2 text-xs ${
                engineHealth.ok ? "text-emerald-700" : "text-amber-800"
              }`}
            >
              {engineHealth.ok ? "● " : "○ "}
              {engineHealth.message}
              {!engineHealth.ok
                ? " · 请在 services/doc-engine 启动 uvicorn 后再套格式"
                : ""}
            </p>
          ) : (
            <p className="mt-2 text-xs text-[var(--text-faint)]">正在检查排版服务…</p>
          )}
        </div>
        <button
          type="button"
          className="fm-btn"
          onClick={() => {
            setSpec(visibleCourseReportSpec());
            setStatus("已重置为课程报告预设（黑色字色）");
          }}
        >
          重置预设
        </button>
      </header>

      <div className="fm-docs-split">
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
              <span>文字颜色</span>
              <div className="flex items-center gap-2">
                <input
                  className="h-9 w-12 cursor-pointer rounded border border-[var(--border)]"
                  type="color"
                  value={current.color || "#000000"}
                  onChange={(e) => updateCurrent({ color: e.target.value })}
                />
                <select
                  className="fm-select"
                  value={COLOR_PRESETS.includes(current.color as (typeof COLOR_PRESETS)[number])
                    ? current.color
                    : current.color || "#000000"}
                  onChange={(e) => updateCurrent({ color: e.target.value })}
                >
                  {COLOR_PRESETS.map((c) => (
                    <option key={c} value={c}>
                      {c === "#000000" ? "黑色" : c === "#333333" ? "深灰" : "深红"}
                    </option>
                  ))}
                </select>
              </div>
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
              <span>首行缩进</span>
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
            <label className="fm-docs-knob">
              <span>悬挂缩进</span>
              <input
                className="fm-input"
                type="number"
                min={0}
                max={4}
                step={1}
                value={current.hangingIndentChars}
                onChange={(e) =>
                  updateCurrent({ hangingIndentChars: Number(e.target.value) || 0 })
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

          <div className="fm-docs-margins">
            <p className="fm-section-label mb-2">表格样式</p>
            <div className="fm-docs-knobs">
              <label className="fm-docs-knob">
                <span>表头字体</span>
                <select
                  className="fm-select"
                  value={spec.table.headerFontEastAsia}
                  onChange={(e) =>
                    setSpec((s) => patchTable(s, { headerFontEastAsia: e.target.value }))
                  }
                >
                  {FONT_EAST.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </label>
              <label className="fm-docs-knob">
                <span>表头字号</span>
                <input
                  className="fm-input"
                  type="number"
                  min={8}
                  max={24}
                  value={spec.table.headerFontSizePt}
                  onChange={(e) =>
                    setSpec((s) =>
                      patchTable(s, { headerFontSizePt: Number(e.target.value) || 12 }),
                    )
                  }
                />
              </label>
              <label className="fm-docs-knob">
                <span>单元格字体</span>
                <select
                  className="fm-select"
                  value={spec.table.bodyFontEastAsia}
                  onChange={(e) =>
                    setSpec((s) => patchTable(s, { bodyFontEastAsia: e.target.value }))
                  }
                >
                  {FONT_EAST.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </label>
              <label className="fm-docs-knob">
                <span>单元格字号</span>
                <input
                  className="fm-input"
                  type="number"
                  min={8}
                  max={24}
                  step={0.5}
                  value={spec.table.bodyFontSizePt}
                  onChange={(e) =>
                    setSpec((s) =>
                      patchTable(s, { bodyFontSizePt: Number(e.target.value) || 10.5 }),
                    )
                  }
                />
              </label>
              <label className="fm-docs-knob fm-docs-knob-check">
                <input
                  type="checkbox"
                  checked={spec.table.headerBold}
                  onChange={(e) =>
                    setSpec((s) => patchTable(s, { headerBold: e.target.checked }))
                  }
                />
                <span>表头加粗</span>
              </label>
              <label className="fm-docs-knob fm-docs-knob-check">
                <input
                  type="checkbox"
                  checked={spec.table.borders}
                  onChange={(e) =>
                    setSpec((s) => patchTable(s, { borders: e.target.checked }))
                  }
                />
                <span>显示边框</span>
              </label>
            </div>
          </div>

          <div className="fm-docs-margins">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="fm-section-label mb-0">你的标题长什么样？</p>
              <button
                type="button"
                className="fm-btn"
                onClick={() => setRulesOpen((v) => !v)}
              >
                {rulesOpen ? "收起" : "展开"}
              </button>
            </div>
            {rulesOpen ? (
              <div className="space-y-3">
                <p className="text-sm text-[var(--text-muted)]">
                  左边勾「文章里有没有这种样子」，右边选「当成几级标题」。
                  默认已经帮你配对好了（章→H1，一、→H2，等），不对再改右边。
                </p>
                <div className="fm-match-presets">
                  {MATCH_PRESETS.map((p) => {
                    const on = isPresetEnabled(spec, p.id);
                    const role = getPresetRole(spec, p.id);
                    return (
                      <div key={p.id} className={`fm-match-row ${on ? "is-on" : ""}`}>
                        <label className="fm-match-row-check">
                          <input
                            type="checkbox"
                            checked={on}
                            onChange={(e) =>
                              setSpec((s) => toggleMatchPreset(s, p.id, e.target.checked))
                            }
                          />
                          <span>
                            <span className="fm-match-chip-label">{p.label}</span>
                            <span className="fm-match-chip-hint">{p.hint}</span>
                          </span>
                        </label>
                        <div className="fm-match-row-level">
                          <span className="fm-match-row-arrow">→</span>
                          <select
                            className="fm-select"
                            disabled={!on}
                            value={role}
                            aria-label={`${p.label} 当作哪一级`}
                            onChange={(e) =>
                              setSpec((s) =>
                                setPresetRole(s, p.id, e.target.value as StyleRole),
                              )
                            }
                          >
                            {RULE_ROLES.map((r) => (
                              <option key={r} value={r}>
                                {ROLE_LABELS[r] ?? r}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-1)] p-3 space-y-2">
                  <p className="text-sm font-medium text-[var(--text)]">自定义：以某段文字开头</p>
                  <p className="text-xs text-[var(--text-faint)]">
                    例如填「附录」，选「一级 H1」，就会把以「附录」开头的段落当标题。
                  </p>
                  <div className="flex flex-wrap items-end gap-2">
                    <label className="fm-docs-knob min-w-[8rem] flex-1">
                      <span>以什么开头</span>
                      <input
                        className="fm-input"
                        value={customStart}
                        onChange={(e) => setCustomStart(e.target.value)}
                        placeholder="第1章"
                      />
                    </label>
                    <label className="fm-docs-knob min-w-[7rem]">
                      <span>当作</span>
                      <select
                        className="fm-select"
                        value={customRole}
                        onChange={(e) => setCustomRole(e.target.value as StyleRole)}
                      >
                        {RULE_ROLES.map((r) => (
                          <option key={r} value={r}>
                            {ROLE_LABELS[r] ?? r}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button type="button" className="fm-btn fm-btn-primary" onClick={addCustomStartsWith}>
                      添加
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[var(--text-faint)]">
                已勾选 {MATCH_PRESETS.filter((p) => isPresetEnabled(spec, p.id)).length} 种常用格式
                {spec.matchRules.filter(isCustomMatchRule).length
                  ? `，另有 ${spec.matchRules.filter(isCustomMatchRule).length} 条自定义`
                  : ""}
                。
              </p>
            )}
          </div>

          <div className="fm-docs-tabs" role="tablist">
            <button
              type="button"
              className={`fm-docs-tab ${tab === "word" ? "is-active" : ""}`}
              onClick={() => setTab("word")}
            >
              套到 Word
            </button>
            <button
              type="button"
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
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDocxDrop}
              >
                <p className="fm-dropzone-title">
                  {docxFile ? docxFile.name : "拖入任意 .docx"}
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
                onPointerDown={withCharacterAct("celebrate")}
                onClick={() => void formatWord()}
              >
                应用并下载
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
              <button type="button" className="fm-btn" onClick={() => mdFileRef.current?.click()}>
                选择 .md
              </button>
              <textarea
                className="fm-textarea fm-docs-md-textarea"
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
              />
              <button
                type="button"
                className="fm-btn fm-btn-primary w-full"
                disabled={busy}
                onPointerDown={withCharacterAct("celebrate")}
                onClick={() => void convertMarkdown()}
              >
                转为 Word 并下载
              </button>
            </section>
          )}

          <div className="fm-docs-result">
            <p className="fm-docs-result-status">{status}</p>
            {downloadUrl ? (
              <a
                className="fm-btn fm-btn-primary"
                href={downloadUrl}
                download="free-myself.docx"
                onPointerDown={withCharacterAct("celebrate")}
              >
                下载 Word
              </a>
            ) : null}
          </div>
        </div>

        <aside className="fm-docs-preview-pane" aria-label="样式预览">
          <p className="fm-section-label mb-3">即时预览</p>
          <div className="fm-docs-paper" style={paperPad}>
            <p style={titleCss}>人工智能导论课程报告</p>
            <p style={h1Css}>第一章 背景</p>
            <p style={h2Css}>一、研究问题</p>
            <p style={h3Css}>（一）方法说明</p>
            <p style={h4Css}>1.1.1 细节标题</p>
            <p style={bodyCss}>
              左边改字体、颜色、行距，这里马上变。标题默认黑色。上传你自己的稿即可，不限测试文件。
            </p>
            <table
              className="fm-docs-preview-table"
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: "0.75rem",
                fontSize: `${spec.table.bodyFontSizePt}pt`,
                fontFamily: `"${spec.table.bodyFontEastAsia}", serif`,
                color: spec.table.bodyColor || "#000",
                border: spec.table.borders ? "1px solid #000" : "none",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      fontFamily: `"${spec.table.headerFontEastAsia}", serif`,
                      fontSize: `${spec.table.headerFontSizePt}pt`,
                      fontWeight: spec.table.headerBold ? 700 : 400,
                      color: spec.table.headerColor || "#000",
                      background: spec.table.headerShading
                        ? `#${spec.table.headerShading.replace("#", "")}`
                        : undefined,
                      border: spec.table.borders ? "1px solid #000" : "none",
                      padding: "4px 6px",
                    }}
                  >
                    表头 A
                  </th>
                  <th
                    style={{
                      fontFamily: `"${spec.table.headerFontEastAsia}", serif`,
                      fontSize: `${spec.table.headerFontSizePt}pt`,
                      fontWeight: spec.table.headerBold ? 700 : 400,
                      color: spec.table.headerColor || "#000",
                      background: spec.table.headerShading
                        ? `#${spec.table.headerShading.replace("#", "")}`
                        : undefined,
                      border: spec.table.borders ? "1px solid #000" : "none",
                      padding: "4px 6px",
                    }}
                  >
                    表头 B
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td
                    style={{
                      border: spec.table.borders ? "1px solid #000" : "none",
                      padding: "4px 6px",
                    }}
                  >
                    内容 1
                  </td>
                  <td
                    style={{
                      border: spec.table.borders ? "1px solid #000" : "none",
                      padding: "4px 6px",
                    }}
                  >
                    内容 2
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </aside>
      </div>
    </div>
  );
}
