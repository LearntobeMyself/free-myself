import Link from "next/link";
import {
  curriculumKindLabel,
  lessonHref,
  type CurriculumItem,
  type CurriculumSection,
} from "@/lib/learning-journal";

function LessonLink({
  item,
  depth,
}: {
  item: CurriculumItem;
  depth: number;
}) {
  const href = lessonHref(item.docPath);
  if (!href) return null;

  const kind = curriculumKindLabel(item.kind);
  const isDay = item.kind === "day";
  const isWeek = item.kind === "week";

  return (
    <li className={`fm-curr-node is-${item.kind}`} data-depth={depth}>
      <Link
        href={href}
        className={`fm-curr-row ${isDay ? "is-day" : ""} ${isWeek ? "is-week" : ""}`}
      >
        <div className="fm-curr-row-top">
          <span className="fm-curr-kind">{kind}</span>
          <span className="fm-mono fm-curr-label">{item.label}</span>
          <h3 className="fm-curr-title">{item.title}</h3>
          <span className="fm-curr-go">站内阅读 →</span>
        </div>
        <p className="fm-curr-summary">{item.summary}</p>
      </Link>
      {item.children && item.children.length > 0 ? (
        <ol className="fm-curr-children">
          {item.children.map((child) => (
            <LessonLink key={child.id} item={child} depth={depth + 1} />
          ))}
        </ol>
      ) : null}
    </li>
  );
}

export function CurriculumBoard({
  sections,
  intro,
}: {
  sections: CurriculumSection[];
  intro: string;
}) {
  return (
    <section className="fm-curr mt-12">
      <p className="fm-section-label mb-4">学习路线牌面</p>
      <p className="mb-8 max-w-2xl text-sm leading-relaxed text-[var(--text-muted)]">
        {intro}
      </p>

      <div className="fm-curr-sections">
        {sections.map((section) => (
          <div key={section.id} className="fm-curr-section">
            <header className="fm-curr-section-head">
              <h2 className="fm-curr-section-title">{section.title}</h2>
              <p className="fm-curr-section-blurb">{section.blurb}</p>
            </header>
            <ol className="fm-curr-list">
              {section.items.map((item) => (
                <LessonLink key={item.id} item={item} depth={0} />
              ))}
            </ol>
          </div>
        ))}
      </div>
    </section>
  );
}
