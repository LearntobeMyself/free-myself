import { NextResponse } from "next/server";
import {
  ingestSpecFromNaturalLanguage,
  normalizeSpec,
  validateSpec,
  type FormatSpec,
} from "@/lib/format-spec";
import { ensureDefaultSpec, listSpecs, saveSpec } from "@/lib/spec-store";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ specs: await listSpecs() });
}

export async function POST(req: Request) {
  const body = (await req.json()) as {
    action: string;
    text?: string;
    name?: string;
    spec?: FormatSpec;
  };

  if (body.action === "ensure_default") {
    const spec = await ensureDefaultSpec();
    return NextResponse.json({ spec, validation: validateSpec(spec) });
  }

  if (body.action === "from_nl") {
    const draft = ingestSpecFromNaturalLanguage(body.text ?? "", body.name);
    const validation = validateSpec(draft);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.errors, validation }, { status: 400 });
    }
    const spec = await saveSpec(draft);
    return NextResponse.json({ spec, validation });
  }

  if (body.action === "save" && body.spec) {
    try {
      const normalized = normalizeSpec(body.spec);
      const validation = validateSpec(normalized);
      if (!validation.ok) {
        return NextResponse.json({ error: validation.errors, validation }, { status: 400 });
      }
      const spec = await saveSpec(normalized);
      return NextResponse.json({ spec, validation });
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : String(e) },
        { status: 400 },
      );
    }
  }

  return NextResponse.json({ error: "unknown action" }, { status: 400 });
}
