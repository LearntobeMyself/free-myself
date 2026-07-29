import { NextResponse } from "next/server";
import { normalizeSpec, type FormatSpec } from "@/lib/format-spec";
import {
  DocEngineError,
  bytesToBase64,
  markdownToDocxWithEngine,
} from "@/lib/doc-engine-client";
import { loadSpecById } from "@/lib/spec-store";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      direction?: string;
      specId?: string;
      spec?: FormatSpec;
      markdown?: string;
    };

    if (body.direction && body.direction !== "md_to_docx") {
      return NextResponse.json(
        { error: "目前只支持 Markdown 转 Word（md_to_docx）" },
        { status: 400 },
      );
    }

    let spec: FormatSpec | null = body.spec ? normalizeSpec(body.spec) : null;
    if (!spec && body.specId) spec = await loadSpecById(body.specId);
    if (!spec) {
      return NextResponse.json({ error: "请先选择或创建排版规范" }, { status: 400 });
    }

    const markdown = body.markdown?.trim() ?? "";
    if (!markdown) {
      return NextResponse.json({ error: "请粘贴或上传 Markdown 内容" }, { status: 400 });
    }

    const { bytes, summary } = await markdownToDocxWithEngine(markdown, spec);
    return NextResponse.json({
      ok: true,
      docxBase64: bytesToBase64(bytes),
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
