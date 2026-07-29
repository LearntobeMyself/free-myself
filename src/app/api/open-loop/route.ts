import { NextResponse } from "next/server";
import { createWorkbenchRegistry, runAgentLoop } from "@/harness";
import {
  extractCommitments,
  loadCommitments,
  mergeCommitments,
  saveCommitments,
  type Commitment,
} from "@/lib/open-loop";

export const runtime = "nodejs";

export async function GET() {
  const items = await loadCommitments();
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const body = (await req.json()) as {
    action: string;
    text?: string;
    id?: string;
    status?: Commitment["status"];
  };

  if (body.action === "update") {
    const items = await loadCommitments();
    const next = items.map((i) =>
      i.id === body.id && body.status ? { ...i, status: body.status } : i,
    );
    await saveCommitments(next);
    return NextResponse.json({ items: next });
  }

  if (body.action !== "extract") {
    return NextResponse.json({ error: "unknown action" }, { status: 400 });
  }

  const registry = createWorkbenchRegistry();
  const text = body.text ?? "";

  const run = await runAgentLoop({
    goal: "Extract my commitments from pasted text",
    registry,
    maxSteps: 4,
    policy: ({ lastTool, lastOk }) => {
      if (!lastTool) {
        return {
          type: "tool",
          toolName: "extract_commitments",
          input: { text },
          thought: "Extract commitments with source spans",
        };
      }
      if (lastOk) {
        return { type: "stop", reason: "Commitments extracted", thought: "Done" };
      }
      return { type: "stop", reason: "Extraction failed", thought: "Stop on failure" };
    },
  });

  const extracted = extractCommitments(text);
  if (extracted.some((c) => !c.sourceSpan)) {
    return NextResponse.json({ error: "missing sourceSpan" }, { status: 400 });
  }

  const existing = await loadCommitments();
  const merged = mergeCommitments(existing, extracted);
  await saveCommitments(merged);

  return NextResponse.json({
    items: merged,
    added: extracted.length,
    runId: run.id,
  });
}
