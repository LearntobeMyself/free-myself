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

export type FormatSummary = {
  paragraphsStyled?: number;
  rolesUsed?: Record<string, number>;
  bodyFont?: string;
  bodySizePt?: number;
  marginCm?: Record<string, number>;
};

export type EngineDocResult = {
  bytes: Uint8Array;
  summary?: FormatSummary;
};

async function readErrorMessage(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { detail?: string | { msg?: string }[]; error?: string };
    if (typeof data.error === "string") return data.error;
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
  return `连不上排版服务（${base}）。请先在 services/doc-engine 启动 uvicorn。详情：${reason}`;
}

function b64ToBytes(b64: string): Uint8Array {
  return Uint8Array.from(Buffer.from(b64, "base64"));
}

async function parseEngineJson(res: Response): Promise<EngineDocResult> {
  const data = (await res.json()) as {
    docxBase64?: string;
    summary?: FormatSummary;
    detail?: string;
  };
  if (!data.docxBase64) {
    throw new DocEngineError(data.detail ?? "排版服务未返回文件", 502);
  }
  return { bytes: b64ToBytes(data.docxBase64), summary: data.summary };
}

/** Upload existing .docx + FormatSpec → formatted bytes + summary */
export async function formatDocxWithEngine(
  docxBytes: ArrayBuffer | Uint8Array,
  spec: unknown,
): Promise<EngineDocResult> {
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
  return parseEngineJson(res);
}

/** Markdown + FormatSpec → .docx bytes */
export async function markdownToDocxWithEngine(
  markdown: string,
  spec: unknown,
): Promise<EngineDocResult> {
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
  return parseEngineJson(res);
}

export function bytesToBase64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64");
}

/** Ping Python doc-engine `/health`. */
export async function pingDocEngine(): Promise<{
  ok: boolean;
  message: string;
}> {
  const base = docEngineBaseUrl();
  try {
    const res = await fetch(`${base}/health`, {
      method: "GET",
      signal: AbortSignal.timeout(4_000),
      cache: "no-store",
    });
    if (!res.ok) {
      return { ok: false, message: `排版服务异常（HTTP ${res.status}）` };
    }
    return { ok: true, message: `排版服务已就绪（${base}）` };
  } catch (e) {
    return { ok: false, message: offlineHint(e) };
  }
}
