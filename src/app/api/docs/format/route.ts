import { NextResponse } from "next/server";
import { createWorkbenchRegistry, runAgentLoop } from "@/harness";
import { normalizeSpec, type FormatSpec } from "@/lib/format-spec";
import {
  inferBlocksFromText,
  verifyBlocksAgainstSpec,
  type DocBlock,
} from "@/lib/document-engine";
import { loadSpecById } from "@/lib/spec-store";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = (await req.json()) as {
    specId?: string;
    spec?: FormatSpec;
    text?: string;
  };

  let spec: FormatSpec | null = body.spec ? normalizeSpec(body.spec) : null;
  if (!spec && body.specId) spec = await loadSpecById(body.specId);
  if (!spec) {
    return NextResponse.json({ error: "spec required" }, { status: 400 });
  }

  const text = body.text ?? "";
  const registry = createWorkbenchRegistry();
  let blocks: DocBlock[] = inferBlocksFromText(text);
  let docxBase64 = "";

  const run = await runAgentLoop({
    goal: `Format document with spec: ${spec.meta.name}`,
    registry,
    maxSteps: 6,
    policy: ({ lastTool, verifier, run: current }) => {
      if (!lastTool) {
        return {
          type: "tool",
          toolName: "apply_styles",
          input: { text, spec },
          thought: "Apply FormatSpec styles to inferred structure",
        };
      }
      if (lastTool === "apply_styles") {
        const art = current.artifacts ?? {};
        if (art.blocks) blocks = art.blocks as unknown as DocBlock[];
        if (typeof art.docxBase64 === "string") docxBase64 = art.docxBase64;
        return { type: "verify", thought: "Verify against the same FormatSpec" };
      }
      if (verifier?.passed) {
        return { type: "stop", reason: "Spec satisfied", thought: "Done" };
      }
      // one repair attempt
      if (lastTool !== "repair") {
        return {
          type: "tool",
          toolName: "apply_styles",
          input: { blocks, spec },
          thought: "Repair pass: re-apply styles to blocks",
        };
      }
      return { type: "stop", reason: "Max repair attempts", thought: "Stop" };
    },
    verify: async (current) => {
      const b = (current.artifacts?.blocks as unknown as DocBlock[]) ?? blocks;
      return verifyBlocksAgainstSpec(b, spec!);
    },
  });

  if (run.artifacts?.docxBase64 && typeof run.artifacts.docxBase64 === "string") {
    docxBase64 = run.artifacts.docxBase64;
  }

  return NextResponse.json({
    runId: run.id,
    verifier: run.verifier,
    blocks,
    docxBase64,
    status: run.status,
  });
}
