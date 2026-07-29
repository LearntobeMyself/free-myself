import { describe, expect, it } from "vitest";
import {
  defaultCourseReportSpec,
  ingestSpecFromNaturalLanguage,
  normalizeSpec,
  validateSpec,
} from "@/lib/format-spec";
import {
  blocksToMarkdown,
  buildDocxFromBlocks,
  inferBlocksFromText,
  markdownToDocx,
  parseMarkdownToBlocks,
  structureDiff,
  verifyBlocksAgainstSpec,
} from "@/lib/document-engine";

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

describe("document engine", () => {
  it("formats messy text and verifies", async () => {
    const spec = defaultCourseReportSpec();
    const blocks = inferBlocksFromText(
      "课程报告标题\n第一章 绪论\n正文第一段。\n参考文献\n[1] Someone 2026.",
    );
    const buf = await buildDocxFromBlocks(blocks, spec);
    expect(buf.byteLength).toBeGreaterThan(1000);
    const verifier = verifyBlocksAgainstSpec(blocks, spec);
    expect(verifier.passed).toBe(true);
  });

  it("roundtrips markdown structure", async () => {
    const spec = defaultCourseReportSpec();
    const md = "# 标题\n\n## 小节\n\n一段正文。\n\n> 引用\n\n```\ncode\n```";
    const { buffer, blocks } = await markdownToDocx(md, spec);
    expect(buffer.byteLength).toBeGreaterThan(1000);
    const back = blocksToMarkdown(blocks);
    const diffs = structureDiff(md, back);
    expect(diffs).toEqual([]);
  });

  it("maps markdown headings via spec", () => {
    const spec = defaultCourseReportSpec();
    const blocks = parseMarkdownToBlocks("## Hello\n\nworld", spec);
    expect(blocks[0]?.role).toBe("heading2");
    expect(blocks[1]?.role).toBe("body");
  });
});
