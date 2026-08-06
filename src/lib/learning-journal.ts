export type JournalPlatform = "csdn" | "juejin" | "zhihu" | "local" | "other";

export type JournalPost = {
  id: string;
  title: string;
  summary: string;
  date: string;
  platform: JournalPlatform;
  /** External blog URL when published */
  url?: string;
  tags?: string[];
};

export type JournalHub = {
  slug: "harness" | "leetcode";
  title: string;
  shortLabel: string;
  description: string;
  emptyHint: string;
  posts: JournalPost[];
};

export type CurriculumStage = {
  id: string;
  monthLabel: string;
  title: string;
  summary: string;
  /** Path under repo root, e.g. docs/learn/harness/00-foundations.md */
  docPath: string;
};

/** GitHub blob base for curriculum markdown (public docs). */
export const HARNESS_DOCS_BLOB_BASE =
  "https://github.com/LearntobeMyself/free-myself/blob/main";

export function harnessDocUrl(docPath: string): string {
  return `${HARNESS_DOCS_BLOB_BASE}/${docPath}`;
}

export function learnDocUrl(docPath: string): string {
  return harnessDocUrl(docPath);
}

/** Job-focused NeetCode path — see docs/learn/leetcode/ */
export const LEETCODE_CURRICULUM: CurriculumStage[] = [
  {
    id: "lc-overview",
    monthLabel: "总纲",
    title: "力扣刀刃时间表",
    summary: "NeetCode 150 为主；每晚 1 题；按模式刷，不随机。",
    docPath: "docs/learn/leetcode/README.md",
  },
  {
    id: "lc-w1",
    monthLabel: "Week 1",
    title: "Arrays & Hashing 索引",
    summary: "217 → 242 → 1 → 49 → 347 → 238 → 128。",
    docPath: "docs/learn/leetcode/week1.md",
  },
];

/** 5-month Harness Agent path — see docs/learn/harness/ */
export const HARNESS_CURRICULUM: CurriculumStage[] = [
  {
    id: "overview",
    monthLabel: "总纲",
    title: "5 个月学习总纲",
    summary: "公式、职业目标、日历与每周节奏。先读这一页。",
    docPath: "docs/learn/harness/README.md",
  },
  {
    id: "month01",
    monthLabel: "第 1 月",
    title: "深度总览：小白 → 自研 Harness",
    summary: "每天 3.5–4h（周末 7h）；学/做/验/记四段；约 110–120h。从这里进四周。",
    docPath: "docs/learn/harness/month-01-plan.md",
  },
  {
    id: "month01-d01",
    monthLabel: "今天",
    title: "Day1 细案：环境 + 三层对照",
    summary: "按分钟执行：学总纲、搭 lab、对照表、闭卷默写。从这里开干。",
    docPath: "docs/learn/harness/month-01-day01.md",
  },
  {
    id: "month01-w1",
    monthLabel: "第 1 月 · W1",
    title: "Week1：协议与首轮 Tool Call",
    summary: "Schema 校验器、messages lint、单轮 tool calling（fake）。",
    docPath: "docs/learn/harness/month-01-week1.md",
  },
  {
    id: "month01-w2",
    monthLabel: "第 1 月 · W2",
    title: "Week2：自研完整 Mini Harness",
    summary: "Registry、runLoop、预算、JSONL trace、故障注入、周记#1。",
    docPath: "docs/learn/harness/month-01-week2.md",
  },
  {
    id: "month01-w3",
    monthLabel: "第 1 月 · W3",
    title: "Week3：精读本仓 + 对照",
    summary: "types/registry/tools/loop/trace 行级笔记与小改观察。",
    docPath: "docs/learn/harness/month-01-week3.md",
  },
  {
    id: "month01-w4",
    monthLabel: "第 1 月 · W4",
    title: "Week4：合入工具 + 月考",
    summary: "normalize_whitespace、描述 A/B、月考与周记#2。",
    docPath: "docs/learn/harness/month-01-week4.md",
  },
  {
    id: "m0",
    monthLabel: "Month 0",
    title: "地基：LLM 与 Tool Calling",
    summary: "模型只提议，Harness 才执行；手写最小 loop。",
    docPath: "docs/learn/harness/00-foundations.md",
  },
  {
    id: "m1",
    monthLabel: "Month 1",
    title: "Loop + Tools",
    summary: "吃透本仓库 registry / loop，贡献一个真实工具。",
    docPath: "docs/learn/harness/01-loop-and-tools.md",
  },
  {
    id: "m2",
    monthLabel: "Month 2",
    title: "Verify + Trace",
    summary: "确定性校验优先；失败轨迹可诊断。",
    docPath: "docs/learn/harness/02-verify-and-trace.md",
  },
  {
    id: "m3",
    monthLabel: "Month 3",
    title: "Context + Policy",
    summary: "Outer harness：AGENTS.md、CI、任务剧本。",
    docPath: "docs/learn/harness/03-context-and-policy.md",
  },
  {
    id: "m4",
    monthLabel: "Month 4",
    title: "MCP + Agents SDK",
    summary: "最小 MCP server，理解框架只是把 loop 产品化。",
    docPath: "docs/learn/harness/04-mcp-and-sdk.md",
  },
  {
    id: "m5a",
    monthLabel: "Month 5",
    title: "Evals + 生产硬化",
    summary: "Golden tasks、护栏、对照实验证明 harness 改进。",
    docPath: "docs/learn/harness/05-evals-and-prod.md",
  },
  {
    id: "m5b",
    monthLabel: "Month 5",
    title: "求职包装",
    summary: "作品集三段式、面试题库、投递前清单。",
    docPath: "docs/learn/harness/06-job-ready.md",
  },
  {
    id: "resources",
    monthLabel: "资源",
    title: "精选外链",
    summary: "概念 / 动手 / 求职必读清单。",
    docPath: "docs/learn/harness/resources.md",
  },
];

export const PLATFORM_LABEL: Record<JournalPlatform, string> = {
  csdn: "CSDN",
  juejin: "稀土掘金",
  zhihu: "知乎",
  local: "本站",
  other: "外链",
};

/** Placeholder hubs — replace posts as you publish on CSDN / 掘金 / etc. */
export const JOURNAL_HUBS: Record<JournalHub["slug"], JournalHub> = {
  harness: {
    slug: "harness",
    title: "Harness Agent 学习记录",
    shortLabel: "Harness 学习",
    description:
      "5 个月 Harness / Agent 路线图 + 外链周记索引。主攻 Agent 工程，辅以后端落地，冲大厂 AI 应用 / Agent 平台岗。",
    emptyHint: "还没有收录文章。发到外站后，把标题和链接加进本页列表即可。",
    posts: [
      {
        id: "harness-placeholder-1",
        title: "Agent = Model + Harness：先搭骨架再谈聪明",
        summary: "占位条目。对照 docs/learn/harness/00-foundations.md 写完后换成真实外链。",
        date: "2026-08-01",
        platform: "local",
        tags: ["harness", "agent"],
      },
    ],
  },
  leetcode: {
    slug: "leetcode",
    title: "力扣刷题记录",
    shortLabel: "力扣记录",
    description:
      "求职向 NeetCode 150 路线 + 打卡动力 + 外链复盘索引。每晚一题，刀刃时间。",
    emptyHint: "还没有收录刷题笔记。写完一篇就加进来，方便以后翻。",
    posts: [
      {
        id: "lc-placeholder-1",
        title: "双指针与滑动窗口：从模板到变体",
        summary: "占位条目。发文后填上真实链接与题号标签。",
        date: "2026-08-01",
        platform: "local",
        tags: ["数组", "双指针"],
      },
    ],
  },
};

export function getJournalHub(slug: JournalHub["slug"]): JournalHub {
  return JOURNAL_HUBS[slug];
}
