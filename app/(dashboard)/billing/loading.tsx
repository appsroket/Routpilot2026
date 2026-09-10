import { Skeleton } from "@/components/ui/skeleton";

export default function BillingLoading() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8 space-y-2">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-4 w-56" />
      </div>

      <div className="grid max-w-3xl grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-5 w-16 rounded-md" />
            </div>
            <Skeleton className="mt-3 h-8 w-24" />
            <div className="mt-4 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <Skeleton className="mt-6 h-9 w-36 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
