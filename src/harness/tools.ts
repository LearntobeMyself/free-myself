import { ToolRegistry } from "./registry";
import {
  defaultCourseReportSpec,
  ingestSpecFromNaturalLanguage,
  normalizeSpec,
  validateSpec,
  type FormatSpec,
} from "@/lib/format-spec";
import type { JsonValue } from "./types";

/**
 * Minimal harness registry for smoke tests + FormatSpec ingest.
 * Document bytes are produced by the Python doc-engine via Next API routes.
 */
export function createWorkbenchRegistry(): ToolRegistry {
  const registry = new ToolRegistry();

  registry.register({
    name: "echo_structured",
    description: "Echo structured payload for harness smoke tests",
    parameters: {
      type: "object",
      properties: { message: { type: "string" } },
      required: ["message"],
    },
    async execute(input) {
      const message = String(input.message ?? "");
      return {
        ok: true,
        data: { echo: message, length: message.length },
      };
    },
  });

  registry.register({
    name: "assert_schema",
    description: "Assert that a value is a non-empty object",
    parameters: {
      type: "object",
      properties: { value: { type: "object" } },
      required: ["value"],
    },
    async execute(input) {
      const value = input.value;
      const ok =
        typeof value === "object" && value !== null && !Array.isArray(value);
      return ok
        ? { ok: true, data: { valid: true } }
        : { ok: false, error: "value must be a non-empty object" };
    },
  });

  registry.register({
    name: "ingest_spec",
    description: "Parse natural language or JSON into FormatSpec",
    parameters: {
      type: "object",
      properties: {
        naturalLanguage: { type: "string" },
        json: { type: "object" },
        name: { type: "string" },
      },
    },
    async execute(input) {
      try {
        let spec: FormatSpec;
        if (input.json) {
          spec = normalizeSpec(input.json);
        } else if (input.naturalLanguage) {
          spec = ingestSpecFromNaturalLanguage(
            String(input.naturalLanguage),
            input.name ? String(input.name) : undefined,
          );
        } else {
          spec = defaultCourseReportSpec();
        }
        const v = validateSpec(spec);
        if (!v.ok) return { ok: false, error: v.errors.join("; ") };
        return {
          ok: true,
          data: { spec: spec as unknown as JsonValue, warnings: v.warnings },
        };
      } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : String(e) };
      }
    },
  });

  return registry;
}
