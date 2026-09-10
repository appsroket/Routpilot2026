import { Logo } from "@/components/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      {/* Branded panel */}
      <aside className="relative hidden flex-col justify-between border-r border-border bg-card p-12 lg:flex">
        <Logo markClassName="h-7 w-7" textClassName="text-xl" />

        <div className="max-w-md">
          <h1 className="font-heading text-4xl font-extrabold leading-tight text-foreground">
            Stop paying your techs to drive.
          </h1>
          <p className="mt-4 text-base text-muted-foreground">
            Smart routing and dispatch for field service teams — plan the day,
            assign every job, and keep the fleet moving.
          </p>
        </div>

        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} RoutePilot
        </p>
      </aside>

      {/* Form area */}
      <main className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          {/* Compact wordmark for small screens */}
          <Logo markClassName="h-7 w-7" textClassName="text-xl" className="mb-8 lg:hidden" />
          {children}
        </div>
      </main>
    </div>
  );
}
