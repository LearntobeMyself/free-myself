import { NextResponse } from "next/server";
import type { FormatSpec } from "@/lib/format-spec";
import {
  DocEngineError,
  bytesToBase64,
  markdownToDocxWithEngine,
} from "@/lib/doc-engine-client";
import { resolveFormatSpec } from "@/lib/resolve-format-spec";
import { loadSpecById } from "@/lib/spec-store";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    let body: {
      direction?: string;
      specId?: string;
      spec?: FormatSpec;
      markdown?: string;
    };
    try {
      body = (await req.json()) as typeof body;
    } catch {
      return NextResponse.json({ error: "请求 JSON 无效" }, { status: 400 });
    }

    if (body.direction && body.direction !== "md_to_docx") {
      return NextResponse.json(
        { error: "目前只支持 Markdown 转 Word（md_to_docx）" },
        { status: 400 },
      );
    }

    let spec: FormatSpec | null = null;
    if (body.spec) {
      const resolved = resolveFormatSpec(body.spec);
      if (!resolved.ok) {
        return NextResponse.json(
          { error: resolved.error },
          { status: resolved.status },
        );
      }
      spec = resolved.spec;
    } else if (body.specId) {
      spec = await loadSpecById(body.specId);
    }
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
