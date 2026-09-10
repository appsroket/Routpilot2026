import type { ReactNode } from "react";
import Link from "next/link";
import {
  Navigation,
  Clock,
  DollarSign,
  CheckCircle2,
  Users,
  Zap,
  ArrowRight,
} from "lucide-react";

import type { RouteOptimization, Technician } from "@/types";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { cn } from "@/lib/utils";
import { HoursSavedChart, type HoursSavedPoint } from "@/components/dashboard/hours-saved-chart";

// Local YYYY-MM-DD.
function fmtDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

type Period = "week" | "month";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { period?: string };
}) {
  const user = await requireUser();
  const supabase = createClient();

  const period: Period = searchParams.period === "week" ? "week" : "month";

  // Date anchors (server local time).
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayISO = fmtDate(startOfToday);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const mondayOffset = (startOfToday.getDay() + 6) % 7; // 0 = Monday
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfToday.getDate() - mondayOffset);
  const chartStart = new Date(startOfToday);
  chartStart.setDate(startOfToday.getDate() - 13); // 14-day window (incl. today)

  const periodStart = period === "week" ? startOfWeek : startOfMonth;
  const earliest = new Date(
    Math.min(startOfMonth.getTime(), startOfWeek.getTime(), chartStart.getTime()),
  );

  // Fetch everything the page needs in parallel.
  const [
    { data: profile },
    { data: techData },
    { data: optData },
    { count: completedCount },
    { data: todayJobs },
  ] = await Promise.all([
    supabase.from("profiles").select("hourly_rate").eq("id", user.id).single(),
    supabase
      .from("technicians")
      .select("id, name, color, active")
      .eq("owner_id", user.id)
      .order("name", { ascending: true }),
    supabase
      .from("route_optimizations")
      .select("created_at, distance_saved_m, duration_saved_s")
      .eq("owner_id", user.id)
      .gte("created_at", earliest.toISOString())
      .order("created_at", { ascending: true }),
    supabase
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", user.id)
      .eq("status", "completed")
      .gte("scheduled_date", fmtDate(periodStart))
      .lte("scheduled_date", todayISO),
    supabase
      .from("jobs")
      .select("technician_id")
      .eq("owner_id", user.id)
      .eq("scheduled_date", todayISO),
  ]);

  const hourlyRate = profile?.hourly_rate ?? 150;
  const technicians = (techData ?? []) as Pick<
    Technician,
    "id" | "name" | "color" | "active"
  >[];
  const activeTechnicians = technicians.filter((t) => t.active);
  const optimizations = (optData ?? []) as Pick<
    RouteOptimization,
    "created_at" | "distance_saved_m" | "duration_saved_s"
  >[];

  // Period KPIs (optimizations logged within the selected period).
  const periodStartMs = periodStart.getTime();
  const inPeriod = optimizations.filter(
    (o) => new Date(o.created_at).getTime() >= periodStartMs,
  );
  const metersSaved = inPeriod.reduce((s, o) => s + (o.distance_saved_m ?? 0), 0);
  const secondsSaved = inPeriod.reduce((s, o) => s + (o.duration_saved_s ?? 0), 0);
  const milesSaved = metersSaved / 1609.34;
  const hoursSaved = secondsSaved / 3600;
  const moneySaved = hoursSaved * hourlyRate;
  const optimizationsRun = inPeriod.length;

  // 14-day "hours saved per day" chart.
  const dayBuckets = new Map<string, number>();
  for (let i = 0; i < 14; i++) {
    const d = new Date(chartStart);
    d.setDate(chartStart.getDate() + i);
    dayBuckets.set(fmtDate(d), 0);
  }
  for (const o of optimizations) {
    const key = fmtDate(new Date(o.created_at));
    if (dayBuckets.has(key)) {
      dayBuckets.set(key, dayBuckets.get(key)! + (o.duration_saved_s ?? 0) / 3600);
    }
  }
  const chartData: HoursSavedPoint[] = Array.from(dayBuckets.entries()).map(
    ([key, hours]) => {
      const d = new Date(`${key}T00:00:00`);
      return {
        label: d.toLocaleDateString("en-US", { month: "numeric", day: "numeric" }),
        hours: Math.round(hours * 10) / 10,
      };
    },
  );

  // Today's stop counts per technician.
  const stopsByTech = new Map<string, number>();
  for (const j of (todayJobs ?? []) as { technician_id: string | null }[]) {
    if (j.technician_id) {
      stopsByTech.set(j.technician_id, (stopsByTech.get(j.technician_id) ?? 0) + 1);
    }
  }

  const hasData = optimizations.length > 0;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Your routing ROI at a glance."
        action={<PeriodTabs period={period} />}
      />

      {!hasData ? (
        <EmptyState />
      ) : (
        <div className="space-y-6">
          {/* Hero: money saved */}
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="size-4 text-primary" />
              Money saved {period === "week" ? "this week" : "this month"}
            </div>
            <p className="mt-2 font-heading text-5xl font-bold tracking-tight text-primary">
              {moneySaved.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 0,
              })}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {hoursSaved.toFixed(1)} hours saved × ${hourlyRate.toLocaleString()}/hr
            </p>
          </div>

          {/* KPI grid */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <Kpi
              icon={<Navigation className="size-4" />}
              label="Miles saved"
              value={milesSaved.toLocaleString("en-US", { maximumFractionDigits: 1 })}
            />
            <Kpi
              icon={<Clock className="size-4" />}
              label="Hours saved"
              value={hoursSaved.toLocaleString("en-US", { maximumFractionDigits: 1 })}
            />
            <Kpi
              icon={<CheckCircle2 className="size-4" />}
              label="Jobs completed"
              value={String(completedCount ?? 0)}
            />
            <Kpi
              icon={<Users className="size-4" />}
              label="Active techs"
              value={String(activeTechnicians.length)}
            />
            <Kpi
              icon={<Zap className="size-4" />}
              label="Optimizations"
              value={String(optimizationsRun)}
            />
          </div>

          {/* Chart + Today panel */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-5 lg:col-span-2">
              <h2 className="mb-4 font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Hours saved · last 14 days
              </h2>
              <HoursSavedChart data={chartData} />
            </div>

            <div className="rounded-lg border border-border bg-card p-5">
              <h2 className="mb-4 font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Today
              </h2>
              <TodayPanel technicians={activeTechnicians} stopsByTech={stopsByTech} today={todayISO} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PeriodTabs({ period }: { period: Period }) {
  const tab = (value: Period, label: string) => (
    <Link
      href={`/dashboard?period=${value}`}
      className={cn(
        "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        period === value
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );
  return (
    <div className="inline-flex items-center gap-1 rounded-md border border-border bg-card p-1">
      {tab("week", "This week")}
      {tab("month", "This month")}
    </div>
  );
}

function Kpi({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="text-primary">{icon}</span>
        {label}
      </div>
      <p className="mt-2 font-heading text-2xl font-bold text-primary">{value}</p>
    </div>
  );
}

function TodayPanel({
  technicians,
  stopsByTech,
  today,
}: {
  technicians: Pick<Technician, "id" | "name" | "color">[];
  stopsByTech: Map<string, number>;
  today: string;
}) {
  if (technicians.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No active technicians.{" "}
        <Link href="/technicians" className="text-primary hover:underline">
          Add one
        </Link>
        .
      </p>
    );
  }
  return (
    <ul className="space-y-2">
      {technicians.map((t) => {
        const stops = stopsByTech.get(t.id) ?? 0;
        return (
          <li key={t.id}>
            <Link
              href={`/map?date=${today}&tech=${t.id}`}
              className="group flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <span className="flex min-w-0 items-center gap-2">
                <span
                  aria-hidden
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: t.color }}
                />
                <span className="truncate text-sm text-foreground">{t.name}</span>
              </span>
              <span className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground">
                {stops} {stops === 1 ? "stop" : "stops"}
                <ArrowRight className="size-4 text-muted-foreground transition-colors group-hover:text-primary" />
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border bg-card px-6 py-20 text-center">
      <span className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Zap className="size-6" />
      </span>
      <div className="space-y-1">
        <p className="font-heading text-lg font-semibold text-foreground">
          No savings tracked yet
        </p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Optimize your first route to start tracking miles, hours, and money saved.
        </p>
      </div>
      <Link
        href="/map"
        className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Go to Map & Routes
        <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}
