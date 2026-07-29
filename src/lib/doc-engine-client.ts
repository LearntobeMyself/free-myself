const DEFAULT_URL = "http://127.0.0.1:8765";

export function docEngineBaseUrl(): string {
  return (process.env.DOC_ENGINE_URL || DEFAULT_URL).replace(/\/$/, "");
}

export class DocEngineError extends Error {
  status: number;

  constructor(message: string, status = 502) {
    super(message);
    this.name = "DocEngineError";
    this.status = status;
  }
}

async function readErrorMessage(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { detail?: string | { msg?: string }[] };
    if (typeof data.detail === "string") return data.detail;
    if (Array.isArray(data.detail)) {
      return data.detail.map((d) => d.msg ?? JSON.stringify(d)).join("; ");
    }
  } catch {
    /* ignore */
  }
  return `排版服务返回 ${res.status}`;
}

function offlineHint(cause: unknown): string {
  const base = docEngineBaseUrl();
  const reason = cause instanceof Error ? cause.message : String(cause);
  return `连不上排版服务（${base}）。请先在 services/doc-engine 启动：uvicorn main:app --host 127.0.0.1 --port 8765。详情：${reason}`;
}

/** Upload existing .docx + FormatSpec → formatted .docx bytes */
export async function formatDocxWithEngine(
  docxBytes: ArrayBuffer | Uint8Array,
  spec: unknown,
): Promise<Uint8Array> {
  const form = new FormData();
  const blob = new Blob([docxBytes as BlobPart], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
  form.append("file", blob, "input.docx");
  form.append("spec", JSON.stringify(spec));

  let res: Response;
  try {
    res = await fetch(`${docEngineBaseUrl()}/v1/format-docx`, {
      method: "POST",
      body: form,
      signal: AbortSignal.timeout(60_000),
    });
  } catch (e) {
    throw new DocEngineError(offlineHint(e), 503);
  }

  if (!res.ok) {
    throw new DocEngineError(await readErrorMessage(res), res.status >= 500 ? 502 : 400);
  }
  return new Uint8Array(await res.arrayBuffer());
}

/** Markdown + FormatSpec → .docx bytes */
export async function markdownToDocxWithEngine(
  markdown: string,
  spec: unknown,
): Promise<Uint8Array> {
  let res: Response;
  try {
    res = await fetch(`${docEngineBaseUrl()}/v1/md-to-docx`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markdown, spec }),
      signal: AbortSignal.timeout(60_000),
    });
  } catch (e) {
    throw new DocEngineError(offlineHint(e), 503);
  }

  if (!res.ok) {
    throw new DocEngineError(await readErrorMessage(res), res.status >= 500 ? 502 : 400);
  }
  return new Uint8Array(await res.arrayBuffer());
}

export function bytesToBase64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64");
}
