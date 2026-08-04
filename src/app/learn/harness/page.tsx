import type { Metadata } from "next";
import { JournalHubView } from "@/components/learn/journal-hub";
import { getJournalHub } from "@/lib/learning-journal";

export const metadata: Metadata = {
  title: "Harness Agent 学习记录 · Free myself",
  description:
    "5 个月 Harness / Agent 学习路线图、阶段文档与外链周记索引",
};

export default function HarnessLearnPage() {
  return <JournalHubView hub={getJournalHub("harness")} />;
}
