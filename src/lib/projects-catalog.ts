export type CatalogProject = {
  slug: string;
  name: string;
  description: string;
  language: string | null;
  htmlUrl: string;
  isSite?: boolean;
};

/** Hardcoded showcase — no GitHub API on the critical path. */
export const PROJECTS_CATALOG: CatalogProject[] = [
  {
    slug: "free-myself",
    name: "free-myself",
    description:
      "本站 Free Myself：展示真实项目，本机改 Word / Markdown 格式并下载。",
    language: "TypeScript",
    htmlUrl: "https://github.com/LearntobeMyself/free-myself",
    isSite: true,
  },
  {
    slug: "RiskLendPro",
    name: "RiskLendPro",
    description: "风险评估与借贷相关实践项目，面向真实业务场景的工程训练。",
    language: "Python",
    htmlUrl: "https://github.com/LearntobeMyself/RiskLendPro",
  },
  {
    slug: "music",
    name: "music",
    description: "音乐相关小项目与实验代码。",
    language: null,
    htmlUrl: "https://github.com/LearntobeMyself/music",
  },
  {
    slug: "GitLearning",
    name: "GitLearning",
    description: "Git 学习与练习仓库，记录命令与协作流程。",
    language: null,
    htmlUrl: "https://github.com/LearntobeMyself/GitLearning",
  },
];
