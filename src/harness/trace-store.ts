import { promises as fs } from "node:fs";
import path from "node:path";
import type { AgentRun, TraceStep } from "./types";

const ROOT = path.join(process.cwd(), "data", "traces");

async function ensureRoot() {
  await fs.mkdir(ROOT, { recursive: true });
}

export async function saveRun(run: AgentRun): Promise<void> {
  await ensureRoot();
  const file = path.join(ROOT, `${run.id}.json`);
  await fs.writeFile(file, JSON.stringify(run, null, 2), "utf8");
}

export async function loadRun(id: string): Promise<AgentRun | null> {
  try {
    const raw = await fs.readFile(path.join(ROOT, `${id}.json`), "utf8");
    return JSON.parse(raw) as AgentRun;
  } catch {
    return null;
  }
}

export async function listRuns(): Promise<AgentRun[]> {
  await ensureRoot();
  const files = await fs.readdir(ROOT);
  const runs: AgentRun[] = [];
  for (const file of files) {
    if (!file.endsWith(".json")) continue;
    const run = await loadRun(file.replace(/\.json$/, ""));
    if (run) runs.push(run);
  }
  return runs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function appendStep(run: AgentRun, step: Omit<TraceStep, "id" | "at">): AgentRun {
  const next: TraceStep = {
    ...step,
    id: `step_${run.steps.length + 1}`,
    at: new Date().toISOString(),
  };
  return {
    ...run,
    steps: [...run.steps, next],
    updatedAt: next.at,
  };
}
