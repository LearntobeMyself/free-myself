import Link from "next/link";
import {
  HARNESS_CURRICULUM,
  PLATFORM_LABEL,
  harnessDocUrl,
  type JournalHub,
  type JournalPost,
} from "@/lib/learning-journal";
import { LearnProgressPanel } from "@/components/learn/learn-progress-panel";

function PostRow({ post }: { post: JournalPost }) {
  const platform = PLATFORM_LABEL[post.platform];
  const inner = (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg text-[var(--text)]">{post.title}</h2>
        <time className="fm-mono text-xs text-[var(--text-faint)]">{post.date}</time>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
        {post.summary}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="fm-badge">{platform}</span>
        {(post.tags ?? []).map((t) => (
          <span key={t} className="fm-badge">
            {t}
          </span>
        ))}
        {post.url ? (
          <span className="text-xs text-[var(--accent)]">阅读原文 →</span>
        ) : (
          <span className="text-xs text-[var(--text-faint)]">待发布外链</span>
        )}
      </div>
    </>
  );

  if (post.url) {
    return (
      <a
        href={post.url}
        target="_blank"
        rel="noopener noreferrer"
        className="fm-journal-row block"
      >
        {inner}
      </a>
    );
  }

  return <article className="fm-journal-row">{inner}</article>;
}

export function JournalHubView({ hub }: { hub: JournalHub }) {
  const other =
    hub.slug === "harness"
      ? { href: "/learn/leetcode", label: "力扣刷题记录" }
      : { href: "/learn/harness", label: "Harness 学习记录" };

  return (
    <main className="mx-auto max-w-3xl px-5 py-14 md:py-20">
      <p className="mb-4 text-sm text-[var(--text-faint)]">
        <Link href="/" className="hover:text-[var(--text)]">
          Free myself
        </Link>
        <span className="mx-2 opacity-40">/</span>
        <span>{hub.shortLabel}</span>
      </p>

      <h1 className="fm-display text-[clamp(2rem,5vw,2.75rem)] leading-tight text-[var(--text)]">
        {hub.title}
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--text-muted)]">
        {hub.description}
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link href={other.href} className="fm-btn text-sm">
          看{other.label}
        </Link>
        <Link href="/workbench/docs" className="fm-btn text-sm">
          文档工坊
        </Link>
        {hub.slug === "harness" ? (
          <Link href="/workbench/traces" className="fm-btn text-sm">
            运行轨迹
          </Link>
        ) : null}
      </div>

      <LearnProgressPanel track={hub.slug} />

      {hub.slug === "harness" ? (
        <section className="mt-12">
          <p className="fm-section-label mb-4">5 个月学习路线</p>
          <p className="mb-4 text-sm leading-relaxed text-[var(--text-muted)]">
            Agent = Model + Harness。按阶段读仓库文档，在{" "}
            <span className="fm-mono text-xs">src/harness</span>{" "}
            动手，周记发外站后收回本页索引。
          </p>
          <ol className="fm-journal-list">
            {HARNESS_CURRICULUM.map((stage) => (
              <li key={stage.id}>
                <a
                  href={harnessDocUrl(stage.docPath)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="fm-journal-row block"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h2 className="text-lg text-[var(--text)]">{stage.title}</h2>
                    <span className="fm-mono text-xs text-[var(--text-faint)]">
                      {stage.monthLabel}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                    {stage.summary}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="fm-badge">课程</span>
                    <span className="text-xs text-[var(--accent)]">打开文档 →</span>
                  </div>
                </a>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <section className="mt-12">
        <p className="fm-section-label mb-4">文章索引</p>
        {hub.posts.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[var(--border-strong)] bg-[rgba(255,255,255,0.45)] px-5 py-10 text-sm text-[var(--text-muted)]">
            {hub.emptyHint}
          </p>
        ) : (
          <ul className="fm-journal-list">
            {hub.posts.map((post) => (
              <li key={post.id}>
                <PostRow post={post} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
