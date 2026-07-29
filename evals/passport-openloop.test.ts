import { describe, expect, it } from "vitest";
import { extractCommitments } from "@/lib/open-loop";
import {
  driftCheck,
  exportAgentsMd,
  PassportSchema,
} from "@/lib/passport";

describe("open loop", () => {
  it("extracts only my commitments with source spans", () => {
    const items = extractCommitments(
      "我下周把报告改完。\n你先去收材料。\n我今晚整理纪要。",
    );
    expect(items.length).toBe(2);
    expect(items.every((i) => i.sourceSpan.length > 0)).toBe(true);
    expect(items.some((i) => i.text.includes("你先去"))).toBe(false);
  });
});

describe("passport", () => {
  it("exports agents md and drift-checks scripts", () => {
    const p = PassportSchema.parse({
      identity: { displayName: "Test", tagline: "t", github: "https://github.com/x" },
      preferences: ["测绿才推送"],
      projects: [
        {
          id: "free-myself",
          name: "free-myself",
          summary: "s",
          stack: ["Next.js"],
          commands: ["npm test", "npm run build"],
          neverTouch: ["data/"],
        },
      ],
    });
    const md = exportAgentsMd(p);
    expect(md).toContain("测绿才推送");
    const drift = driftCheck(p, {
      name: "free-myself",
      scripts: { test: "vitest run", build: "next build" },
    });
    expect(drift.every((d) => d.ok)).toBe(true);
  });
});
