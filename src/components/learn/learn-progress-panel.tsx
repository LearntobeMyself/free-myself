"use client";

import { useEffect, useState, useTransition } from "react";
import type { LearnTrackSlug, TrackView } from "@/lib/learn-progress";
import { LearnMedalArt } from "@/components/learn/learn-medal-art";

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
          title={`${c.date}${c.count ? " · 已打卡" : ""}`}
        />
      ))}
    </div>
  );
}

function currentMedal(view: TrackView) {
  const earned = view.medals.filter((m) => m.earned).sort((a, b) => b.rank - a.rank);
  return earned[0] ?? null;
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
        const newly = data.view.medals.filter(
          (m) => m.earned && !before.includes(m.id),
        );
        if (newly.length > 0) {
          setFlash(`新徽章入手：${newly.map((m) => m.title).join(" · ")}`);
        } else {
          setFlash(track === "harness" ? "Harness 今日火苗已点亮" : "力扣今日刀锋已出鞘");
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
        <p className="text-sm text-[var(--text-muted)]">加载徽章进度…</p>
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

  const hero = currentMedal(view);
  const nextLocked = view.medals.filter((m) => !m.earned).slice(0, 1)[0];

  return (
    <section className="mt-12">
      <p className="fm-section-label mb-4">学习动力 · {view.label}</p>

      <div className="fm-learn-drive">
        <div className="fm-learn-drive-hero">
          <div className="fm-learn-drive-crest">
            {hero ? (
              <LearnMedalArt
                medalId={hero.id}
                rank={hero.rank}
                earned
                track={track}
                size={120}
                title={hero.title}
              />
            ) : (
              <LearnMedalArt
                medalId={track === "harness" ? "h-first" : "l-first"}
                rank={1}
                earned={false}
                track={track}
                size={120}
                title={track === "harness" ? "起步学徒" : "首题破冰"}
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs tracking-wide text-[var(--text-faint)]">
              {hero ? "已佩戴徽章" : "下一枚待解锁"}
            </p>
            <p className="fm-display mt-1 text-[clamp(1.6rem,4vw,2.1rem)] leading-tight text-[var(--text)]">
              {hero ? hero.title : nextLocked?.title ?? view.currentTitle}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
              {hero
                ? hero.description
                : (nextLocked?.description ??
                  "完成今日打卡，点亮第一枚徽章。")}
            </p>
            <div className="fm-learn-drive-stats">
              <div>
                <p className="fm-mono text-2xl text-[var(--accent)]">
                  {view.stats.currentStreak}
                </p>
                <p className="text-xs text-[var(--text-faint)]">连续天</p>
              </div>
              <div>
                <p className="fm-mono text-2xl">{view.stats.totalDays}</p>
                <p className="text-xs text-[var(--text-faint)]">累计天</p>
              </div>
              <div>
                <p className="fm-mono text-2xl">{view.stats.longestStreak}</p>
                <p className="text-xs text-[var(--text-faint)]">最长连</p>
              </div>
            </div>
          </div>
        </div>

        <Heatmap cells={view.heatmap} />

        <div className="fm-learn-checkin">
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
                className="fm-checkin-btn"
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
                撤销
              </button>
            </>
          ) : (
            <button
              type="button"
              className="fm-checkin-btn"
              disabled={pending}
              onClick={checkIn}
            >
              {pending ? "点亮中…" : "点亮今日"}
            </button>
          )}
        </div>

        {view.stats.checkedToday ? (
          <p className="text-sm text-[var(--ok)]">今日已点亮。可改备注后更新。</p>
        ) : null}
        {flash ? (
          <p className="fm-learn-flash" role="status">
            {flash}
          </p>
        ) : null}
        {error ? <p className="text-sm text-[var(--bad)]">{error}</p> : null}

        <div>
          <p className="mb-3 text-xs text-[var(--text-faint)]">徽章陈列馆 · 锁定的会更想拿</p>
          <ul className="fm-medal-grid">
            {view.medals.map((m) => (
              <li key={m.id} className={m.earned ? "fm-medal-card" : "fm-medal-card is-locked"}>
                <LearnMedalArt
                  medalId={m.id}
                  rank={m.rank}
                  earned={m.earned}
                  track={track}
                  size={72}
                  title={m.title}
                />
                <p className="fm-medal-card-title">{m.earned ? m.title : "？？？"}</p>
                <p className="fm-medal-card-desc">{m.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
