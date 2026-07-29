import { z } from "zod";
import { dataPath, newId, readJsonFile, writeJsonFile } from "./storage";

export const PassportSchema = z.object({
  identity: z.object({
    displayName: z.string().default("LearntobeMyself"),
    tagline: z.string().default("Free Myself — 个人解放站 + Harness 练兵场"),
    email: z.string().optional(),
    github: z.string().default("https://github.com/LearntobeMyself"),
  }),
  preferences: z.array(z.string()).default([]),
  projects: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        summary: z.string(),
        stack: z.array(z.string()).default([]),
        commands: z.array(z.string()).default([]),
        neverTouch: z.array(z.string()).default([]),
      }),
    )
    .default([]),
  decisions: z
    .array(
      z.object({
        id: z.string(),
        at: z.string(),
        title: z.string(),
        detail: z.string(),
      }),
    )
    .default([]),
  handoffs: z
    .array(
      z.object({
        id: z.string(),
        at: z.string(),
        content: z.string(),
      }),
    )
    .default([]),
});

export type Passport = z.infer<typeof PassportSchema>;

const FILE = dataPath("passport", "passport.json");

export async function loadPassport(): Promise<Passport> {
  const raw = await readJsonFile<unknown>(FILE, null);
  if (!raw) {
    const initial = PassportSchema.parse({
      identity: {},
      preferences: [
        "确定性校验优先于模型自评",
        "测绿才推送",
        "中文沟通简洁直接",
      ],
      projects: [
        {
          id: "free-myself",
          name: "free-myself",
          summary: "个人解放站 + mini agent harness + 文档工坊",
          stack: ["Next.js", "TypeScript", "Vitest", "docx"],
          commands: ["npm run dev", "npm test", "npm run build"],
          neverTouch: [".env", "data/"],
        },
      ],
      decisions: [],
      handoffs: [],
    });
    await savePassport(initial);
    return initial;
  }
  return PassportSchema.parse(raw);
}

export async function savePassport(p: Passport): Promise<void> {
  await writeJsonFile(FILE, PassportSchema.parse(p));
}

export function exportAgentsMd(p: Passport): string {
  const lines = [
    `# AGENTS.md — ${p.identity.displayName}`,
    "",
    p.identity.tagline,
    "",
    "## Identity",
    `- GitHub: ${p.identity.github}`,
    p.identity.email ? `- Email: ${p.identity.email}` : "",
    "",
    "## Preferences",
    ...p.preferences.map((x) => `- ${x}`),
    "",
    "## Projects",
  ];
  for (const proj of p.projects) {
    lines.push(`### ${proj.name}`, proj.summary, "");
    if (proj.stack.length) lines.push(`Stack: ${proj.stack.join(", ")}`);
    if (proj.commands.length) {
      lines.push("Commands:", ...proj.commands.map((c) => `- \`${c}\``));
    }
    if (proj.neverTouch.length) {
      lines.push("Never touch:", ...proj.neverTouch.map((c) => `- ${c}`));
    }
    lines.push("");
  }
  if (p.decisions.length) {
    lines.push("## Decision Log");
    for (const d of p.decisions.slice(0, 20)) {
      lines.push(`- **${d.title}** (${d.at}): ${d.detail}`);
    }
    lines.push("");
  }
  if (p.handoffs[0]) {
    lines.push("## Latest Handoff", p.handoffs[0].content, "");
  }
  return lines.filter((l) => l !== undefined).join("\n");
}

export function exportCursorRules(p: Passport): string {
  return [
    "---",
    "description: Exported from Free Myself Context Passport",
    "globs:",
    "alwaysApply: true",
    "---",
    "",
    `# ${p.identity.displayName} rules`,
    "",
    ...p.preferences.map((x) => `- ${x}`),
    "",
    "## Project free-myself",
    ...(p.projects[0]?.neverTouch.map((x) => `- Do not commit secrets or mutate ${x}`) ?? []),
  ].join("\n");
}

export function driftCheck(
  passport: Passport,
  packageJson: { name?: string; scripts?: Record<string, string> },
): Array<{ id: string; ok: boolean; detail: string }> {
  const checks: Array<{ id: string; ok: boolean; detail: string }> = [];
  const proj = passport.projects.find((p) => p.name === "free-myself") ?? passport.projects[0];
  if (!proj) {
    return [{ id: "project", ok: false, detail: "护照中无项目" }];
  }
  checks.push({
    id: "package-name",
    ok: !packageJson.name || packageJson.name.includes("free-myself") || packageJson.name === "free-myself",
    detail: `package.json name=${packageJson.name}`,
  });
  for (const cmd of proj.commands) {
    const script = cmd.replace(/^npm run\s+/, "").replace(/^npm\s+/, "");
    const key = script === "test" ? "test" : script;
    const has =
      Boolean(packageJson.scripts?.[key]) ||
      cmd.includes("npm test") ||
      cmd.includes("npm run");
    checks.push({
      id: `cmd-${key}`,
      ok: has,
      detail: `护照命令: ${cmd}`,
    });
  }
  return checks;
}

export function addDecision(p: Passport, title: string, detail: string): Passport {
  return {
    ...p,
    decisions: [
      {
        id: newId("dec"),
        at: new Date().toISOString(),
        title,
        detail,
      },
      ...p.decisions,
    ],
  };
}

export function addHandoff(p: Passport, content: string): Passport {
  return {
    ...p,
    handoffs: [
      {
        id: newId("hand"),
        at: new Date().toISOString(),
        content,
      },
      ...p.handoffs,
    ],
  };
}
