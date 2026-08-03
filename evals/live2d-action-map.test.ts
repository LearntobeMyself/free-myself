import { describe, expect, it } from "vitest";
import {
  BLOCKED_TAP_INDICES,
  CHARACTER_ACTION_MAP,
  pickMotionIndex,
  SAFE_TAP_CANDIDATES,
} from "@/lib/live2d/action-map";

describe("live2d action map", () => {
  it("maps core behaviors to TapBody candidates", () => {
    expect(CHARACTER_ACTION_MAP.wave.group).toBe("TapBody");
    expect(CHARACTER_ACTION_MAP.wave.candidates).toEqual([9]);
    expect(CHARACTER_ACTION_MAP.invite.candidates).toEqual([20]);
    expect(CHARACTER_ACTION_MAP.celebrate.candidates).toContain(5);
    expect(CHARACTER_ACTION_MAP.recommend.candidates).toEqual([23]);
  });

  it("picks in-range indices", () => {
    const groupSize = 26;
    for (let i = 0; i < 20; i += 1) {
      const idx = pickMotionIndex("wave", groupSize);
      expect(idx).not.toBeNull();
      expect(idx!).toBeGreaterThanOrEqual(0);
      expect(idx!).toBeLessThan(groupSize);
    }
  });

  it("tap only picks from the friendly pool", () => {
    const groupSize = 26;
    const blocked = new Set<number>(BLOCKED_TAP_INDICES);
    for (let i = 0; i < 80; i += 1) {
      const idx = pickMotionIndex("tap", groupSize);
      expect(idx).not.toBeNull();
      expect(SAFE_TAP_CANDIDATES).toContain(idx!);
      expect(blocked.has(idx!)).toBe(false);
    }
  });

  it("tap stays in range when group is smaller than some candidates", () => {
    const idx = pickMotionIndex("tap", 10);
    expect(idx).not.toBeNull();
    expect(idx!).toBeGreaterThanOrEqual(0);
    expect(idx!).toBeLessThan(10);
    expect(SAFE_TAP_CANDIDATES).toContain(idx!);
  });

  it("returns null when group empty", () => {
    expect(pickMotionIndex("wave", 0)).toBeNull();
  });
});
