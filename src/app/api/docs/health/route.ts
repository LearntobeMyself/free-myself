import { NextResponse } from "next/server";
import { pingDocEngine } from "@/lib/doc-engine-client";

export const runtime = "nodejs";

export async function GET() {
  const result = await pingDocEngine();
  return NextResponse.json(result, { status: result.ok ? 200 : 503 });
}
