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
      className="fm-panel fm-project-card fm-rise group block p-6"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <h3 className="text-[1.05rem] font-semibold tracking-tight">{repo.name}</h3>
        <div className="flex flex-wrap justify-end gap-1.5">
          {repo.isSite ? <span className="fm-badge fm-badge-wip">本站</span> : null}
          {repo.language ? <span className="fm-badge">{repo.language}</span> : null}
        </div>
      </div>
      <p className="min-h-[3rem] text-[0.95rem] leading-relaxed text-[var(--text-muted)]">
        {repo.description?.trim() || "暂无描述 — 点击查看仓库详情"}
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-[var(--text-faint)]">
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
      <section className="fm-hero-shell mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col justify-center px-5 py-24">
        <div className="fm-rise mx-auto max-w-3xl text-center">
          <p className="mb-5 text-sm font-medium tracking-[0.08em] text-[var(--text-faint)]">
            LearntobeMyself
          </p>
          <h1 className="fm-display text-[clamp(3rem,8vw,5.5rem)] leading-[1.02] text-[var(--text)]">
            Free Myself
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-[var(--text-muted)] md:text-xl">
            对外是作品集，对内是 Outer Harness 与文档工坊。把重复劳动交给可验证的工具链，把精力留给真正重要的事。
          </p>
          <div className="fm-hero-prompt mx-auto">
            Ask anything — or open the workbench to finish a real task.
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/#projects" className="fm-btn fm-btn-primary">
              查看项目
            </Link>
            <Link href="/workbench" className="fm-btn">
              进入工作台
            </Link>
          </div>
        </div>
      </section>

      <section id="projects" className="mx-auto max-w-6xl px-5 pb-28 pt-4">
        <div className="fm-fade-in mb-10 max-w-2xl">
          <h2 className="fm-display text-3xl md:text-4xl">Projects</h2>
          <p className="mt-3 text-[var(--text-muted)]">
            来自 GitHub 账号 LearntobeMyself 的真实仓库。未完成演示的详情页保留预留区。
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
