import Link from "next/link";
import projects from "../../content/projects.json";

export default function HomePage() {
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
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[var(--bg-0)] to-transparent"
        />
      </section>

      <section id="projects" className="mx-auto max-w-6xl px-5 pb-24 pt-8">
        <div className="fm-fade-in mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="fm-display text-3xl">Projects</h2>
            <p className="mt-2 text-[var(--text-muted)]">
              点击进入详情。未完成的项目保留占位，避免空壳链接。
            </p>
          </div>
        </div>
        <div className="fm-grid-projects">
          {projects.map((p, i) => (
            <Link
              key={p.slug}
              href={`/projects/${p.slug}`}
              className="fm-panel fm-rise group p-5 transition-transform duration-300 hover:-translate-y-0.5"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="text-lg font-medium">{p.title}</h3>
                <span
                  className={`fm-badge ${p.status === "wip" ? "fm-badge-wip" : "fm-badge-ok"}`}
                >
                  {p.status}
                </span>
              </div>
              <p className="text-sm text-[var(--text-muted)]">{p.summary}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {p.tags.map((t) => (
                  <span key={t} className="fm-badge">
                    {t}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
