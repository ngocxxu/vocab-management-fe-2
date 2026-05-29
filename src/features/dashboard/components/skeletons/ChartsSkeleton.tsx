export function ChartsSkeleton() {
  return (
    <div className="min-h-[520px] space-y-6 animate-pulse">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="h-[320px] rounded-lg bg-muted lg:col-span-2" />
        <div className="h-[320px] rounded-lg bg-muted lg:col-span-1" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <div className="h-[280px] rounded-lg bg-muted" />
        <div className="h-[280px] rounded-lg bg-muted" />
      </div>
    </div>
  );
}
