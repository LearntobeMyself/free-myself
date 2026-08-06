import { z } from "zod";

export const LearnTrackSchema = z.enum(["harness", "leetcode"]);
export type LearnTrack = z.infer<typeof LearnTrackSchema>;

const SLUG_RE = /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/;

export type LessonMeta = {
  track: LearnTrack;
  slug: string;
  /** Absolute path under repo, e.g. docs/learn/harness/month-01-day01.md */
  docPath: string;
  title: string;
  markdown: string;
};

/** Map curriculum docPath → in-app lesson href (never GitHub blob). */
export function lessonHrefFromDocPath(docPath: string): string | null {
  const m = docPath.match(/^docs\/learn\/(harness|leetcode)\/(.+)\.md$/i);
  if (!m) return null;
  const track = m[1].toLowerCase() as LearnTrack;
  const file = m[2];
  const slug = file.toLowerCase() === "readme" ? "overview" : file;
  return `/learn/${track}/${slug}`;
}

/** Resolve URL slug → filename under docs/learn/{track}/ */
export function resolveLessonFileName(slug: string): string | null {
  if (!SLUG_RE.test(slug)) return null;
  if (slug.toLowerCase() === "overview") return "README.md";
  return `${slug}.md`;
}

export function lessonKey(track: LearnTrack, slug: string): string {
  return `${track}/${slug}`;
}

export type LessonBlock =
  | { type: "md"; content: string }
  | { type: "checkpoint"; id: string; label: string; defaultChecked: boolean };

function checkpointId(index: number, label: string): string {
  let h = 0;
  for (let i = 0; i < label.length; i += 1) {
    h = (h * 31 + label.charCodeAt(i)) >>> 0;
  }
  return `cp-${index}-${h.toString(36)}`;
}

/** Split GFM task list items into interactive checkpoint blocks. */
export function splitLessonBlocks(markdown: string): LessonBlock[] {
  const lines = markdown.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const blocks: LessonBlock[] = [];
  let buf: string[] = [];
  let cpIndex = 0;

  const flush = () => {
    if (buf.length === 0) return;
    blocks.push({ type: "md", content: buf.join("\n") });
    buf = [];
  };

  for (const line of lines) {
    const m = line.match(/^(\s*)-\s*\[([ xX])\]\s+(.*)$/);
    if (m) {
      flush();
      const label = m[3].trim();
      blocks.push({
        type: "checkpoint",
        id: checkpointId(cpIndex, label),
        label,
        defaultChecked: m[2].toLowerCase() === "x",
      });
      cpIndex += 1;
    } else {
      buf.push(line);
    }
  }
  flush();
  return blocks;
}

function basenamePosix(file: string): string {
  const normalized = file.replace(/\\/g, "/");
  const parts = normalized.split("/");
  return parts[parts.length - 1] || normalized;
}

/**
 * Rewrite relative .md links to in-app lesson routes.
 * Keeps http(s) and absolute site links untouched.
 */
export function rewriteLearnMarkdownLinks(
  markdown: string,
  track: LearnTrack,
): string {
  return markdown.replace(
    /\]\((?!https?:\/\/|\/|#|mailto:)([^)\s]+?\.md)(#[^)\s]*)?\)/gi,
    (_full, file: string, hash = "") => {
      const stem = basenamePosix(file).replace(/\.md$/i, "");
      const slug = stem.toLowerCase() === "readme" ? "overview" : stem;
      return `](/learn/${track}/${slug}${hash})`;
    },
  );
}

export function extractLessonTitle(markdown: string, fallback: string): string {
  const m = markdown.match(/^#\s+(.+)$/m);
  return m?.[1]?.trim() || fallback;
}
