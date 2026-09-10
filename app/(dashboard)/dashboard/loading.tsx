import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-9 w-44 rounded-md" />
      </div>

      <div className="space-y-6">
        {/* Hero */}
        <div className="rounded-lg border border-border bg-card p-6">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="mt-3 h-12 w-56" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>

        {/* KPI grid */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-4">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="mt-3 h-7 w-16" />
            </div>
          ))}
        </div>

        {/* Chart + Today */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-5 lg:col-span-2">
            <Skeleton className="mb-4 h-4 w-40" />
            <Skeleton className="h-56 w-full" />
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <Skeleton className="mb-4 h-4 w-20" />
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
