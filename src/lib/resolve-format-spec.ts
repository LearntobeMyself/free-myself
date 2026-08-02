import { ZodError } from "zod";
import { normalizeSpec, validateSpec, type FormatSpec } from "@/lib/format-spec";

export type ResolveSpecResult =
  | { ok: true; spec: FormatSpec }
  | { ok: false; error: string; status: 400 };

/** Parse / normalize / validate a FormatSpec for API routes. */
export function resolveFormatSpec(input: unknown): ResolveSpecResult {
  try {
    const spec = normalizeSpec(input);
    const validation = validateSpec(spec);
    if (!validation.ok) {
      return {
        ok: false,
        error: validation.errors.join("；") || "排版规范校验失败",
        status: 400,
      };
    }
    return { ok: true, spec };
  } catch (e) {
    if (e instanceof ZodError) {
      const msg = e.issues
        .slice(0, 3)
        .map((i) => `${i.path.join(".") || "spec"}: ${i.message}`)
        .join("；");
      return { ok: false, error: msg || "排版规范格式不正确", status: 400 };
    }
    return {
      ok: false,
      error: e instanceof Error ? e.message : "排版规范无法解析",
      status: 400,
    };
  }
}

/** Parse a JSON string field from multipart forms. */
export function parseSpecJson(raw: string): ResolveSpecResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: "排版规范 JSON 无效", status: 400 };
  }
  return resolveFormatSpec(parsed);
}
