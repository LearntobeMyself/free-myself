import Link from "next/link";
import { Reveal, SpotlightCard } from "@/components/motion/reveal";

const cards = [
  {
    href: "/workbench/passport",
    title: "上下文护照",
    body: "记下身份、偏好、项目约定和会话交接。下次给 AI 用时，少从头解释一遍。",
  },
  {
    href: "/workbench/open-loop",
    title: "未闭环",
    body: "粘贴聊天或纪要，抽出「我答应做的事」，带着原文引用，状态随时改。",
  },
  {
    href: "/workbench/docs",
    title: "文档工坊",
    body: "你写排版要求，系统按要求改 Word / Markdown，并用同一套要求验收。",
  },
  {
    href: "/workbench/traces",
    title: "运行轨迹",
    body: "回看每一步在想什么、调了什么工具、校验过没过——方便排错，也方便学习。",
  },
];

export default function WorkbenchHome() {
  return (
    <div className="fm-stack">
      <header>
        <p className="fm-section-label">仅自己用</p>
        <h1 className="fm-workbench-title">工作台</h1>
        <p className="fm-workbench-lead">
          这里处理那些费时却不得不做的事。一屏只干一件事，做完再进下一项。
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((c, i) => (
          <Reveal key={c.href} delayMs={i * 70}>
            <SpotlightCard className="h-full">
              <Link href={c.href} prefetch className="relative z-[1] block p-6">
                <h2 className="text-lg font-semibold tracking-tight">{c.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{c.body}</p>
                <p className="mt-5 text-sm text-[var(--accent)] opacity-0 transition-opacity group-hover:opacity-100">
                  进入 →
                </p>
              </Link>
            </SpotlightCard>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
