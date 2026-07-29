import { describe, expect, it } from "vitest";
import {
  filterListedRepos,
  formatRelativeDate,
  mapGhApiRepoForTest,
  type GithubRepo,
} from "@/lib/github";

describe("github helpers", () => {
  const sample: GithubRepo[] = [
    mapGhApiRepoForTest({
      name: "RiskLendPro",
      full_name: "LearntobeMyself/RiskLendPro",
      description: "risk",
      html_url: "https://github.com/LearntobeMyself/RiskLendPro",
      homepage: null,
      language: "Java",
      stargazers_count: 0,
      forks_count: 0,
      updated_at: "2026-06-05T18:06:56Z",
      pushed_at: "2026-06-05T18:06:56Z",
      topics: [],
      private: false,
      fork: false,
      default_branch: "main",
      open_issues_count: 0,
    }),
    mapGhApiRepoForTest({
      name: "free-myself",
      full_name: "LearntobeMyself/free-myself",
      description: "site",
      html_url: "https://github.com/LearntobeMyself/free-myself",
      homepage: null,
      language: "TypeScript",
      stargazers_count: 0,
      forks_count: 0,
      updated_at: "2026-07-29T14:44:13Z",
      pushed_at: "2026-07-29T14:44:13Z",
      private: false,
      fork: false,
      default_branch: "main",
      open_issues_count: 0,
    }),
    mapGhApiRepoForTest({
      name: "forked-thing",
      full_name: "LearntobeMyself/forked-thing",
      description: null,
      html_url: "https://github.com/LearntobeMyself/forked-thing",
      homepage: null,
      language: null,
      stargazers_count: 1,
      forks_count: 0,
      updated_at: "2026-01-01T00:00:00Z",
      pushed_at: "2026-01-01T00:00:00Z",
      private: false,
      fork: true,
      default_branch: "main",
      open_issues_count: 0,
    }),
  ];

  it("marks free-myself as site repo", () => {
    expect(sample.find((r) => r.name === "free-myself")?.isSite).toBe(true);
    expect(sample.find((r) => r.name === "RiskLendPro")?.isSite).toBe(false);
  });

  it("filters forks by default", () => {
    const listed = filterListedRepos(sample);
    expect(listed.some((r) => r.isFork)).toBe(false);
    expect(listed.map((r) => r.name)).toContain("RiskLendPro");
  });

  it("can hide site repo from grid", () => {
    const listed = filterListedRepos(sample, { hideSiteRepo: true });
    expect(listed.some((r) => r.name === "free-myself")).toBe(false);
  });

  it("formats relative dates", () => {
    const today = formatRelativeDate(new Date().toISOString());
    expect(today).toBe("today");
  });
});
