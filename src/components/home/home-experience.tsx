"use client";

import Link from "next/link";
import { withCharacterAct } from "@/components/live2d/with-character-act";
import { HeroAtmosphere, Reveal } from "@/components/motion/reveal";

export function HomeExperience() {
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
                想看作品点浏览项目；要改格式，进工作台。
              </div>
            </Reveal>
            <Reveal delayMs={320}>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/projects"
                  className="fm-btn fm-btn-primary fm-btn-press"
                  onPointerDown={withCharacterAct("wave")}
                >
                  浏览项目
                </Link>
                <Link
                  href="/workbench/docs"
                  className="fm-btn fm-btn-press"
                  onPointerDown={withCharacterAct("invite")}
                >
                  打开文档工坊
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      </HeroAtmosphere>
    </main>
  );
}
