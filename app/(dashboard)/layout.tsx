import Link from "next/link";
import {
  LayoutDashboard,
  Briefcase,
  Map,
  Users,
  Settings,
  CreditCard,
} from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/map", label: "Map", icon: Map },
  { href: "/technicians", label: "Technicians", icon: Users },
  { href: "/billing", label: "Billing", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-60 shrink-0 border-r border-border bg-card p-4 md:block">
        <Link href="/dashboard" className="mb-8 flex items-center gap-2 px-2">
          <span
            className="inline-block h-5 w-5 rounded-[6px]"
            style={{ backgroundColor: "#b8f724" }}
            aria-hidden
          />
          <span className="font-heading text-lg font-bold text-foreground">
            RoutePilot
          </span>
        </Link>
        <nav className="flex flex-col gap-1">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6 md:p-8">{children}</main>
    </div>
  );
}
