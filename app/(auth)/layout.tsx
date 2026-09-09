export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      {/* Branded panel */}
      <aside className="relative hidden flex-col justify-between border-r border-border bg-card p-12 lg:flex">
        <div className="flex items-center gap-3">
          <span
            className="inline-block h-6 w-6 rounded-[6px]"
            style={{ backgroundColor: "#b8f724" }}
            aria-hidden
          />
          <span className="font-heading text-xl font-bold tracking-tight text-foreground">
            RoutePilot
          </span>
        </div>

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
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span
              className="inline-block h-6 w-6 rounded-[6px]"
              style={{ backgroundColor: "#b8f724" }}
              aria-hidden
            />
            <span className="font-heading text-xl font-bold tracking-tight text-foreground">
              RoutePilot
            </span>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
