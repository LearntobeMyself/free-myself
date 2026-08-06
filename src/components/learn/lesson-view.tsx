"use client";

import Link from "next/link";
import { marked } from "marked";
import { useEffect, useMemo, useState, useTransition } from "react";
import {
  splitLessonBlocks,
  type LearnTrack,
  type LessonBlock,
} from "@/lib/learn-lessons";

marked.setOptions({ gfm: true, breaks: false });

function storageKey(track: LearnTrack, slug: string) {
  return `fm-lesson-checkpoints:v1:${track}/${slug}`;
}

function loadChecked(
  track: LearnTrack,
  slug: string,
  blocks: LessonBlock[],
): Record<string, boolean> {
  const defaults: Record<string, boolean> = {};
  for (const b of blocks) {
    if (b.type === "checkpoint") defaults[b.id] = b.defaultChecked;
  }
  if (typeof window === "undefined") return defaults;
  try {
    const raw = window.localStorage.getItem(storageKey(track, slug));
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as { completed?: string[] };
    const set = new Set(parsed.completed ?? []);
    const next = { ...defaults };
    for (const b of blocks) {
      if (b.type === "checkpoint") next[b.id] = set.has(b.id);
    }
    return next;
  } catch {
    return defaults;
  }
}

function MarkdownChunk({ content }: { content: string }) {
  const html = useMemo(() => marked.parse(content, { async: false }) as string, [content]);
  return (
    <div
      className="fm-lesson-md"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function CheckpointRow({
  id,
  label,
  checked,
  onToggle,
}: {
  id: string;
  label: string;
  checked: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <label
      className={`fm-checkpoint ${checked ? "is-done" : ""}`}
      htmlFor={id}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={() => onToggle(id)}
        className="fm-checkpoint-input"
      />
      <span className="fm-checkpoint-box" aria-hidden />
      <span className="fm-checkpoint-label">{label}</span>
    </label>
  );
}

export function LessonView({
  track,
  slug,
  title,
  markdown,
}: {
  track: LearnTrack;
  slug: string;
  title: string;
  markdown: string;
}) {
  const hubHref = `/learn/${track}`;
  const hubLabel = track === "harness" ? "Harness 学习" : "力扣刷题";
  const blocks = useMemo(() => splitLessonBlocks(markdown), [markdown]);
  const checkpoints = useMemo(
    () => blocks.filter((b): b is Extract<LessonBlock, { type: "checkpoint" }> => b.type === "checkpoint"),
    [blocks],
  );

  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    const defaults: Record<string, boolean> = {};
    for (const b of checkpoints) defaults[b.id] = b.defaultChecked;
    return defaults;
  });
  const [hydrated, setHydrated] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    startTransition(() => {
      setChecked(loadChecked(track, slug, blocks));
      setHydrated(true);
    });
  }, [track, slug, blocks]);

  useEffect(() => {
    if (!hydrated) return;
    const completed = Object.entries(checked)
      .filter(([, v]) => v)
      .map(([k]) => k);
    window.localStorage.setItem(
      storageKey(track, slug),
      JSON.stringify({ completed, updatedAt: new Date().toISOString() }),
    );
  }, [checked, hydrated, track, slug]);

  const done = checkpoints.filter((c) => checked[c.id]).length;
  const total = checkpoints.length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  const toggle = (id: string) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <main className="fm-lesson mx-auto max-w-3xl px-5 py-14 md:py-20">
      <p className="mb-4 text-sm text-[var(--text-faint)]">
        <Link href="/" className="hover:text-[var(--text)]">
          Free myself
        </Link>
        <span className="mx-2 opacity-40">/</span>
        <Link href={hubHref} className="hover:text-[var(--text)]">
          {hubLabel}
        </Link>
        <span className="mx-2 opacity-40">/</span>
        <span>课文</span>
      </p>

      <header className="fm-lesson-hero">
        <p className="fm-section-label mb-3">站内课文</p>
        <h1 className="fm-display text-[clamp(1.75rem,4.5vw,2.5rem)] leading-tight text-[var(--text)]">
          {title}
        </h1>
        {total > 0 ? (
          <div className="fm-lesson-progress mt-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm text-[var(--text-muted)]">
                检查点{" "}
                <span className="fm-mono text-[var(--accent)]">
                  {done}/{total}
                </span>
              </p>
              <p className="fm-mono text-xs text-[var(--text-faint)]">{pct}%</p>
            </div>
            <div className="fm-lesson-bar" aria-hidden>
              <div className="fm-lesson-bar-fill" style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-2 text-xs text-[var(--text-faint)]">
              勾选表示你已亲手做完；进度保存在本机浏览器。
            </p>
          </div>
        ) : null}
      </header>

      <article className="fm-lesson-body mt-10">
        {blocks.map((block, i) =>
          block.type === "md" ? (
            <MarkdownChunk key={`md-${i}`} content={block.content} />
          ) : (
            <CheckpointRow
              key={block.id}
              id={block.id}
              label={block.label}
              checked={Boolean(checked[block.id])}
              onToggle={toggle}
            />
          ),
        )}
      </article>

      <footer className="mt-12 flex flex-wrap gap-2 border-t border-[var(--border)] pt-8">
        <Link href={hubHref} className="fm-btn text-sm">
          返回{hubLabel}
        </Link>
        {total > 0 && done === total ? (
          <Link href={hubHref} className="fm-btn fm-btn-primary text-sm">
            全部完成 · 去点亮今日
          </Link>
        ) : null}
      </footer>
    </main>
  );
}
