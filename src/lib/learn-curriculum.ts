/** Visual / semantic level in the learning board. */
export type CurriculumKind = "overview" | "month" | "week" | "day" | "ref";

export type CurriculumItem = {
  id: string;
  kind: CurriculumKind;
  /** Short chip, e.g. 总纲 / 第1月 / W1 / Day1 */
  label: string;
  title: string;
  summary: string;
  docPath: string;
  children?: CurriculumItem[];
};

export type CurriculumSection = {
  id: string;
  title: string;
  blurb: string;
  items: CurriculumItem[];
};

/** Flat row for older callers / tests. */
export type CurriculumStage = {
  id: string;
  monthLabel: string;
  title: string;
  summary: string;
  docPath: string;
};

const KIND_LABEL: Record<CurriculumKind, string> = {
  overview: "总纲",
  month: "月",
  week: "周",
  day: "日",
  ref: "资料",
};

export function curriculumKindLabel(kind: CurriculumKind): string {
  return KIND_LABEL[kind];
}

/** Flatten tree for tests / migration helpers. */
export function flattenCurriculumItems(
  items: CurriculumItem[],
): CurriculumItem[] {
  const out: CurriculumItem[] = [];
  const walk = (nodes: CurriculumItem[]) => {
    for (const n of nodes) {
      out.push(n);
      if (n.children?.length) walk(n.children);
    }
  };
  walk(items);
  return out;
}

export function flattenCurriculumSections(
  sections: CurriculumSection[],
): CurriculumItem[] {
  return sections.flatMap((s) => flattenCurriculumItems(s.items));
}

/** Back-compat flat list used by older tests / callers. */
export function sectionsToStages(
  sections: CurriculumSection[],
): CurriculumStage[] {
  return flattenCurriculumSections(sections).map((item) => ({
    id: item.id,
    monthLabel: item.label,
    title: item.title,
    summary: item.summary,
    docPath: item.docPath,
  }));
}

/** Harness board: 总纲 → 五个月地图 → 第1月细案（月/周/日）→ 资料 */
export const HARNESS_CURRICULUM_SECTIONS: CurriculumSection[] = [
  {
    id: "h-start",
    title: "① 先读总纲",
    blurb: "建立地图：公式、岗位、五个月节奏。读完再进月度细案。",
    items: [
      {
        id: "overview",
        kind: "overview",
        label: "总纲",
        title: "5 个月学习总纲",
        summary: "Agent = Model + Harness；日历与每周节奏。",
        docPath: "docs/learn/harness/README.md",
      },
    ],
  },
  {
    id: "h-map",
    title: "② 五个月地图",
    blurb: "每月一篇阶段课文，看懂当月目标与门禁；细案目前先开第 1 月。",
    items: [
      {
        id: "m0",
        kind: "month",
        label: "Month 0",
        title: "地基：LLM 与 Tool Calling",
        summary: "模型只提议，Harness 才执行；手写最小 loop。",
        docPath: "docs/learn/harness/00-foundations.md",
      },
      {
        id: "m1",
        kind: "month",
        label: "Month 1",
        title: "Loop + Tools",
        summary: "吃透本仓库 registry / loop，贡献一个真实工具。",
        docPath: "docs/learn/harness/01-loop-and-tools.md",
      },
      {
        id: "m2",
        kind: "month",
        label: "Month 2",
        title: "Verify + Trace",
        summary: "确定性校验优先；失败轨迹可诊断。",
        docPath: "docs/learn/harness/02-verify-and-trace.md",
      },
      {
        id: "m3",
        kind: "month",
        label: "Month 3",
        title: "Context + Policy",
        summary: "Outer harness：AGENTS.md、CI、任务剧本。",
        docPath: "docs/learn/harness/03-context-and-policy.md",
      },
      {
        id: "m4",
        kind: "month",
        label: "Month 4",
        title: "MCP + Agents SDK",
        summary: "最小 MCP server，理解框架只是把 loop 产品化。",
        docPath: "docs/learn/harness/04-mcp-and-sdk.md",
      },
      {
        id: "m5a",
        kind: "month",
        label: "Month 5",
        title: "Evals + 生产硬化",
        summary: "Golden tasks、护栏、对照实验证明 harness 改进。",
        docPath: "docs/learn/harness/05-evals-and-prod.md",
      },
      {
        id: "m5b",
        kind: "month",
        label: "Month 5",
        title: "求职包装",
        summary: "作品集三段式、面试题库、投递前清单。",
        docPath: "docs/learn/harness/06-job-ready.md",
      },
    ],
  },
  {
    id: "h-m1-lab",
    title: "③ 第 1 月 · 动手细案（当前主战场）",
    blurb: "顺序：月计划 → 周索引 → 当日细案。Week1 已拆到 Day1–7，从 Day1 开干。",
    items: [
      {
        id: "month01",
        kind: "month",
        label: "月计划",
        title: "第 1 月深度总览",
        summary: "每天 3.5–4h；学/做/验/记；约 110–120h；月末门禁。",
        docPath: "docs/learn/harness/month-01-plan.md",
        children: [
          {
            id: "month01-w1",
            kind: "week",
            label: "W1",
            title: "Week1：协议与首轮 Tool Call",
            summary: "Schema、messages lint、单轮 tool calling（fake）。",
            docPath: "docs/learn/harness/month-01-week1.md",
            children: [
              {
                id: "month01-d01",
                kind: "day",
                label: "Day1",
                title: "环境 + 三层对照",
                summary: "搭 lab、对照表、闭卷默写。今天从这里开始。",
                docPath: "docs/learn/harness/month-01-day01.md",
              },
              {
                id: "month01-d02",
                kind: "day",
                label: "Day2",
                title: "Schema 校验器",
                summary: "validateToolArgs + 10 测。",
                docPath: "docs/learn/harness/month-01-day02.md",
              },
              {
                id: "month01-d03",
                kind: "day",
                label: "Day3",
                title: "三种 Agent 模式",
                summary: "chain / router / tool-use 伪代码。",
                docPath: "docs/learn/harness/month-01-day03.md",
              },
              {
                id: "month01-d04",
                kind: "day",
                label: "Day4",
                title: "Anatomy 映射本仓",
                summary: "外文部件落到 types/loop；四帧漫画。",
                docPath: "docs/learn/harness/month-01-day04.md",
              },
              {
                id: "month01-d05",
                kind: "day",
                label: "Day5",
                title: "messages lint",
                summary: "合法/非法 fixtures + lintMessages。",
                docPath: "docs/learn/harness/month-01-day05.md",
              },
              {
                id: "month01-d06",
                kind: "day",
                label: "Day6",
                title: "单轮 Tool Calling",
                summary: "fakeModel + 双工具 + JSON trace。",
                docPath: "docs/learn/harness/month-01-day06.md",
              },
              {
                id: "month01-d07",
                kind: "day",
                label: "Day7",
                title: "并行调用 + 周考",
                summary: "第三工具、parallel tool_calls、闭卷周测。",
                docPath: "docs/learn/harness/month-01-day07.md",
              },
            ],
          },
          {
            id: "month01-w2",
            kind: "week",
            label: "W2",
            title: "Week2：自研完整 Mini Harness",
            summary: "Registry、runLoop、预算、JSONL trace、周记#1。",
            docPath: "docs/learn/harness/month-01-week2.md",
          },
          {
            id: "month01-w3",
            kind: "week",
            label: "W3",
            title: "Week3：精读本仓 + 对照",
            summary: "types/registry/tools/loop/trace 行级笔记。",
            docPath: "docs/learn/harness/month-01-week3.md",
          },
          {
            id: "month01-w4",
            kind: "week",
            label: "W4",
            title: "Week4：合入工具 + 月考",
            summary: "normalize_whitespace、月考与周记#2。",
            docPath: "docs/learn/harness/month-01-week4.md",
          },
        ],
      },
    ],
  },
  {
    id: "h-ref",
    title: "④ 资料",
    blurb: "外链精选，按需查阅，不打乱主线顺序。",
    items: [
      {
        id: "resources",
        kind: "ref",
        label: "资源",
        title: "精选外链",
        summary: "概念 / 动手 / 求职必读清单。",
        docPath: "docs/learn/harness/resources.md",
      },
    ],
  },
];

/** LeetCode board: 总纲 → Week → Day */
export const LEETCODE_CURRICULUM_SECTIONS: CurriculumSection[] = [
  {
    id: "lc-start",
    title: "① 先读总纲",
    blurb: "刀刃时间表与刷题节奏；再进 Week1。",
    items: [
      {
        id: "lc-overview",
        kind: "overview",
        label: "总纲",
        title: "力扣刀刃时间表",
        summary: "NeetCode 150 为主；每晚 1 题；按模式刷。",
        docPath: "docs/learn/leetcode/README.md",
      },
    ],
  },
  {
    id: "lc-w1",
    title: "② Week 1 · Arrays & Hashing",
    blurb: "顺序：周索引 → Day1–7。题序 217 → 242 → 1 → 49 → 347 → 238 → 128。",
    items: [
      {
        id: "lc-w1-index",
        kind: "week",
        label: "W1",
        title: "Week1 索引",
        summary: "本周题单、时段与复盘规则。",
        docPath: "docs/learn/leetcode/week1.md",
        children: [
          {
            id: "lc-w1-d01",
            kind: "day",
            label: "Day1",
            title: "217 Contains Duplicate",
            summary: "Hash Set；45–55min；Java。",
            docPath: "docs/learn/leetcode/week1-day01.md",
          },
          {
            id: "lc-w1-d02",
            kind: "day",
            label: "Day2",
            title: "242 Valid Anagram",
            summary: "计数 / Hash；Java。",
            docPath: "docs/learn/leetcode/week1-day02.md",
          },
          {
            id: "lc-w1-d03",
            kind: "day",
            label: "Day3",
            title: "1 Two Sum",
            summary: "Hash Map 一遍扫。",
            docPath: "docs/learn/leetcode/week1-day03.md",
          },
          {
            id: "lc-w1-d04",
            kind: "day",
            label: "Day4",
            title: "49 Group Anagrams",
            summary: "分组 Hash；Medium。",
            docPath: "docs/learn/leetcode/week1-day04.md",
          },
          {
            id: "lc-w1-d05",
            kind: "day",
            label: "Day5",
            title: "347 Top K Frequent",
            summary: "频次 + 桶/堆。",
            docPath: "docs/learn/leetcode/week1-day05.md",
          },
          {
            id: "lc-w1-d06",
            kind: "day",
            label: "Day6",
            title: "238 Product Except Self",
            summary: "前缀积；O(1) 额外空间目标。",
            docPath: "docs/learn/leetcode/week1-day06.md",
          },
          {
            id: "lc-w1-d07",
            kind: "day",
            label: "Day7",
            title: "128 Longest Consecutive + 复盘",
            summary: "Set 扫 + 本周错题复盘。",
            docPath: "docs/learn/leetcode/week1-day07.md",
          },
        ],
      },
    ],
  },
];
