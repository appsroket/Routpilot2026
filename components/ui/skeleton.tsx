import { cn } from "@/lib/utils";

/**
 * A shimmering placeholder block. Compose these to mirror a page's layout
 * while its server data loads.
 */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export { Skeleton };
