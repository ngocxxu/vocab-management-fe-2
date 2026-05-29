export function HeroCTASkeleton() {
  return (
    <div className="flex h-full min-h-[220px] animate-pulse flex-col rounded-3xl border border-border bg-card p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="size-12 shrink-0 rounded-2xl bg-muted" />
        <div className="h-6 w-28 rounded-full bg-muted" />
      </div>

      <div className="mt-5 space-y-3">
        <div className="h-8 w-5/6 rounded bg-muted" />
        <div className="h-8 w-2/3 rounded bg-muted" />
      </div>

      <div className="mt-4 space-y-2">
        <div className="h-4 w-11/12 rounded bg-muted" />
        <div className="h-4 w-3/5 rounded bg-muted" />
      </div>

      <div className="mt-auto pt-6">
        <div className="h-12 w-full rounded-2xl bg-muted" />
      </div>
    </div>
  );
}
