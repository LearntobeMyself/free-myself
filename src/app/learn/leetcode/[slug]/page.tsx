import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LessonView } from "@/components/learn/lesson-view";
import { loadLesson } from "@/lib/learn-lessons-server";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const lesson = await loadLesson("leetcode", slug);
  if (!lesson) return { title: "课文未找到 · Free Myself" };
  return {
    title: `${lesson.title} · 力扣 · Free Myself`,
    description: "站内力扣刷题课文与可勾选检查点",
  };
}

export default async function LeetcodeLessonPage({ params }: Props) {
  const { slug } = await params;
  const lesson = await loadLesson("leetcode", slug);
  if (!lesson) notFound();

  return (
    <LessonView
      track={lesson.track}
      slug={lesson.slug}
      title={lesson.title}
      markdown={lesson.markdown}
    />
  );
}
