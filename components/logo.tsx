import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * The RoutePilot mark: a lime tile with a black navigation arrow.
 * Scales cleanly from a 16px favicon up to a large hero lockup.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      role="img"
      aria-label="RoutePilot"
    >
      <rect width="32" height="32" rx="8" fill="#b8f724" />
      <path
        d="M9 22.5 16 7l7 15.5-7-3.4-7 3.4Z"
        fill="#0a0a0a"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type LogoProps = {
  className?: string;
  markClassName?: string;
  textClassName?: string;
  /** Hide the "RoutePilot" wordmark and render just the mark. */
  showWordmark?: boolean;
};

export function Logo({
  className,
  markClassName,
  textClassName,
  showWordmark = true,
}: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className={cn("h-7 w-7 shrink-0", markClassName)} />
      {showWordmark && (
        <span
          className={cn(
            "font-heading text-lg font-bold tracking-tight text-foreground",
            textClassName,
          )}
        >
          RoutePilot
        </span>
      )}
    </span>
  );
}
