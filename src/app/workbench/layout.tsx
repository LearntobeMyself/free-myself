import { WorkbenchNav } from "@/components/layout/workbench-nav";

export default function WorkbenchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fm-workbench-shell mx-auto grid max-w-7xl gap-8 px-5 py-12 md:grid-cols-[180px_1fr]">
      <div className="fm-workbench-side">
        <WorkbenchNav />
      </div>
      <div className="fm-workbench-main">{children}</div>
    </div>
  );
}
