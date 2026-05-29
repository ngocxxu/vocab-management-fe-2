export function TableSkeleton() {
  return (
    <div className="min-h-[220px] animate-pulse rounded-lg border border-border bg-card p-5">
      <div className="mb-4 h-5 w-48 rounded bg-muted" />
      <div className="space-y-3">
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-3/4 rounded bg-muted" />
      </div>
    </div>
  );
}
