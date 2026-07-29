"use client";

import Link from "next/link";
import { HeroAtmosphere, Reveal, SpotlightCard } from "@/components/motion/reveal";
import { formatRelativeDate, type GithubRepo } from "@/lib/github";

function ProjectCard({ repo, index }: { repo: GithubRepo; index: number }) {
  return (
    <Reveal delayMs={index * 80} as="article">
      <SpotlightCard className="fm-project-card block h-full">
        <Link href={`/projects/${repo.name}`} className="block h-full p-6 md:p-7">
          <div className="relative z-[1] mb-4 flex items-start justify-between gap-3">
            <h3 className="text-[1.1rem] font-semibold tracking-tight">{repo.name}</h3>
            <div className="flex flex-wrap justify-end gap-1.5">
              {repo.isSite ? <span className="fm-badge fm-badge-wip">本站</span> : null}
              {repo.language ? <span className="fm-badge">{repo.language}</span> : null}
            </div>
          </div>
          <p className="relative z-[1] min-h-[3.2rem] text-[0.95rem] leading-relaxed text-[var(--text-muted)]">
            {repo.description?.trim() || "暂无描述，点进去看仓库详情"}
          </p>
          <div className="relative z-[1] mt-6 flex flex-wrap items-center gap-3 text-xs text-[var(--text-faint)]">
            <span>星标 {repo.stars}</span>
            <span>更新于 {formatRelativeDate(repo.pushedAt)}</span>
            <span className="fm-card-arrow ml-auto opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              查看 →
            </span>
          </div>
        </Link>
      </SpotlightCard>
    </Reveal>
  );
}

export function HomeExperience({
  repos,
  error,
}: {
  repos: GithubRepo[];
  error: string | null;
}) {
  return (
    <main>
      <HeroAtmosphere>
        <section className="relative z-[1] mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col justify-center px-5 py-24">
          <div className="mx-auto max-w-3xl text-center">
            <Reveal>
              <p className="mb-5 text-sm font-medium tracking-[0.14em] text-[var(--text-faint)]">
                LearntobeMyself
              </p>
            </Reveal>
            <Reveal delayMs={80}>
              <h1 className="fm-display text-[clamp(3rem,8vw,5.6rem)] leading-[1.02] text-[var(--text)]">
                Free myself
              </h1>
            </Reveal>
            <Reveal delayMs={160}>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-[var(--text-muted)] md:text-xl">
                对外放真实项目；对内用本机工具改 Word / Markdown
                格式——按你自己的规范来，改完直接下载。
              </p>
            </Reveal>
            <Reveal delayMs={240}>
              <div className="fm-hero-prompt mx-auto">
                想看作品往下滚；要改格式，进工作台。
              </div>
            </Reveal>
            <Reveal delayMs={320}>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link href="/#projects" className="fm-btn fm-btn-primary fm-btn-press">
                  浏览项目
                </Link>
                <Link href="/workbench/docs" className="fm-btn fm-btn-press">
                  打开文档工坊
                </Link>
              </div>
            </Reveal>
            <Reveal delayMs={420}>
              <p className="mt-14 text-sm text-[var(--text-faint)]">
                <span className="fm-scroll-hint">向下滚动</span>
              </p>
            </Reveal>
          </div>
        </section>
      </HeroAtmosphere>

      <section id="projects" className="relative mx-auto max-w-6xl px-5 pb-28 pt-8">
        <Reveal className="mb-12 max-w-2xl">
          <h2 className="fm-display text-3xl md:text-4xl">我的项目</h2>
          <p className="mt-3 text-[1.02rem] text-[var(--text-muted)]">
            直接拉 GitHub 上的公开仓库。演示没做完的会标明，不会假装已经完工。
          </p>
        </Reveal>

        {error ? (
          <Reveal>
            <div className="fm-panel p-6 text-[var(--text-muted)]">
              暂时拉不到仓库列表：{error}
            </div>
          </Reveal>
        ) : null}

        {!error && repos.length === 0 ? (
          <Reveal>
            <div className="fm-panel p-6 text-[var(--text-muted)]">
              暂时没有可展示的公开仓库。
            </div>
          </Reveal>
        ) : null}

        <div className="fm-grid-projects">
          {repos.map((repo, i) => (
            <ProjectCard key={repo.fullName} repo={repo} index={i} />
          ))}
        </div>
      </section>

      <section className="border-t border-[var(--border)] bg-[var(--bg-1)]">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 md:grid-cols-3">
          {[
            {
              title: "上传你的稿",
              body: "Word 或 Markdown 都行。改的是你自己写好的内容，不是空模板。",
            },
            {
              title: "按你的规范改",
              body: "字体、字号、行距、页边距写清楚一次，之后每次套同一套规则。",
            },
            {
              title: "下载交差",
              body: "本机跑排版服务，改完直接下 .docx。不上传云端，不装成万能美化。",
            },
          ].map((item, i) => (
            <Reveal key={item.title} delayMs={i * 90}>
              <div className="fm-value-card">
                <div className="fm-value-index">{String(i + 1).padStart(2, "0")}</div>
                <h3 className="mt-4 text-xl font-semibold tracking-tight">{item.title}</h3>
                <p className="mt-3 text-[var(--text-muted)] leading-relaxed">{item.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </main>
  );
}
