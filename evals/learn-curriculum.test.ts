import { describe, expect, it } from "vitest";
import {
  HARNESS_CURRICULUM_SECTIONS,
  LEETCODE_CURRICULUM_SECTIONS,
  flattenCurriculumSections,
} from "@/lib/learn-curriculum";
import { lessonHref } from "@/lib/learning-journal";

describe("learn curriculum board", () => {
  it("orders harness as 总纲 → 月地图 → 第1月(周→日) → 资料", () => {
    expect(HARNESS_CURRICULUM_SECTIONS.map((s) => s.id)).toEqual([
      "h-start",
      "h-map",
      "h-m1-lab",
      "h-ref",
    ]);
    const month01 = HARNESS_CURRICULUM_SECTIONS[2]?.items[0];
    expect(month01?.id).toBe("month01");
    expect(month01?.children?.[0]?.id).toBe("month01-w1");
    expect(month01?.children?.[0]?.children?.[0]?.id).toBe("month01-d01");
  });

  it("nests leetcode week1 days under week index", () => {
    const week = LEETCODE_CURRICULUM_SECTIONS[1]?.items[0];
    expect(week?.id).toBe("lc-w1-index");
    expect(week?.children?.map((d) => d.id)).toEqual([
      "lc-w1-d01",
      "lc-w1-d02",
      "lc-w1-d03",
      "lc-w1-d04",
      "lc-w1-d05",
      "lc-w1-d06",
      "lc-w1-d07",
    ]);
  });

  it("gives every board item an in-app lesson href", () => {
    const all = [
      ...flattenCurriculumSections(HARNESS_CURRICULUM_SECTIONS),
      ...flattenCurriculumSections(LEETCODE_CURRICULUM_SECTIONS),
    ];
    expect(all.length).toBeGreaterThan(20);
    for (const item of all) {
      const href = lessonHref(item.docPath);
      expect(href, item.docPath).toMatch(/^\/learn\/(harness|leetcode)\//);
      expect(href).not.toContain("github.com");
    }
  });
});
