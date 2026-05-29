export function HeatmapSkeleton() {
  return (
    <div className="flex h-full min-h-[220px] animate-pulse flex-col rounded-xl border border-border bg-card p-6">
      <div className="mb-4 h-4 w-40 rounded bg-muted" />
      <div className="mb-2 h-3 w-56 rounded bg-muted" />
      <div className="flex min-h-0 flex-1 flex-wrap gap-1">
        {Array.from({ length: 53 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-1">
            {Array.from({ length: 7 }).map((_, j) => (
              <div key={j} className="size-3 rounded-sm bg-muted" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
