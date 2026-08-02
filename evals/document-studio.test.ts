import { describe, expect, it } from "vitest";
import {
  defaultCourseReportSpec,
  ingestSpecFromNaturalLanguage,
  normalizeSpec,
  validateSpec,
} from "@/lib/format-spec";
import {
  EDIT_ROLES,
  orderMatchRules,
  setMatchRules,
  startsWithRule,
  visibleCourseReportSpec,
} from "@/lib/style-editor";
import { parseSpecJson, resolveFormatSpec } from "@/lib/resolve-format-spec";

describe("format spec", () => {
  it("normalizes default course report spec", () => {
    const spec = defaultCourseReportSpec();
    const v = validateSpec(spec);
    expect(v.ok).toBe(true);
    expect(spec.styles.some((s) => s.role === "body")).toBe(true);
  });

  it("parses natural language margins and body indent", () => {
    const spec = ingestSpecFromNaturalLanguage(
      "标题黑体三号居中，正文宋体小四 1.5 倍行距首行缩进两字符，页边距上下 2.54 左右 3.17，参考文献悬挂缩进",
      "测试规范",
    );
    expect(spec.meta.marginCm.top).toBe(2.54);
    expect(spec.meta.marginCm.left).toBe(3.17);
    const body = spec.styles.find((s) => s.role === "body")!;
    expect(body.firstLineIndentChars).toBe(2);
    expect(body.fontSizePt).toBe(12);
  });

  it("rejects absurd font size via validate after normalize attempt", () => {
    expect(() =>
      normalizeSpec({
        meta: { name: "bad" },
        styles: [{ role: "body", fontSizePt: -1 }],
      }),
    ).toThrow();
  });

  it("orders custom match rules before presets", () => {
    const custom = startsWithRule("heading1", "附录")!;
    const ordered = orderMatchRules([
      ...visibleCourseReportSpec().matchRules,
      custom,
    ]);
    expect(ordered[0]).toEqual(custom);
    const next = setMatchRules(visibleCourseReportSpec(), [
      ...visibleCourseReportSpec().matchRules,
      custom,
    ]);
    expect(next.matchRules[0].pattern).toBe(custom.pattern);
  });

  it("rejects invalid format-spec JSON with 400-shaped errors", () => {
    expect(parseSpecJson("{not json").ok).toBe(false);
    expect(resolveFormatSpec({ meta: { name: "x" }, styles: [] }).ok).toBe(false);
    const good = resolveFormatSpec(visibleCourseReportSpec());
    expect(good.ok).toBe(true);
  });

  it("exposes bibliography and caption in the style editor roles", () => {
    expect(EDIT_ROLES).toContain("bibliography");
    expect(EDIT_ROLES).toContain("caption");
    const bib = visibleCourseReportSpec().styles.find((s) => s.role === "bibliography");
    expect(bib?.hangingIndentChars).toBeGreaterThan(0);
  });
});
