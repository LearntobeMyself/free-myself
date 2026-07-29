import Link from "next/link";
import { notFound } from "next/navigation";
import projects from "../../../../content/projects.json";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();

  return (
    <main className="mx-auto max-w-3xl px-5 py-16">
      <Link href="/#projects" className="text-sm text-[var(--text-muted)] hover:text-[var(--text)]">
        ← Projects
      </Link>
      <div className="fm-rise mt-6">
        <div className="mb-3 flex items-center gap-3">
          <h1 className="fm-display text-4xl">{project.title}</h1>
          <span className={`fm-badge ${project.status === "wip" ? "fm-badge-wip" : ""}`}>
            {project.status}
          </span>
        </div>
        <p className="text-lg text-[var(--text-muted)]">{project.summary}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {project.tags.map((t) => (
            <span key={t} className="fm-badge">
              {t}
            </span>
          ))}
        </div>

        {project.status === "wip" ? (
          <div className="fm-panel mt-10 p-6">
            <h2 className="text-lg font-medium">详情预留</h2>
            <p className="mt-2 text-[var(--text-muted)]">
              该项目仍在开发中。此处预留给演示、架构图、Trace 回放与评测报告——代码完成后会填满，而不是先做空壳营销页。
            </p>
          </div>
        ) : (
          <div className="fm-panel mt-10 space-y-3 p-6">
            <h2 className="text-lg font-medium">可进入</h2>
            <p className="text-[var(--text-muted)]">
              完整能力在工作台：Passport、Open Loop、Document Studio、Traces。
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/workbench" className="fm-btn fm-btn-primary">
                打开 Workbench
              </Link>
              {project.repo ? (
                <a
                  href={project.repo}
                  className="fm-btn"
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub
                </a>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
