import { z } from "zod";
import { dataPath, newId, readJsonFile, writeJsonFile } from "./storage";

export const CommitmentSchema = z.object({
  id: z.string(),
  text: z.string(),
  status: z.enum(["open", "waiting", "done"]).default("open"),
  due: z.string().optional(),
  sourceSpan: z.string().min(1),
  createdAt: z.string(),
});

export type Commitment = z.infer<typeof CommitmentSchema>;

const FILE = dataPath("open-loop", "commitments.json");

export async function loadCommitments(): Promise<Commitment[]> {
  return readJsonFile<Commitment[]>(FILE, []);
}

export async function saveCommitments(items: Commitment[]): Promise<void> {
  await writeJsonFile(FILE, items);
}

const SELF_PATTERNS = [
  /我(来|去|会|要|得|需要|负责|跟进|处理|搞定|写|发|交|改)/,
  /我这边/,
  /让我/,
  /I('ll| will| can| need to)/i,
  /我明天|我下周|我今晚|我稍后/,
];

export function extractCommitments(raw: string): Commitment[] {
  const lines = raw
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const now = new Date().toISOString();
  const out: Commitment[] = [];

  for (const line of lines) {
    if (!SELF_PATTERNS.some((p) => p.test(line))) continue;
    // skip others' asks without self ownership
    if (/你(来|去|会|要)/.test(line) && !/我/.test(line)) continue;

    let due: string | undefined;
    if (/明天/.test(line)) due = "明天";
    else if (/下周/.test(line)) due = "下周";
    else if (/今晚|今天/.test(line)) due = "今天";
    else if (/周末/.test(line)) due = "本周末";

    out.push({
      id: newId("loop"),
      text: line,
      status: "open",
      due,
      sourceSpan: line,
      createdAt: now,
    });
  }

  return out;
}

export function mergeCommitments(
  existing: Commitment[],
  incoming: Commitment[],
): Commitment[] {
  const seen = new Set(existing.map((e) => e.sourceSpan));
  const merged = [...existing];
  for (const item of incoming) {
    if (seen.has(item.sourceSpan)) continue;
    merged.unshift(item);
    seen.add(item.sourceSpan);
  }
  return merged;
}
