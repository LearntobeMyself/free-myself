export type GithubRepo = {
  name: string;
  fullName: string;
  description: string | null;
  htmlUrl: string;
  homepage: string | null;
  language: string | null;
  stars: number;
  forks: number;
  updatedAt: string;
  pushedAt: string;
  topics: string[];
  isPrivate: boolean;
  isFork: boolean;
  /** This site's own repo */
  isSite: boolean;
};

export type GithubRepoDetail = GithubRepo & {
  readmeExcerpt: string | null;
  defaultBranch: string;
  openIssues: number;
};

const OWNER = "LearntobeMyself";

type GhApiRepo = {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  pushed_at: string;
  topics?: string[];
  private: boolean;
  fork: boolean;
  default_branch: string;
  open_issues_count: number;
};

function authHeaders(): HeadersInit {
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "User-Agent": "free-myself-portfolio",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) {
    (headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  return headers;
}

function mapRepo(r: GhApiRepo): GithubRepo {
  return {
    name: r.name,
    fullName: r.full_name,
    description: r.description,
    htmlUrl: r.html_url,
    homepage: r.homepage,
    language: r.language,
    stars: r.stargazers_count,
    forks: r.forks_count,
    updatedAt: r.updated_at,
    pushedAt: r.pushed_at,
    topics: r.topics ?? [],
    isPrivate: r.private,
    isFork: r.fork,
    isSite: r.name === "free-myself",
  };
}

export type ListReposOptions = {
  includeForks?: boolean;
  /** Hide site repo from the grid entirely */
  hideSiteRepo?: boolean;
};

export async function listGithubRepos(
  options: ListReposOptions = {},
): Promise<{ repos: GithubRepo[]; error: string | null }> {
  const { includeForks = false, hideSiteRepo = false } = options;
  try {
    const res = await fetch(
      `https://api.github.com/users/${OWNER}/repos?per_page=100&sort=updated&type=owner`,
      {
        headers: authHeaders(),
        next: { revalidate: 300 },
      },
    );
    if (!res.ok) {
      return {
        repos: [],
        error: `GitHub API ${res.status}: ${res.statusText}`,
      };
    }
    const data = (await res.json()) as GhApiRepo[];
    let repos = data.map(mapRepo);
    if (!includeForks) repos = repos.filter((r) => !r.isFork);
    if (hideSiteRepo) repos = repos.filter((r) => !r.isSite);
    return { repos, error: null };
  } catch (e) {
    return {
      repos: [],
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

export async function getGithubRepo(
  name: string,
): Promise<{ repo: GithubRepoDetail | null; error: string | null }> {
  try {
    const res = await fetch(`https://api.github.com/repos/${OWNER}/${name}`, {
      headers: authHeaders(),
      next: { revalidate: 300 },
    });
    if (res.status === 404) return { repo: null, error: null };
    if (!res.ok) {
      return { repo: null, error: `GitHub API ${res.status}` };
    }
    const data = (await res.json()) as GhApiRepo;
    const base = mapRepo(data);
    const readmeExcerpt = await fetchReadmeExcerpt(name);
    return {
      repo: {
        ...base,
        readmeExcerpt,
        defaultBranch: data.default_branch,
        openIssues: data.open_issues_count,
      },
      error: null,
    };
  } catch (e) {
    return {
      repo: null,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

async function fetchReadmeExcerpt(name: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${OWNER}/${name}/readme`,
      {
        headers: {
          ...authHeaders(),
          Accept: "application/vnd.github.raw",
        },
        next: { revalidate: 300 },
      },
    );
    if (!res.ok) return null;
    const text = await res.text();
    const plain = text
      .replace(/^#+\s+/gm, "")
      .replace(/```[\s\S]*?```/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/[*_`]/g, "")
      .trim();
    if (!plain) return null;
    return plain.length > 480 ? `${plain.slice(0, 480).trim()}…` : plain;
  } catch {
    return null;
  }
}

export function formatRelativeDate(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return iso;
  const days = Math.round((Date.now() - t) / 86_400_000);
  if (days <= 0) return "今天";
  if (days === 1) return "昨天";
  if (days < 30) return `${days} 天前`;
  if (days < 365) return `${Math.round(days / 30)} 个月前`;
  return `${Math.round(days / 365)} 年前`;
}

/** Pure helpers for tests — map + filter without network */
export function filterListedRepos(
  repos: GithubRepo[],
  options: ListReposOptions = {},
): GithubRepo[] {
  const { includeForks = false, hideSiteRepo = false } = options;
  let out = repos;
  if (!includeForks) out = out.filter((r) => !r.isFork);
  if (hideSiteRepo) out = out.filter((r) => !r.isSite);
  return out;
}

export function mapGhApiRepoForTest(r: GhApiRepo): GithubRepo {
  return mapRepo(r);
}

export const GITHUB_OWNER = OWNER;
