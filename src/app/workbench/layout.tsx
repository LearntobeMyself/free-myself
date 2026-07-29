import { WorkbenchNav } from "@/components/layout/workbench-nav";

export default function WorkbenchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-[200px_1fr]">
      <WorkbenchNav />
      <div className="min-w-0 md:border-l md:border-[var(--border)] md:pl-8">
        {children}
      </div>
    </div>
  );
}
