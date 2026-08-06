import { describe, expect, it } from "vitest";
import {
  lessonHrefFromDocPath,
  resolveLessonFileName,
  rewriteLearnMarkdownLinks,
  splitLessonBlocks,
} from "@/lib/learn-lessons";
import { loadLesson } from "@/lib/learn-lessons-server";
import {
  HARNESS_CURRICULUM,
  LEETCODE_CURRICULUM,
  lessonHref,
} from "@/lib/learning-journal";

describe("learn in-app lessons", () => {
  it("maps curriculum docPaths to in-app hrefs (not GitHub)", () => {
    expect(lessonHrefFromDocPath("docs/learn/harness/month-01-day01.md")).toBe(
      "/learn/harness/month-01-day01",
    );
    expect(lessonHrefFromDocPath("docs/learn/harness/README.md")).toBe(
      "/learn/harness/overview",
    );
    expect(lessonHrefFromDocPath("docs/learn/leetcode/week1-day01.md")).toBe(
      "/learn/leetcode/week1-day01",
    );
    expect(lessonHref("docs/learn/harness/month-01-day01.md")).toBe(
      "/learn/harness/month-01-day01",
    );
  });

  it("gives every curriculum stage an in-app lesson href", () => {
    for (const stage of [...HARNESS_CURRICULUM, ...LEETCODE_CURRICULUM]) {
      const href = lessonHref(stage.docPath);
      expect(href, stage.docPath).toMatch(/^\/learn\/(harness|leetcode)\//);
      expect(href).not.toContain("github.com");
    }
  });

  it("resolves overview slug to README.md", () => {
    expect(resolveLessonFileName("overview")).toBe("README.md");
    expect(resolveLessonFileName("month-01-day01")).toBe("month-01-day01.md");
    expect(resolveLessonFileName("../evil")).toBeNull();
  });

  it("splits task list items into checkpoint blocks", () => {
    const blocks = splitLessonBlocks(
      "## 收工\n\n- [ ] first\n- [x] second\n\nok\n",
    );
    expect(blocks.filter((b) => b.type === "checkpoint")).toHaveLength(2);
    const cps = blocks.filter((b) => b.type === "checkpoint");
    expect(cps[0]).toMatchObject({ label: "first", defaultChecked: false });
    expect(cps[1]).toMatchObject({ label: "second", defaultChecked: true });
  });

  it("rewrites relative md links to in-app routes", () => {
    const out = rewriteLearnMarkdownLinks(
      "see [week](./month-01-week1.md) and [readme](./README.md#x)",
      "harness",
    );
    expect(out).toContain("/learn/harness/month-01-week1");
    expect(out).toContain("/learn/harness/overview#x");
    expect(out).not.toContain(".md)");
  });

  it("loads harness day01 and leetcode day01 from disk", async () => {
    const h = await loadLesson("harness", "month-01-day01");
    expect(h?.title).toMatch(/Day 1/);
    expect(h?.markdown).toContain("- [ ]");
    expect(h?.markdown).toContain("/learn/harness/");

    const lc = await loadLesson("leetcode", "week1-day01");
    expect(lc?.title).toMatch(/217|Contains Duplicate/);
    expect(lc?.markdown).toContain("- [ ]");
  });
});
