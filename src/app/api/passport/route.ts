import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import {
  addDecision,
  addHandoff,
  driftCheck,
  exportAgentsMd,
  exportCursorRules,
  loadPassport,
  savePassport,
  type Passport,
} from "@/lib/passport";

export const runtime = "nodejs";

export async function GET() {
  const passport = await loadPassport();
  const pkg = JSON.parse(
    await fs.readFile(path.join(process.cwd(), "package.json"), "utf8"),
  ) as { name?: string; scripts?: Record<string, string> };
  return NextResponse.json({
    passport,
    drift: driftCheck(passport, pkg),
  });
}

export async function POST(req: Request) {
  const body = (await req.json()) as {
    action: string;
    passport?: Passport;
    title?: string;
    detail?: string;
    content?: string;
  };

  let passport = await loadPassport();
  let exported: string | undefined;

  switch (body.action) {
    case "save":
      if (!body.passport) {
        return NextResponse.json({ error: "missing passport" }, { status: 400 });
      }
      passport = body.passport;
      await savePassport(passport);
      break;
    case "add_decision":
      passport = addDecision(passport, body.title ?? "untitled", body.detail ?? "");
      await savePassport(passport);
      break;
    case "add_handoff":
      passport = addHandoff(passport, body.content ?? "");
      await savePassport(passport);
      break;
    case "export_agents":
      exported = exportAgentsMd(passport);
      break;
    case "export_cursor":
      exported = exportCursorRules(passport);
      break;
    case "drift":
      break;
    default:
      return NextResponse.json({ error: "unknown action" }, { status: 400 });
  }

  const pkg = JSON.parse(
    await fs.readFile(path.join(process.cwd(), "package.json"), "utf8"),
  ) as { name?: string; scripts?: Record<string, string> };

  return NextResponse.json({
    passport,
    export: exported,
    drift: driftCheck(passport, pkg),
  });
}
