import { promises as fs } from "node:fs";
import path from "node:path";
import {
  defaultCourseReportSpec,
  normalizeSpec,
  type FormatSpec,
} from "./format-spec";
import { dataPath, newId, readJsonFile, writeJsonFile } from "./storage";

const SPEC_DIR = dataPath("specs");

export async function listSpecs(): Promise<Array<{ id: string; name: string; scene: string }>> {
  await fs.mkdir(SPEC_DIR, { recursive: true });
  const files = await fs.readdir(SPEC_DIR);
  const out: Array<{ id: string; name: string; scene: string }> = [];
  for (const f of files) {
    if (!f.endsWith(".json")) continue;
    const spec = await readJsonFile<FormatSpec | null>(path.join(SPEC_DIR, f), null);
    if (!spec) continue;
    const id = f.replace(/\.json$/, "");
    out.push({ id, name: spec.meta.name, scene: spec.meta.scene });
  }
  return out;
}

export async function loadSpecById(id: string): Promise<FormatSpec | null> {
  return readJsonFile<FormatSpec | null>(path.join(SPEC_DIR, `${id}.json`), null);
}

export async function saveSpec(spec: FormatSpec): Promise<FormatSpec> {
  const id = spec.id ?? newId("spec");
  const next = normalizeSpec({ ...spec, id });
  await writeJsonFile(path.join(SPEC_DIR, `${id}.json`), next);
  return { ...next, id };
}

export async function ensureDefaultSpec(): Promise<FormatSpec> {
  return saveSpec(defaultCourseReportSpec());
}
