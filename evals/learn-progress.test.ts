import { describe, expect, it } from "vitest";
import {
  buildHeatmap,
  buildTrackView,
  checkInTrack,
  computeStreaks,
  emptyProgress,
  shiftDateKey,
} from "@/lib/learn-progress";

describe("learn progress streaks", () => {
  it("counts current streak ending today", () => {
    const today = "2026-08-06";
    const dates = ["2026-08-04", "2026-08-05", "2026-08-06"];
    expect(computeStreaks(dates, today).currentStreak).toBe(3);
    expect(computeStreaks(dates, today).longestStreak).toBe(3);
  });

  it("keeps streak if yesterday checked but not today", () => {
    const today = "2026-08-06";
    const dates = ["2026-08-04", "2026-08-05"];
    expect(computeStreaks(dates, today).currentStreak).toBe(2);
  });

  it("resets current streak after a gap", () => {
    const today = "2026-08-06";
    const dates = ["2026-08-01", "2026-08-06"];
    expect(computeStreaks(dates, today).currentStreak).toBe(1);
    expect(computeStreaks(dates, today).longestStreak).toBe(1);
  });
});

describe("learn progress check-in and medals", () => {
  it("upserts same-day check-in and unlocks first medal", () => {
    let p = emptyProgress();
    p = checkInTrack(p, "harness", { date: "2026-08-06", note: "Day1" });
    p = checkInTrack(p, "harness", { date: "2026-08-06", note: "Day1 补记" });
    expect(p.harness.checkIns).toHaveLength(1);
    expect(p.harness.checkIns[0]?.note).toBe("Day1 补记");

    const view = buildTrackView("harness", p.harness, "2026-08-06");
    expect(view.stats.checkedToday).toBe(true);
    expect(view.currentTitle).toBe("起步学徒");
    expect(view.medals.find((m) => m.id === "h-first")?.earned).toBe(true);
  });

  it("unlocks leetcode first medal independently", () => {
    let p = emptyProgress();
    p = checkInTrack(p, "leetcode", { date: "2026-08-06", note: "两数之和" });
    const view = buildTrackView("leetcode", p.leetcode, "2026-08-06");
    expect(view.currentTitle).toBe("首题破冰");
    expect(buildTrackView("harness", p.harness, "2026-08-06").currentTitle).toContain(
      "未授衔",
    );
  });
});

describe("heatmap", () => {
  it("builds fixed window ending today", () => {
    const today = "2026-08-06";
    const cells = buildHeatmap([{ date: today }], today, 7);
    expect(cells).toHaveLength(7);
    expect(cells[0]?.date).toBe(shiftDateKey(today, -6));
    expect(cells[6]?.date).toBe(today);
    expect(cells[6]?.level).toBeGreaterThan(0);
  });
});
