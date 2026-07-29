import { OpenLoopClient } from "@/components/workbench/open-loop-client";
import { loadCommitments } from "@/lib/open-loop";

export const dynamic = "force-dynamic";

export default async function OpenLoopPage() {
  const items = await loadCommitments();
  return <OpenLoopClient initialItems={items} />;
}
