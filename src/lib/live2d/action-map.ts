export type CharacterBehavior =
  | "nod"
  | "invite"
  | "wave"
  | "think"
  | "question"
  | "explain"
  | "recommend"
  | "summary"
  | "wait"
  | "remind"
  | "thanks"
  | "care"
  | "celebrate"
  | "surprise"
  | "tap";

/** TapBody index candidates (0-based: index 0 = haru_g_m01). */
export const CHARACTER_ACTION_MAP: Record<
  CharacterBehavior,
  { group: string; candidates: number[] }
> = {
  nod: { group: "TapBody", candidates: [0, 2] },
  invite: { group: "TapBody", candidates: [20] },
  wave: { group: "TapBody", candidates: [9] },
  think: { group: "TapBody", candidates: [10, 11] },
  question: { group: "TapBody", candidates: [17] },
  explain: { group: "TapBody", candidates: [21, 22] },
  recommend: { group: "TapBody", candidates: [23] },
  summary: { group: "TapBody", candidates: [25] },
  wait: { group: "TapBody", candidates: [18] },
  remind: { group: "TapBody", candidates: [19] },
  thanks: { group: "TapBody", candidates: [16, 8] },
  care: { group: "TapBody", candidates: [4, 8] },
  celebrate: { group: "TapBody", candidates: [5, 12] },
  surprise: { group: "TapBody", candidates: [12, 13] },
  /** Filled from SAFE_TAP_CANDIDATES at pick time. */
  tap: { group: "TapBody", candidates: [] },
};

/**
 * Friendly, visible motions for character click.
 * Excludes reject / warn / sad / apology (angry or downbeat).
 * Indices: m10, m21, m06, m13, m05, m17, m24, m22.
 */
export const SAFE_TAP_CANDIDATES = [9, 20, 5, 12, 4, 16, 23, 21] as const;

/** Negative / angry-adjacent indices that must never be used for UI tap. */
export const BLOCKED_TAP_INDICES = [1, 6, 7, 14, 15, 24] as const;

export function pickMotionIndex(
  behavior: CharacterBehavior,
  groupSize: number,
): number | null {
  if (groupSize <= 0) return null;

  if (behavior === "tap") {
    const valid = SAFE_TAP_CANDIDATES.filter((i) => i >= 0 && i < groupSize);
    if (valid.length === 0) return null;
    return valid[Math.floor(Math.random() * valid.length)] ?? null;
  }

  const binding = CHARACTER_ACTION_MAP[behavior];
  const valid = binding.candidates.filter((i) => i >= 0 && i < groupSize);
  if (valid.length === 0) {
    const fallback = SAFE_TAP_CANDIDATES.filter((i) => i >= 0 && i < groupSize);
    if (fallback.length === 0) return null;
    return fallback[Math.floor(Math.random() * fallback.length)] ?? null;
  }
  return valid[Math.floor(Math.random() * valid.length)] ?? null;
}
