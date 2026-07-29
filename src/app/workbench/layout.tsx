import { WorkbenchNav } from "@/components/layout/workbench-nav";

export default function WorkbenchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-5 py-10 md:grid-cols-[220px_1fr]">
      <WorkbenchNav />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
