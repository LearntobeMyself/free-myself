import { DocsStudioClient } from "@/components/workbench/docs-studio-client";
import { listSpecs } from "@/lib/spec-store";

export const dynamic = "force-dynamic";

export default async function DocsStudioPage() {
  const specs = await listSpecs();
  return <DocsStudioClient initialSpecs={specs} />;
}
