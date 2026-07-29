import Link from "next/link";
import { notFound } from "next/navigation";
import {
  formatRelativeDate,
  getGithubRepo,
  listGithubRepos,
} from "@/lib/github";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 300;

export async function generateStaticParams() {
  const { repos } = await listGithubRepos({ includeForks: false });
  if (!repos.length) {
    return [{ slug: "free-myself" }];
  }
  return repos.map((r) => ({ slug: r.name }));
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const { repo, error } = await getGithubRepo(slug);
  if (!repo) {
    if (error) {
      return (
        <main className="mx-auto max-w-3xl px-5 py-16">
          <Link href="/#projects" className="text-sm text-[var(--text-muted)]">
            ← 返回项目
          </Link>
          <p className="mt-6 text-[var(--text-muted)]">加载失败：{error}</p>
        </main>
      );
    }
    notFound();
  }

  const needsDemoPlaceholder = !repo.isSite;

  return (
    <main className="mx-auto max-w-3xl px-5 py-16">
      <Link href="/#projects" className="text-sm text-[var(--text-muted)] hover:text-[var(--text)]">
        ← 返回项目
      </Link>
      <div className="fm-rise mt-6">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <h1 className="fm-display text-4xl">{repo.name}</h1>
          {repo.isSite ? <span className="fm-badge fm-badge-wip">本站</span> : null}
          {repo.language ? <span className="fm-badge">{repo.language}</span> : null}
        </div>
        <p className="text-lg text-[var(--text-muted)]">
          {repo.description?.trim() || "暂无仓库描述"}
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm text-[var(--text-faint)]">
          <span>星标 {repo.stars}</span>
          <span>更新于 {formatRelativeDate(repo.pushedAt)}</span>
          <span>默认分支 {repo.defaultBranch}</span>
        </div>
        {repo.topics.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {repo.topics.map((t) => (
              <span key={t} className="fm-badge">
                {t}
              </span>
            ))}
          </div>
        ) : null}

        {repo.readmeExcerpt ? (
          <div className="fm-panel mt-10 p-6">
            <h2 className="text-lg font-medium">说明摘要</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[var(--text-muted)]">
              {repo.readmeExcerpt}
            </p>
          </div>
        ) : null}

        {needsDemoPlaceholder ? (
          <div className="fm-panel mt-6 p-6">
            <h2 className="text-lg font-medium">演示预留</h2>
            <p className="mt-2 text-[var(--text-muted)]">
              这个仓库的站内深度演示还没做完。这里先留位给架构图、截图和交互入口——目前请先去
              GitHub 看源码。
            </p>
          </div>
        ) : (
          <div className="fm-panel mt-6 space-y-3 p-6">
            <h2 className="text-lg font-medium">本站工作台</h2>
            <p className="text-[var(--text-muted)]">
              文档工坊：上传 Word / Markdown，按你的规范改格式后下载。
            </p>
            <Link href="/workbench/docs" className="fm-btn fm-btn-primary inline-flex">
              打开文档工坊
            </Link>
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={repo.htmlUrl}
            className="fm-btn"
            target="_blank"
            rel="noreferrer"
          >
            在 GitHub 打开
          </a>
          {repo.homepage ? (
            <a
              href={repo.homepage}
              className="fm-btn"
              target="_blank"
              rel="noreferrer"
            >
              访问主页
            </a>
          ) : null}
        </div>
      </div>
    </main>
  );
}
