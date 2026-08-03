import { z } from "zod";

export const DeckThemeIdSchema = z.enum([
  "business-light",
  "academic-clean",
  "minimal-ink",
]);

export type DeckThemeId = z.infer<typeof DeckThemeIdSchema>;

export const DeckSpecSchema = z.object({
  themeId: DeckThemeIdSchema.default("business-light"),
  aspect: z.literal("16:9").default("16:9"),
});

export type DeckSpec = z.infer<typeof DeckSpecSchema>;

export type DeckThemeMeta = {
  id: DeckThemeId;
  label: string;
  hint: string;
};

/** Built-in themes (must stay aligned with services/doc-engine/ppt_engine.py). */
export const DECK_THEMES: DeckThemeMeta[] = [
  {
    id: "business-light",
    label: "浅色商务",
    hint: "蓝灰配色，适合周会与汇报",
  },
  {
    id: "academic-clean",
    label: "简洁学术",
    hint: "白底深字，适合课程与答辩",
  },
  {
    id: "minimal-ink",
    label: "极简墨色",
    hint: "柔灰背景，强调排版层次",
  },
];

export function defaultDeckSpec(themeId: DeckThemeId = "business-light"): DeckSpec {
  return DeckSpecSchema.parse({ themeId, aspect: "16:9" });
}

export function normalizeDeckSpec(input: unknown): DeckSpec {
  return DeckSpecSchema.parse(input ?? {});
}

export function validateDeckSpec(
  input: unknown,
): { ok: true; spec: DeckSpec } | { ok: false; error: string } {
  const parsed = DeckSpecSchema.safeParse(input ?? {});
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "DeckSpec 无效" };
  }
  return { ok: true, spec: parsed.data };
}

/** Rough client-side outline preview (mirrors Python heading rules). */
export function previewSlideTitles(markdown: string): string[] {
  const lines = markdown.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const titles: string[] = [];
  let cover: string | null = null;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line === "---") continue;
    const h1 = /^#\s+(.+)$/.exec(line);
    if (h1) {
      if (!cover) {
        cover = stripMd(h1[1]!);
        titles.push(`封面：${cover}`);
      } else {
        titles.push(stripMd(h1[1]!));
      }
      continue;
    }
    const h2 = /^##\s+(.+)$/.exec(line);
    if (h2) {
      titles.push(stripMd(h2[1]!));
    }
  }

  if (titles.length === 0) {
    const first = lines.map((l) => l.trim()).find(Boolean);
    titles.push(first ? `封面：${stripMd(first)}` : "封面：演示文稿");
  }
  return titles;
}

function stripMd(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    .trim();
}
