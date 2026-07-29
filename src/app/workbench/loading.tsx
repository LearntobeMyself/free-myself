export default function WorkbenchLoading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-48 rounded-lg bg-[var(--bg-2)]" />
      <div className="h-4 w-80 max-w-full rounded bg-[var(--bg-2)]" />
      <div className="fm-panel h-40 p-5">
        <div className="h-full rounded-lg bg-[var(--bg-2)]" />
      </div>
      <div className="fm-panel h-28 p-5">
        <div className="h-full rounded-lg bg-[var(--bg-2)]" />
      </div>
    </div>
  );
}
