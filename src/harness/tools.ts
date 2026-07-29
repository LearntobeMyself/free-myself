import { ToolRegistry } from "./registry";
import {
  defaultCourseReportSpec,
  ingestSpecFromNaturalLanguage,
  normalizeSpec,
  validateSpec,
  type FormatSpec,
} from "@/lib/format-spec";
import {
  blocksToMarkdown,
  buildDocxFromBlocks,
  inferBlocksFromText,
  markdownToDocx,
  parseMarkdownToBlocks,
  structureDiff,
  verifyBlocksAgainstSpec,
  type DocBlock,
} from "@/lib/document-engine";
import { extractCommitments } from "@/lib/open-loop";
import type { JsonValue } from "./types";

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
        return { ok: true, data: { spec: spec as unknown as JsonValue, warnings: v.warnings } };
      } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : String(e) };
      }
    },
  });

  registry.register({
    name: "apply_styles",
    description: "Apply FormatSpec to text/blocks and produce docx base64",
    parameters: {
      type: "object",
      properties: {
        text: { type: "string" },
        blocks: { type: "array" },
        spec: { type: "object" },
      },
      required: ["spec"],
    },
    async execute(input) {
      try {
        const spec = normalizeSpec(input.spec);
        let blocks: DocBlock[];
        if (Array.isArray(input.blocks) && input.blocks.length) {
          blocks = input.blocks as DocBlock[];
        } else {
          blocks = inferBlocksFromText(String(input.text ?? ""));
        }
        const buffer = await buildDocxFromBlocks(blocks, spec);
        return {
          ok: true,
          data: {
            blocks: blocks as unknown as JsonValue,
            docxBase64: buffer.toString("base64"),
            byteLength: buffer.byteLength,
          },
        };
      } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : String(e) };
      }
    },
  });

  registry.register({
    name: "verify_doc",
    description: "Verify document blocks against FormatSpec",
    parameters: {
      type: "object",
      properties: {
        blocks: { type: "array" },
        spec: { type: "object" },
      },
      required: ["blocks", "spec"],
    },
    async execute(input) {
      const spec = normalizeSpec(input.spec);
      const blocks = input.blocks as DocBlock[];
      const result = verifyBlocksAgainstSpec(blocks, spec);
      return {
        ok: result.passed,
        data: result as unknown as JsonValue,
        error: result.passed ? undefined : "verification failed",
      };
    },
  });

  registry.register({
    name: "md_to_docx",
    description: "Convert Markdown to DOCX using FormatSpec",
    parameters: {
      type: "object",
      properties: {
        markdown: { type: "string" },
        spec: { type: "object" },
      },
      required: ["markdown", "spec"],
    },
    async execute(input) {
      try {
        const spec = normalizeSpec(input.spec);
        const { buffer, blocks, mapping } = await markdownToDocx(
          String(input.markdown),
          spec,
        );
        return {
          ok: true,
          data: {
            blocks: blocks as unknown as JsonValue,
            mapping: mapping as unknown as JsonValue,
            docxBase64: buffer.toString("base64"),
          },
        };
      } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : String(e) };
      }
    },
  });

  registry.register({
    name: "docx_to_md",
    description: "Convert role-tagged blocks (from docx parse) to Markdown",
    parameters: {
      type: "object",
      properties: {
        blocks: { type: "array" },
        markdown: { type: "string" },
        spec: { type: "object" },
      },
    },
    async execute(input) {
      try {
        if (input.markdown && input.spec) {
          const spec = normalizeSpec(input.spec);
          const blocks = parseMarkdownToBlocks(String(input.markdown), spec);
          const md = blocksToMarkdown(blocks);
          const diffs = structureDiff(String(input.markdown), md);
          return {
            ok: diffs.length === 0,
            data: {
              markdown: md,
              diffs,
              lossy: [
                "页眉页脚",
                "文本框",
                "修订痕迹",
                "精确列宽",
                "嵌入对象",
              ],
            } as JsonValue,
            error: diffs.length ? "structure drift" : undefined,
          };
        }
        const blocks = (input.blocks ?? []) as DocBlock[];
        const md = blocksToMarkdown(blocks);
        return {
          ok: true,
          data: {
            markdown: md,
            lossy: ["页眉页脚", "文本框", "修订痕迹", "精确列宽", "嵌入对象"],
          } as JsonValue,
        };
      } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : String(e) };
      }
    },
  });

  registry.register({
    name: "extract_commitments",
    description: "Extract my commitments from pasted chat text",
    parameters: {
      type: "object",
      properties: { text: { type: "string" } },
      required: ["text"],
    },
    async execute(input) {
      const items = extractCommitments(String(input.text ?? ""));
      const invalid = items.filter((i) => !i.sourceSpan);
      if (invalid.length) {
        return { ok: false, error: "commitment missing sourceSpan" };
      }
      return { ok: true, data: { commitments: items as unknown as JsonValue } };
    },
  });

  return registry;
}
