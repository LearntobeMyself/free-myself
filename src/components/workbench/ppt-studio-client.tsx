"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  DECK_THEMES,
  defaultDeckSpec,
  previewSlideTitles,
  type DeckThemeId,
} from "@/lib/deck-spec";
import { withCharacterAct } from "@/components/live2d/with-character-act";

const SAMPLE = `# 周会汇报

本周工作进展摘要

## 本周进展

- 完成文档工坊排版链路
- 修复页边距校验
- 补充回归测试

## 下周计划

- 上线 PPT 工作室
- 收集使用反馈

## 风险与阻塞

- 暂无

## 谢谢
`;

function base64ToPptxObjectUrl(base64: string): string {
  const bin = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const blob = new Blob([bin], {
    type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  });
  return URL.createObjectURL(blob);
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

export function PptStudioClient() {
  const [themeId, setThemeId] = useState<DeckThemeId>("business-light");
  const [markdown, setMarkdown] = useState(SAMPLE);
  const [status, setStatus] = useState("粘贴大纲，选主题，生成可编辑 PPT。");
  const [busy, setBusy] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [engineHealth, setEngineHealth] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);
  const mdFileRef = useRef<HTMLInputElement>(null);

  const outline = useMemo(() => previewSlideTitles(markdown), [markdown]);

  useEffect(() => {
    let cancelled = false;
    async function check() {
      try {
        const res = await fetch("/api/ppt/health", { cache: "no-store" });
        const data = (await res.json()) as { ok?: boolean; message?: string };
        if (!cancelled) {
          setEngineHealth({
            ok: Boolean(data.ok),
            message: data.message ?? (data.ok ? "排版服务就绪" : "排版服务不可用"),
          });
        }
      } catch {
        if (!cancelled) {
          setEngineHealth({ ok: false, message: "无法检查排版服务状态" });
        }
      }
    }
    void check();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    };
  }, [downloadUrl]);

  async function onPickMd(file: File | null) {
    if (!file) return;
    if (!isMarkdownFile(file)) {
      setStatus("请上传 .md / .txt 大纲");
      return;
    }
    const text = await file.text();
    setMarkdown(text);
    setStatus(`已载入 ${file.name}`);
  }

  async function generate() {
    if (!markdown.trim()) {
      setStatus("请先粘贴大纲");
      return;
    }
    setBusy(true);
    setStatus("正在生成 PPT…");
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }
    try {
      const res = await fetch("/api/ppt/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          markdown,
          spec: defaultDeckSpec(themeId),
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        pptxBase64?: string;
        summary?: { slideCount?: number; themeId?: string };
      };
      if (!res.ok) {
        setStatus(data.error ?? "生成失败");
        return;
      }
      if (data.pptxBase64) {
        setDownloadUrl(base64ToPptxObjectUrl(data.pptxBase64));
        setStatus(
          `已生成 ${data.summary?.slideCount ?? "?"} 页 · 主题 ${data.summary?.themeId ?? themeId}`,
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
          <h1 className="fm-workbench-title">PPT</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            用 Markdown 大纲做日常演示稿：`#` 封面，`##` 一页，`-` 要点。导出可编辑 .pptx。
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
                ? " · 请先启动 services/doc-engine（npm run doc-engine）"
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
            setMarkdown(SAMPLE);
            setThemeId("business-light");
            setStatus("已填入周会示例大纲");
          }}
        >
          填入示例
        </button>
      </header>

      <div className="fm-docs-split">
        <div className="fm-docs-editor space-y-4">
          <div>
            <div className="mb-2 text-sm font-medium text-[var(--text)]">主题</div>
            <div className="flex flex-col gap-2">
              {DECK_THEMES.map((theme) => {
                const active = theme.id === themeId;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setThemeId(theme.id)}
                    className={`rounded-xl border px-3 py-2.5 text-left transition-all ${
                      active
                        ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                        : "border-[var(--border)] bg-white/50 hover:bg-[var(--bg-2)]"
                    }`}
                  >
                    <div className="text-sm font-medium text-[var(--text)]">
                      {theme.label}
                    </div>
                    <div className="mt-0.5 text-xs text-[var(--text-muted)]">
                      {theme.hint}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="text-sm font-medium text-[var(--text)]">大纲预览</div>
              <span className="text-xs text-[var(--text-faint)]">{outline.length} 页</span>
            </div>
            <ol className="space-y-1.5 rounded-xl border border-[var(--border)] bg-white/40 p-3 text-sm text-[var(--text-muted)]">
              {outline.map((title, i) => (
                <li key={`${i}-${title}`} className="flex gap-2">
                  <span className="w-5 shrink-0 text-[var(--text-faint)]">{i + 1}.</span>
                  <span className="text-[var(--text)]">{title}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="fm-docs-preview space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={mdFileRef}
              type="file"
              accept=".md,.markdown,.txt,text/plain,text/markdown"
              className="hidden"
              onChange={(e) => void onPickMd(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              className="fm-btn"
              onClick={() => mdFileRef.current?.click()}
            >
              上传 .md
            </button>
            <button
              type="button"
              className="fm-btn fm-btn-primary"
              disabled={busy}
              onPointerDown={withCharacterAct("think")}
              onClick={() => void generate()}
            >
              {busy ? "生成中…" : "生成 PPT"}
            </button>
            {downloadUrl ? (
              <a
                className="fm-btn fm-btn-primary"
                href={downloadUrl}
                download="free-myself-deck.pptx"
                onPointerDown={withCharacterAct("celebrate")}
              >
                下载 .pptx
              </a>
            ) : null}
          </div>

          <textarea
            className="fm-textarea fm-docs-md-textarea min-h-[420px] w-full font-mono text-sm"
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            spellCheck={false}
            placeholder={"# 标题\n\n## 第一页\n\n- 要点"}
          />

          <p className="text-sm text-[var(--text-muted)]">{status}</p>
        </div>
      </div>
    </div>
  );
}
