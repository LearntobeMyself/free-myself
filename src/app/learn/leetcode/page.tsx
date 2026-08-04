import type { Metadata } from "next";
import { JournalHubView } from "@/components/learn/journal-hub";
import { getJournalHub } from "@/lib/learning-journal";

export const metadata: Metadata = {
  title: "力扣刷题记录 · Free myself",
  description: "力扣刷题思路、复盘笔记与外链博客索引",
};

export default function LeetcodeLearnPage() {
  return <JournalHubView hub={getJournalHub("leetcode")} />;
}
