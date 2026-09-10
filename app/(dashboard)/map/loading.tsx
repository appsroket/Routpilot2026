import { Skeleton } from "@/components/ui/skeleton";

export default function MapLoading() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8 space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-10 w-full sm:w-56" />
        </div>
      </div>

      {/* Action buttons */}
      <div className="mb-4 flex flex-wrap gap-3">
        <Skeleton className="h-9 w-40 rounded-md" />
        <Skeleton className="h-9 w-44 rounded-md" />
      </div>

      {/* Map on top (mobile), list left / map right (desktop) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="order-2 space-y-2 lg:order-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
        <div className="order-1 lg:order-2">
          <Skeleton className="aspect-[4/3] w-full lg:aspect-auto lg:h-[520px]" />
        </div>
      </div>
    </div>
  );
}
