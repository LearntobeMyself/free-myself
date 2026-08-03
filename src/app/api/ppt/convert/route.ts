import { NextResponse } from "next/server";
import {
  DocEngineError,
  bytesToBase64,
  markdownToPptxWithEngine,
} from "@/lib/doc-engine-client";
import { validateDeckSpec } from "@/lib/deck-spec";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    let body: {
      markdown?: string;
      spec?: unknown;
      themeId?: string;
    };
    try {
      body = (await req.json()) as typeof body;
    } catch {
      return NextResponse.json({ error: "请求 JSON 无效" }, { status: 400 });
    }

    const markdown = body.markdown?.trim() ?? "";
    if (!markdown) {
      return NextResponse.json({ error: "请粘贴大纲或 Markdown" }, { status: 400 });
    }

    const resolved = validateDeckSpec(
      body.spec ?? { themeId: body.themeId ?? "business-light", aspect: "16:9" },
    );
    if (!resolved.ok) {
      return NextResponse.json({ error: resolved.error }, { status: 400 });
    }

    const { bytes, summary } = await markdownToPptxWithEngine(markdown, resolved.spec);
    return NextResponse.json({
      ok: true,
      pptxBase64: bytesToBase64(bytes),
      byteLength: bytes.byteLength,
      summary,
      engine: "python",
    });
  } catch (e) {
    if (e instanceof DocEngineError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}
