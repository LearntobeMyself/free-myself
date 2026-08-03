"use client";

import Link from "next/link";
import { withCharacterAct } from "@/components/live2d/with-character-act";
import { Reveal, SpotlightCard } from "@/components/motion/reveal";
import {
  PROJECTS_CATALOG,
  type CatalogProject,
} from "@/lib/projects-catalog";

function ProjectCard({
  project,
  index,
}: {
  project: CatalogProject;
  index: number;
}) {
  return (
    <Reveal delayMs={index * 80} as="article">
      <SpotlightCard className="fm-project-card block h-full">
        <a
          href={project.htmlUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block h-full p-6 md:p-7"
          onPointerDown={withCharacterAct("recommend")}
        >
          <div className="relative z-[1] mb-4 flex items-start justify-between gap-3">
            <h3 className="text-[1.1rem] font-semibold tracking-tight">
              {project.name}
            </h3>
            <div className="flex flex-wrap justify-end gap-1.5">
              {project.isSite ? (
                <span className="fm-badge fm-badge-wip">本站</span>
              ) : null}
              {project.language ? (
                <span className="fm-badge">{project.language}</span>
              ) : null}
            </div>
          </div>
          <p className="relative z-[1] min-h-[3.2rem] text-[0.95rem] leading-relaxed text-[var(--text-muted)]">
            {project.description}
          </p>
          <div className="relative z-[1] mt-6 flex flex-wrap items-center gap-3 text-xs text-[var(--text-faint)]">
            <span>GitHub 仓库</span>
            <span className="fm-card-arrow ml-auto opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              打开 →
            </span>
          </div>
        </a>
      </SpotlightCard>
    </Reveal>
  );
}

export function ProjectsGallery() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-16 md:py-20">
      <Reveal className="mb-12 max-w-2xl">
        <p className="mb-3 text-sm text-[var(--text-faint)]">
          <Link
            href="/"
            className="hover:text-[var(--text)]"
            onPointerDown={withCharacterAct("wave")}
          >
            ← 返回首页
          </Link>
        </p>
        <h1 className="fm-display text-3xl md:text-4xl">我的项目</h1>
        <p className="mt-3 text-[1.02rem] text-[var(--text-muted)]">
          写好的简介与真实仓库链接。点卡片会打开 GitHub。
        </p>
      </Reveal>

      <div className="fm-grid-projects">
        {PROJECTS_CATALOG.map((project, i) => (
          <ProjectCard key={project.slug} project={project} index={i} />
        ))}
      </div>
    </main>
  );
}
