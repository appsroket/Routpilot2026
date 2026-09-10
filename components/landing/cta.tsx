import Link from "next/link";

import { cn } from "@/lib/utils";

const base =
  "inline-flex h-12 items-center justify-center gap-2 rounded-lg px-6 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-0";

const variants = {
  primary:
    "bg-cta text-cta-foreground shadow-[0_10px_30px_-12px_rgba(251,194,26,0.65)] hover:-translate-y-0.5 hover:shadow-[0_16px_42px_-10px_rgba(251,194,26,0.8)]",
  ghost:
    "border border-border bg-card text-foreground hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/5",
} as const;

type CtaLinkProps = {
  href: string;
  variant?: keyof typeof variants;
  external?: boolean;
  className?: string;
  children: React.ReactNode;
};

/** Shared landing CTA — internal routes via next/link, external via anchor. */
export function CtaLink({
  href,
  variant = "primary",
  external = false,
  className,
  children,
}: CtaLinkProps) {
  const classes = cn(base, variants[variant], className);

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
