import { NextResponse } from "next/server";
import { createWorkbenchRegistry, runAgentLoop } from "@/harness";
import { normalizeSpec, type FormatSpec } from "@/lib/format-spec";
import {
  blocksToMarkdown,
  parseMarkdownToBlocks,
  structureDiff,
  verifyBlocksAgainstSpec,
} from "@/lib/document-engine";
import { loadSpecById } from "@/lib/spec-store";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = (await req.json()) as {
    direction: "md_to_docx" | "docx_to_md_roundtrip";
    specId?: string;
    spec?: FormatSpec;
    markdown?: string;
  };

  let spec: FormatSpec | null = body.spec ? normalizeSpec(body.spec) : null;
  if (!spec && body.specId) spec = await loadSpecById(body.specId);
  if (!spec) {
    return NextResponse.json({ error: "spec required" }, { status: 400 });
  }

  const markdown = body.markdown ?? "";
  const registry = createWorkbenchRegistry();

  if (body.direction === "md_to_docx") {
    const run = await runAgentLoop({
      goal: "Markdown to DOCX with FormatSpec",
      registry,
      maxSteps: 5,
      policy: ({ lastTool, verifier }) => {
        if (!lastTool) {
          return {
            type: "tool",
            toolName: "md_to_docx",
            input: { markdown, spec },
            thought: "Convert MD using mdMapping + styles",
          };
        }
        if (lastTool === "md_to_docx") {
          return { type: "verify", thought: "Verify produced blocks" };
        }
        if (verifier?.passed) return { type: "stop", reason: "OK" };
        return { type: "stop", reason: "Verification incomplete" };
      },
      verify: async (current) => {
        const blocks = (current.artifacts?.blocks as unknown as ReturnType<
          typeof parseMarkdownToBlocks
        >) ?? parseMarkdownToBlocks(markdown, spec!);
        return verifyBlocksAgainstSpec(blocks, spec!);
      },
    });

    return NextResponse.json({
      ok: run.status === "completed",
      runId: run.id,
      mapping: run.artifacts?.mapping,
      docxBase64: run.artifacts?.docxBase64,
      verifier: run.verifier,
      blocks: run.artifacts?.blocks,
    });
  }

  // structural roundtrip
  const run = await runAgentLoop({
    goal: "Markdown structural roundtrip check",
    registry,
    maxSteps: 4,
    policy: ({ lastTool }) => {
      if (!lastTool) {
        return {
          type: "tool",
          toolName: "docx_to_md",
          input: { markdown, spec },
          thought: "Parse MD to blocks and back; report diffs",
        };
      }
      return { type: "stop", reason: "Roundtrip finished" };
    },
  });

  const blocks = parseMarkdownToBlocks(markdown, spec);
  const back = blocksToMarkdown(blocks);
  const diffs = structureDiff(markdown, back);

  return NextResponse.json({
    ok: diffs.length === 0,
    runId: run.id,
    markdown: back,
    diffs,
    lossy: ["页眉页脚", "文本框", "修订痕迹", "精确列宽", "嵌入对象"],
    verifier: verifyBlocksAgainstSpec(blocks, spec),
  });
}
