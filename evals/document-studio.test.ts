import { describe, expect, it } from "vitest";
import {
  defaultCourseReportSpec,
  ingestSpecFromNaturalLanguage,
  normalizeSpec,
  validateSpec,
} from "@/lib/format-spec";

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
});
