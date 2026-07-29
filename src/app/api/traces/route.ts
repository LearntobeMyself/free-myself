import { NextResponse } from "next/server";
import { listRuns, loadRun } from "@/harness";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (id) {
    const run = await loadRun(id);
    if (!run) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({ run });
  }
  return NextResponse.json({ runs: await listRuns() });
}
