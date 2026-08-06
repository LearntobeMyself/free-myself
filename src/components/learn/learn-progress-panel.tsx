"use client";

import { useEffect, useState, useTransition } from "react";
import type { LearnTrackSlug, TrackView } from "@/lib/learn-progress";

function localToday(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function Heatmap({ cells }: { cells: TrackView["heatmap"] }) {
  return (
    <div className="fm-heatmap" title="近 16 周打卡热力">
      {cells.map((c) => (
        <span
          key={c.date}
          className={`fm-heatmap-cell fm-heatmap-l${c.level}`}
          title={`${c.date}${c.count ? ` · 已打卡` : ""}`}
        />
      ))}
    </div>
  );
}

export function LearnProgressPanel({ track }: { track: LearnTrackSlug }) {
  const [view, setView] = useState<TrackView | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const today = localToday();
  const placeholder =
    track === "harness"
      ? "今天学了什么？如：Day1 三层对照表"
      : "今天刷了哪题？如：1.两数之和";

  async function refresh() {
    const res = await fetch(
      `/api/learn-progress?track=${track}&today=${today}`,
      { headers: { "x-client-today": today } },
    );
    if (!res.ok) throw new Error("加载进度失败");
    const data = (await res.json()) as { view: TrackView };
    setView(data.view);
  }

  useEffect(() => {
    startTransition(() => {
      void refresh().catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "加载失败");
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once per track/day
  }, [track, today]);

  function checkIn() {
    setError(null);
    setFlash(null);
    startTransition(async () => {
      try {
        const before = view?.medals.filter((m) => m.earned).map((m) => m.id) ?? [];
        const res = await fetch("/api/learn-progress", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-client-today": today,
          },
          body: JSON.stringify({
            action: "check_in",
            track,
            date: today,
            note: note.trim() || undefined,
          }),
        });
        if (!res.ok) throw new Error("打卡失败");
        const data = (await res.json()) as { view: TrackView };
        setView(data.view);
        const newly = data.view.medals.filter((m) => m.earned && !before.includes(m.id));
        if (newly.length > 0) {
          setFlash(`解锁：${newly.map((m) => m.title).join(" · ")}`);
        } else {
          setFlash(track === "harness" ? "Harness 今日已记一笔" : "力扣今日已记一笔");
        }
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "打卡失败");
      }
    });
  }

  function undoToday() {
    setError(null);
    setFlash(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/learn-progress", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-client-today": today,
          },
          body: JSON.stringify({
            action: "undo_today",
            track,
            date: today,
          }),
        });
        if (!res.ok) throw new Error("撤销失败");
        const data = (await res.json()) as { view: TrackView };
        setView(data.view);
        setFlash("已撤销今日打卡");
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "撤销失败");
      }
    });
  }

  if (!view && !error) {
    return (
      <section className="mt-12">
        <p className="fm-section-label mb-4">学习动力</p>
        <p className="text-sm text-[var(--text-muted)]">加载打卡进度…</p>
      </section>
    );
  }

  if (!view) {
    return (
      <section className="mt-12">
        <p className="fm-section-label mb-4">学习动力</p>
        <p className="text-sm text-[var(--bad)]">{error}</p>
      </section>
    );
  }

  const earned = view.medals.filter((m) => m.earned);
  const locked = view.medals.filter((m) => !m.earned).slice(0, 3);

  return (
    <section className="mt-12">
      <p className="fm-section-label mb-4">学习动力 · {view.label}</p>

      <div className="fm-panel space-y-5 p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs text-[var(--text-faint)]">当前称号</p>
            <p className="fm-display mt-1 text-2xl text-[var(--text)]">
              {view.currentTitle}
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-center">
            <div>
              <p className="fm-mono text-2xl text-[var(--accent)]">
                {view.stats.currentStreak}
              </p>
              <p className="text-xs text-[var(--text-faint)]">连续天</p>
            </div>
            <div>
              <p className="fm-mono text-2xl text-[var(--text)]">
                {view.stats.totalDays}
              </p>
              <p className="text-xs text-[var(--text-faint)]">累计天</p>
            </div>
            <div>
              <p className="fm-mono text-2xl text-[var(--text)]">
                {view.stats.longestStreak}
              </p>
              <p className="text-xs text-[var(--text-faint)]">最长连</p>
            </div>
          </div>
        </div>

        <Heatmap cells={view.heatmap} />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            className="fm-input min-w-0 flex-1"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={placeholder}
            maxLength={200}
            disabled={pending}
          />
          {view.stats.checkedToday ? (
            <>
              <button
                type="button"
                className="fm-btn-primary text-sm"
                disabled={pending}
                onClick={checkIn}
              >
                {pending ? "记录中…" : "更新备注"}
              </button>
              <button
                type="button"
                className="fm-btn text-sm"
                disabled={pending}
                onClick={undoToday}
              >
                撤销今日
              </button>
            </>
          ) : (
            <button
              type="button"
              className="fm-btn-primary text-sm"
              disabled={pending}
              onClick={checkIn}
            >
              {pending ? "记录中…" : "今日打卡"}
            </button>
          )}
        </div>

        {view.stats.checkedToday ? (
          <p className="text-sm text-[var(--ok)]">今日已打卡。可改备注后点「更新备注」。</p>
        ) : null}
        {flash ? <p className="text-sm text-[var(--accent)]">{flash}</p> : null}
        {error ? <p className="text-sm text-[var(--bad)]">{error}</p> : null}

        <div>
          <p className="mb-2 text-xs text-[var(--text-faint)]">勋章墙</p>
          <div className="flex flex-wrap gap-2">
            {earned.map((m) => (
              <span key={m.id} className="fm-badge fm-badge-ok" title={m.description}>
                {m.title}
              </span>
            ))}
            {earned.length === 0 ? (
              <span className="text-sm text-[var(--text-muted)]">
                还没有勋章。打卡第一天即可解锁
                {track === "harness" ? "「起步学徒」" : "「首题破冰」"}。
              </span>
            ) : null}
          </div>
          {locked.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {locked.map((m) => (
                <span
                  key={m.id}
                  className="fm-badge fm-badge-wip"
                  title={m.description}
                >
                  下一档 · {m.title}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
