import Link from "next/link";
import {
  HARNESS_CURRICULUM_SECTIONS,
  LEETCODE_CURRICULUM_SECTIONS,
  PLATFORM_LABEL,
  type JournalHub,
  type JournalPost,
} from "@/lib/learning-journal";
import { CurriculumBoard } from "@/components/learn/curriculum-board";
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
        <CurriculumBoard
          sections={HARNESS_CURRICULUM_SECTIONS}
          intro="顺序：总纲 → 五个月地图 → 第 1 月细案（月计划 → 周 → 日）。点进任意条目都是站内课文，可勾检查点。"
        />
      ) : (
        <CurriculumBoard
          sections={LEETCODE_CURRICULUM_SECTIONS}
          intro="顺序：总纲 → Week1 索引 → Day1–7。点进任意条目都是站内课文，可勾检查点；打卡备注写题号。"
        />
      )}

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
