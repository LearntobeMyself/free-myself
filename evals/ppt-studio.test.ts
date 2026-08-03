import { describe, expect, it } from "vitest";
import {
  DECK_THEMES,
  defaultDeckSpec,
  normalizeDeckSpec,
  previewSlideTitles,
  validateDeckSpec,
} from "@/lib/deck-spec";

describe("deck spec", () => {
  it("ships three built-in themes aligned with doc-engine", () => {
    expect(DECK_THEMES.map((t) => t.id)).toEqual([
      "business-light",
      "academic-clean",
      "minimal-ink",
    ]);
  });

  it("defaults and normalizes themeId", () => {
    expect(defaultDeckSpec().themeId).toBe("business-light");
    expect(normalizeDeckSpec({ themeId: "minimal-ink" }).themeId).toBe("minimal-ink");
    expect(normalizeDeckSpec({}).aspect).toBe("16:9");
  });

  it("rejects unknown theme ids", () => {
    const bad = validateDeckSpec({ themeId: "neon-disco" });
    expect(bad.ok).toBe(false);
    const good = validateDeckSpec({ themeId: "academic-clean" });
    expect(good.ok).toBe(true);
  });

  it("previews cover and section titles from markdown outline", () => {
    const titles = previewSlideTitles(`# 周会汇报

副标题

## 本周进展

- a

## 谢谢
`);
    expect(titles[0]).toBe("封面：周会汇报");
    expect(titles).toContain("本周进展");
    expect(titles).toContain("谢谢");
  });

  it("falls back when markdown has no headings", () => {
    const titles = previewSlideTitles("只有一行");
    expect(titles[0]).toContain("只有一行");
  });
});
