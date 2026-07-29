import Link from "next/link";
import {
  formatRelativeDate,
  listGithubRepos,
  type GithubRepo,
} from "@/lib/github";

export const revalidate = 300;

function ProjectCard({ repo, index }: { repo: GithubRepo; index: number }) {
  return (
    <Link
      href={`/projects/${repo.name}`}
      className="fm-panel fm-rise group block p-5 transition-transform duration-300 hover:-translate-y-0.5"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="text-lg font-medium tracking-tight">{repo.name}</h3>
        <div className="flex flex-wrap justify-end gap-1.5">
          {repo.isSite ? <span className="fm-badge fm-badge-wip">本站</span> : null}
          {repo.language ? <span className="fm-badge">{repo.language}</span> : null}
        </div>
      </div>
      <p className="min-h-[2.75rem] text-sm text-[var(--text-muted)]">
        {repo.description?.trim() || "暂无描述 — 点击查看仓库详情"}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-[var(--text-faint)]">
        <span>★ {repo.stars}</span>
        <span>更新 {formatRelativeDate(repo.pushedAt)}</span>
      </div>
    </Link>
  );
}

export default async function HomePage() {
  const { repos, error } = await listGithubRepos({ includeForks: false });

  return (
    <main>
      <section className="relative mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-6xl flex-col justify-center px-5 py-20">
        <div className="fm-rise max-w-3xl">
          <p className="fm-badge mb-6">LearntobeMyself</p>
          <h1 className="fm-display text-5xl leading-[1.08] text-[var(--text)] md:text-7xl">
            Free Myself
          </h1>
          <p className="mt-6 max-w-xl text-lg text-[var(--text-muted)] md:text-xl">
            对外是作品集，对内是 Outer Harness 与文档工坊——用可验证的工具链解放重复劳动，同时练会
            Harness Engineering。
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/#projects" className="fm-btn fm-btn-primary">
              查看项目
            </Link>
            <Link href="/workbench" className="fm-btn">
              进入工作台
            </Link>
          </div>
        </div>
      </section>

      <section id="projects" className="mx-auto max-w-6xl px-5 pb-24 pt-8">
        <div className="fm-fade-in mb-8">
          <h2 className="fm-display text-3xl">Projects</h2>
          <p className="mt-2 text-[var(--text-muted)]">
            来自 GitHub 账号 LearntobeMyself 的真实仓库。详情页对未完成演示保留预留区。
          </p>
        </div>

        {error ? (
          <div className="fm-panel p-6 text-[var(--text-muted)]">
            暂时无法拉取 GitHub 仓库：{error}
          </div>
        ) : null}

        {!error && repos.length === 0 ? (
          <div className="fm-panel p-6 text-[var(--text-muted)]">
            未找到可展示的公开仓库。
          </div>
        ) : null}

        <div className="fm-grid-projects">
          {repos.map((repo, i) => (
            <ProjectCard key={repo.fullName} repo={repo} index={i} />
          ))}
        </div>
      </section>
    </main>
  );
}
