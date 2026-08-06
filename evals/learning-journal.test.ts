import { describe, expect, it } from "vitest";
import {
  HARNESS_CURRICULUM,
  JOURNAL_HUBS,
  LEETCODE_CURRICULUM,
  getJournalHub,
  harnessDocUrl,
  learnDocUrl,
} from "@/lib/learning-journal";

describe("learning journal hubs", () => {
  it("exposes harness and leetcode hubs with labels", () => {
    expect(Object.keys(JOURNAL_HUBS)).toEqual(["harness", "leetcode"]);
    expect(getJournalHub("harness").shortLabel).toContain("Harness");
    expect(getJournalHub("leetcode").shortLabel).toContain("力扣");
  });

  it("exposes harness curriculum stages with github doc urls", () => {
    expect(HARNESS_CURRICULUM.length).toBeGreaterThanOrEqual(8);
    expect(HARNESS_CURRICULUM[0]?.docPath).toBe("docs/learn/harness/README.md");
    expect(harnessDocUrl("docs/learn/harness/README.md")).toContain(
      "docs/learn/harness/README.md",
    );
  });

  it("includes deep first-month week plans in curriculum", () => {
    const paths = HARNESS_CURRICULUM.map((s) => s.docPath);
    expect(paths).toContain("docs/learn/harness/month-01-plan.md");
    expect(paths).toContain("docs/learn/harness/month-01-day01.md");
    expect(paths).toContain("docs/learn/harness/month-01-day02.md");
    expect(paths).toContain("docs/learn/harness/month-01-day03.md");
    expect(paths).toContain("docs/learn/harness/month-01-day04.md");
    expect(paths).toContain("docs/learn/harness/month-01-day05.md");
    expect(paths).toContain("docs/learn/harness/month-01-day06.md");
    expect(paths).toContain("docs/learn/harness/month-01-day07.md");
    expect(paths).toContain("docs/learn/harness/month-01-week1.md");
    expect(paths).toContain("docs/learn/harness/month-01-week2.md");
    expect(paths).toContain("docs/learn/harness/month-01-week3.md");
    expect(paths).toContain("docs/learn/harness/month-01-week4.md");
  });

  it("exposes leetcode curriculum with neetcode week1 entry", () => {
    const paths = LEETCODE_CURRICULUM.map((s) => s.docPath);
    expect(paths).toContain("docs/learn/leetcode/README.md");
    expect(paths).toContain("docs/learn/leetcode/week1.md");
    expect(paths).toContain("docs/learn/leetcode/week1-day01.md");
    expect(paths).toContain("docs/learn/leetcode/week1-day07.md");
    expect(learnDocUrl("docs/learn/leetcode/README.md")).toContain(
      "docs/learn/leetcode/README.md",
    );
  });
});
