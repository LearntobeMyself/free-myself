import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

async function ensure(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

export async function readJsonFile<T>(file: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function writeJsonFile(file: string, data: unknown): Promise<void> {
  await ensure(path.dirname(file));
  await fs.writeFile(file, JSON.stringify(data, null, 2), "utf8");
}

export function dataPath(...parts: string[]) {
  return path.join(process.cwd(), "data", ...parts);
}

export function newId(prefix = "id") {
  return `${prefix}_${randomUUID().slice(0, 8)}`;
}
