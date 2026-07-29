import { promises as fs } from "node:fs";
import path from "node:path";
import { PassportClient } from "@/components/workbench/passport-client";
import { driftCheck, loadPassport } from "@/lib/passport";

export const dynamic = "force-dynamic";

export default async function PassportPage() {
  const passport = await loadPassport();
  const pkg = JSON.parse(
    await fs.readFile(path.join(process.cwd(), "package.json"), "utf8"),
  ) as { name?: string; scripts?: Record<string, string> };

  return (
    <PassportClient
      initialPassport={passport}
      initialDrift={driftCheck(passport, pkg)}
    />
  );
}
