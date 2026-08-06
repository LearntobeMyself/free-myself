import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  LearnTrackSchema,
  extractLessonTitle,
  resolveLessonFileName,
  rewriteLearnMarkdownLinks,
  type LearnTrack,
  type LessonMeta,
} from "@/lib/learn-lessons";

export async function loadLesson(
  track: LearnTrack,
  slug: string,
): Promise<LessonMeta | null> {
  const parsed = LearnTrackSchema.safeParse(track);
  if (!parsed.success) return null;
  const fileName = resolveLessonFileName(slug);
  if (!fileName) return null;

  const docPath = `docs/learn/${parsed.data}/${fileName}`;
  const root = path.resolve(process.cwd(), "docs", "learn", parsed.data);
  const abs = path.resolve(root, fileName);
  const rel = path.relative(root, abs);
  if (rel.startsWith("..") || path.isAbsolute(rel)) return null;

  try {
    const raw = await readFile(abs, "utf8");
    const markdown = rewriteLearnMarkdownLinks(raw, parsed.data);
    const title = extractLessonTitle(raw, slug);
    const urlSlug =
      fileName.toLowerCase() === "readme.md" ? "overview" : slug;
    return {
      track: parsed.data,
      slug: urlSlug,
      docPath,
      title,
      markdown,
    };
  } catch {
    return null;
  }
}
