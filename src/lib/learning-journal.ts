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

/** GitHub blob base — only for optional “在 GitHub 查看源文件”, not curriculum navigation. */
export const HARNESS_DOCS_BLOB_BASE =
  "https://github.com/LearntobeMyself/free-myself/blob/main";

export function harnessDocUrl(docPath: string): string {
  return `${HARNESS_DOCS_BLOB_BASE}/${docPath}`;
}

/** @deprecated Prefer lessonHrefFromDocPath — curriculum must open in-app lessons. */
export function learnDocUrl(docPath: string): string {
  return harnessDocUrl(docPath);
}

export { lessonHrefFromDocPath as lessonHref } from "@/lib/learn-lessons";

import {
  HARNESS_CURRICULUM_SECTIONS,
  LEETCODE_CURRICULUM_SECTIONS,
  curriculumKindLabel,
  flattenCurriculumSections,
  sectionsToStages,
  type CurriculumItem,
  type CurriculumKind,
  type CurriculumSection,
  type CurriculumStage,
} from "@/lib/learn-curriculum";

export {
  HARNESS_CURRICULUM_SECTIONS,
  LEETCODE_CURRICULUM_SECTIONS,
  curriculumKindLabel,
  flattenCurriculumSections,
  sectionsToStages,
  type CurriculumItem,
  type CurriculumKind,
  type CurriculumSection,
  type CurriculumStage,
};

/** Flat list for tests / callers — prefer HARNESS_CURRICULUM_SECTIONS for UI. */
export const HARNESS_CURRICULUM: CurriculumStage[] = sectionsToStages(
  HARNESS_CURRICULUM_SECTIONS,
);

/** Flat list for tests / callers — prefer LEETCODE_CURRICULUM_SECTIONS for UI. */
export const LEETCODE_CURRICULUM: CurriculumStage[] = sectionsToStages(
  LEETCODE_CURRICULUM_SECTIONS,
);

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
