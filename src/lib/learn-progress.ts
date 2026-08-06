import { z } from "zod";
import { dataPath, readJsonFile, writeJsonFile } from "./storage";

export const LearnTrackSlugSchema = z.enum(["harness", "leetcode"]);
export type LearnTrackSlug = z.infer<typeof LearnTrackSlugSchema>;

export const CheckInSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  note: z.string().max(200).optional(),
  minutes: z.number().int().min(1).max(24 * 60).optional(),
});

export type CheckIn = z.infer<typeof CheckInSchema>;

export const TrackProgressSchema = z.object({
  checkIns: z.array(CheckInSchema).default([]),
});

export type TrackProgress = z.infer<typeof TrackProgressSchema>;

export const LearnProgressSchema = z.object({
  harness: TrackProgressSchema.default({ checkIns: [] }),
  leetcode: TrackProgressSchema.default({ checkIns: [] }),
});

export type LearnProgress = z.infer<typeof LearnProgressSchema>;

export type MedalDef = {
  id: string;
  title: string;
  description: string;
  /** Higher = better current title */
  rank: number;
  unlocked: (stats: TrackStats) => boolean;
};

export type TrackStats = {
  totalDays: number;
  currentStreak: number;
  longestStreak: number;
  checkedToday: boolean;
};

export type TrackView = {
  slug: LearnTrackSlug;
  label: string;
  stats: TrackStats;
  /** YYYY-MM-DD → intensity 0–4 */
  heatmap: Array<{ date: string; count: number; level: number }>;
  medals: Array<MedalDef & { earned: boolean }>;
  currentTitle: string;
  checkIns: CheckIn[];
};

const FILE = dataPath("learn", "progress.json");

export const HARNESS_MEDALS: MedalDef[] = [
  {
    id: "h-first",
    title: "起步学徒",
    description: "完成第 1 天 Harness 学习打卡",
    rank: 1,
    unlocked: (s) => s.totalDays >= 1,
  },
  {
    id: "h-streak3",
    title: "三日筑基",
    description: "连续学习 3 天",
    rank: 3,
    unlocked: (s) => s.longestStreak >= 3 || s.currentStreak >= 3,
  },
  {
    id: "h-week",
    title: "周练有成",
    description: "连续学习 7 天",
    rank: 7,
    unlocked: (s) => s.longestStreak >= 7 || s.currentStreak >= 7,
  },
  {
    id: "h-total7",
    title: "Loop 学徒",
    description: "累计打卡 7 天",
    rank: 5,
    unlocked: (s) => s.totalDays >= 7,
  },
  {
    id: "h-streak14",
    title: "骨架铸造者",
    description: "连续学习 14 天",
    rank: 14,
    unlocked: (s) => s.longestStreak >= 14 || s.currentStreak >= 14,
  },
  {
    id: "h-total21",
    title: "Harness 行者",
    description: "累计打卡 21 天",
    rank: 12,
    unlocked: (s) => s.totalDays >= 21,
  },
  {
    id: "h-total30",
    title: "月度工匠",
    description: "累计打卡 30 天",
    rank: 20,
    unlocked: (s) => s.totalDays >= 30,
  },
  {
    id: "h-streak30",
    title: "Agent 锻造师",
    description: "连续学习 30 天",
    rank: 30,
    unlocked: (s) => s.longestStreak >= 30 || s.currentStreak >= 30,
  },
];

export const LEETCODE_MEDALS: MedalDef[] = [
  {
    id: "l-first",
    title: "首题破冰",
    description: "完成第 1 天刷题打卡",
    rank: 1,
    unlocked: (s) => s.totalDays >= 1,
  },
  {
    id: "l-streak3",
    title: "三日连斩",
    description: "连续刷题 3 天",
    rank: 3,
    unlocked: (s) => s.longestStreak >= 3 || s.currentStreak >= 3,
  },
  {
    id: "l-week",
    title: "周刷不停",
    description: "连续刷题 7 天",
    rank: 7,
    unlocked: (s) => s.longestStreak >= 7 || s.currentStreak >= 7,
  },
  {
    id: "l-total15",
    title: "题感初成",
    description: "累计打卡 15 天",
    rank: 8,
    unlocked: (s) => s.totalDays >= 15,
  },
  {
    id: "l-streak14",
    title: "连斩骑士",
    description: "连续刷题 14 天",
    rank: 14,
    unlocked: (s) => s.longestStreak >= 14 || s.currentStreak >= 14,
  },
  {
    id: "l-total30",
    title: "刷题行者",
    description: "累计打卡 30 天",
    rank: 18,
    unlocked: (s) => s.totalDays >= 30,
  },
  {
    id: "l-streak30",
    title: "刀锋成势",
    description: "连续刷题 30 天",
    rank: 28,
    unlocked: (s) => s.longestStreak >= 30 || s.currentStreak >= 30,
  },
  {
    id: "l-total100",
    title: "百日刀锋",
    description: "累计打卡 100 天",
    rank: 40,
    unlocked: (s) => s.totalDays >= 100,
  },
];

function medalsFor(slug: LearnTrackSlug): MedalDef[] {
  return slug === "harness" ? HARNESS_MEDALS : LEETCODE_MEDALS;
}

export function emptyProgress(): LearnProgress {
  return LearnProgressSchema.parse({});
}

export async function loadLearnProgress(): Promise<LearnProgress> {
  const raw = await readJsonFile<unknown>(FILE, null);
  if (!raw) {
    const initial = emptyProgress();
    await saveLearnProgress(initial);
    return initial;
  }
  return LearnProgressSchema.parse(raw);
}

export async function saveLearnProgress(p: LearnProgress): Promise<void> {
  await writeJsonFile(FILE, LearnProgressSchema.parse(p));
}

/** Parse YYYY-MM-DD as UTC noon to avoid DST edge issues when shifting days. */
export function parseDateKey(date: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1, 12));
}

export function formatDateKey(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function shiftDateKey(date: string, deltaDays: number): string {
  const d = parseDateKey(date);
  d.setUTCDate(d.getUTCDate() + deltaDays);
  return formatDateKey(d);
}

export function uniqueSortedDates(checkIns: CheckIn[]): string[] {
  return [...new Set(checkIns.map((c) => c.date))].sort();
}

export function computeStreaks(
  dates: string[],
  today: string,
): { currentStreak: number; longestStreak: number } {
  const set = new Set(dates);
  let longest = 0;
  let run = 0;
  let prev: string | null = null;
  for (const date of dates) {
    if (prev && shiftDateKey(prev, 1) === date) {
      run += 1;
    } else {
      run = 1;
    }
    longest = Math.max(longest, run);
    prev = date;
  }

  let current = 0;
  if (set.has(today) || set.has(shiftDateKey(today, -1))) {
    let cursor = set.has(today) ? today : shiftDateKey(today, -1);
    while (set.has(cursor)) {
      current += 1;
      cursor = shiftDateKey(cursor, -1);
    }
  }

  return { currentStreak: current, longestStreak: longest };
}

export function computeTrackStats(
  track: TrackProgress,
  today: string,
): TrackStats {
  const dates = uniqueSortedDates(track.checkIns);
  const { currentStreak, longestStreak } = computeStreaks(dates, today);
  return {
    totalDays: dates.length,
    currentStreak,
    longestStreak,
    checkedToday: dates.includes(today),
  };
}

export function buildHeatmap(
  checkIns: CheckIn[],
  today: string,
  days = 112,
): Array<{ date: string; count: number; level: number }> {
  const counts = new Map<string, number>();
  for (const c of checkIns) {
    counts.set(c.date, (counts.get(c.date) ?? 0) + 1);
  }
  const cells: Array<{ date: string; count: number; level: number }> = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = shiftDateKey(today, -i);
    const count = counts.get(date) ?? 0;
    const level = count === 0 ? 0 : count === 1 ? 1 : count === 2 ? 2 : count <= 4 ? 3 : 4;
    cells.push({ date, count, level });
  }
  return cells;
}

export function resolveTitle(
  medals: Array<MedalDef & { earned: boolean }>,
  emptyLabel: string,
): string {
  const earned = medals.filter((m) => m.earned).sort((a, b) => b.rank - a.rank);
  return earned[0]?.title ?? emptyLabel;
}

export function buildTrackView(
  slug: LearnTrackSlug,
  track: TrackProgress,
  today: string,
): TrackView {
  const stats = computeTrackStats(track, today);
  const defs = medalsFor(slug);
  const medals = defs.map((m) => ({ ...m, earned: m.unlocked(stats) }));
  const label = slug === "harness" ? "Harness 学习" : "力扣刷题";
  const emptyTitle = slug === "harness" ? "未授衔 · 今日起步" : "未授衔 · 首题待斩";
  return {
    slug,
    label,
    stats,
    heatmap: buildHeatmap(track.checkIns, today),
    medals,
    currentTitle: resolveTitle(medals, emptyTitle),
    checkIns: [...track.checkIns].sort((a, b) => b.date.localeCompare(a.date)),
  };
}

export function checkInTrack(
  progress: LearnProgress,
  slug: LearnTrackSlug,
  input: { date: string; note?: string; minutes?: number },
): LearnProgress {
  const parsed = CheckInSchema.parse({
    date: input.date,
    note: input.note?.trim() || undefined,
    minutes: input.minutes,
  });
  const track = progress[slug];
  const without = track.checkIns.filter((c) => c.date !== parsed.date);
  const nextTrack: TrackProgress = {
    checkIns: [...without, parsed].sort((a, b) => a.date.localeCompare(b.date)),
  };
  return LearnProgressSchema.parse({
    ...progress,
    [slug]: nextTrack,
  });
}

export function undoCheckIn(
  progress: LearnProgress,
  slug: LearnTrackSlug,
  date: string,
): LearnProgress {
  const track = progress[slug];
  return LearnProgressSchema.parse({
    ...progress,
    [slug]: {
      checkIns: track.checkIns.filter((c) => c.date !== date),
    },
  });
}
