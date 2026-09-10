import Link from "next/link";

import { Logo } from "@/components/logo";
import { NAV_LINKS, SIGNUP_HREF, LOGIN_HREF } from "./constants";

const FOOTER_LINKS = [
  ...NAV_LINKS,
  { label: "Log in", href: LOGIN_HREF },
  { label: "Start Free Trial", href: SIGNUP_HREF },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card px-6 py-14">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <div>
          <Logo markClassName="h-6 w-6" />
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Turn wasted drive time into billable hours.
          </p>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-3" aria-label="Footer">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mx-auto mt-10 flex max-w-6xl flex-col gap-2 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <a
          href="mailto:contact@leadsmatic.com"
          className="transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          contact@leadsmatic.com
        </a>
        <span>© {year} RoutePilot</span>
      </div>
    </footer>
  );
}
