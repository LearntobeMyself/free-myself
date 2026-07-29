import { NextResponse } from "next/server";
import { normalizeSpec, type FormatSpec } from "@/lib/format-spec";
import {
  DocEngineError,
  bytesToBase64,
  formatDocxWithEngine,
} from "@/lib/doc-engine-client";
import { loadSpecById } from "@/lib/spec-store";

export const runtime = "nodejs";

async function resolveSpec(body: {
  specId?: string;
  spec?: FormatSpec;
}): Promise<FormatSpec | null> {
  if (body.spec) return normalizeSpec(body.spec);
  if (body.specId) return loadSpecById(body.specId);
  return null;
}

export async function POST(req: Request) {
  const contentType = req.headers.get("content-type") || "";

  try {
    let spec: FormatSpec | null = null;
    let docxBytes: ArrayBuffer | null = null;

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file");
      const specId = String(form.get("specId") ?? "");
      const specRaw = form.get("spec");
      if (typeof specRaw === "string" && specRaw.trim()) {
        spec = normalizeSpec(JSON.parse(specRaw));
      } else if (specId) {
        spec = await loadSpecById(specId);
      }
      if (file instanceof File) {
        docxBytes = await file.arrayBuffer();
      }
    } else {
      const body = (await req.json()) as {
        specId?: string;
        spec?: FormatSpec;
        docxBase64?: string;
      };
      spec = await resolveSpec(body);
      if (body.docxBase64) {
        const buf = Buffer.from(body.docxBase64, "base64");
        docxBytes = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
      }
    }

    if (!spec) {
      return NextResponse.json({ error: "请先选择或创建排版规范" }, { status: 400 });
    }
    if (!docxBytes || docxBytes.byteLength === 0) {
      return NextResponse.json({ error: "请上传 .docx 文件" }, { status: 400 });
    }

    const out = await formatDocxWithEngine(docxBytes, spec);
    return NextResponse.json({
      ok: true,
      docxBase64: bytesToBase64(out),
      byteLength: out.byteLength,
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
