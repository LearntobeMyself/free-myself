import { describe, expect, it } from "vitest";
import { PROJECTS_CATALOG } from "@/lib/projects-catalog";

describe("projects catalog", () => {
  it("lists hardcoded projects with github urls", () => {
    expect(PROJECTS_CATALOG.length).toBeGreaterThan(0);
    for (const p of PROJECTS_CATALOG) {
      expect(p.slug).toBeTruthy();
      expect(p.name).toBeTruthy();
      expect(p.description.length).toBeGreaterThan(4);
      expect(p.htmlUrl).toMatch(/^https:\/\/github\.com\//);
    }
  });

  it("includes the site repo", () => {
    expect(PROJECTS_CATALOG.some((p) => p.isSite)).toBe(true);
  });
});
