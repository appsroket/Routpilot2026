"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, Route, Send, MapPin } from "lucide-react";

import type { Job, Technician } from "@/types";
import { reorderJobs } from "@/app/(dashboard)/map/actions";
import { Button } from "@/components/ui/button";
import { GoogleMap, type MapStop } from "./google-map";
import { SortableJobList } from "./sortable-job-list";

type TechOption = Pick<Technician, "id" | "name" | "color">;

type OptimizeResponse = {
  ok: boolean;
  optimized?: boolean;
  error?: string;
  message?: string;
  stops?: { id: string; sequence: number; eta: string | null }[];
  polyline?: string | null;
  savings?: {
    distance_mi: number;
    duration_min: number;
  } | null;
};

export function MapRoutePlanner({
  jobs: initialJobs,
  technician,
  homeBase,
  date,
}: {
  jobs: Job[];
  technician: TechOption | null;
  homeBase: { lat: number; lng: number } | null;
  date: string;
}) {
  const [jobs, setJobs] = React.useState<Job[]>(initialJobs);
  const [polyline, setPolyline] = React.useState<string | null>(null);
  const [optimizing, setOptimizing] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [, startTransition] = React.useTransition();

  // Reset when the server data changes (date/tech switch).
  React.useEffect(() => {
    setJobs(initialJobs);
    setPolyline(null);
  }, [initialJobs]);

  const color = technician?.color ?? "#b8f724";
  const mapStops: MapStop[] = jobs
    .map((j, i) => ({ id: j.id, lat: j.lat as number, lng: j.lng as number, label: i + 1 }))
    .filter((s) => Number.isFinite(s.lat) && Number.isFinite(s.lng));
  const routableCount = mapStops.length;

  function handleReorder(orderedIds: string[]) {
    const byId = new Map(jobs.map((j) => [j.id, j]));
    setJobs(orderedIds.map((id) => byId.get(id)!).filter(Boolean));
    setPolyline(null); // a manual reorder invalidates the drawn route
    startTransition(async () => {
      const res = await reorderJobs(orderedIds);
      if (res?.error) toast.error(res.error);
    });
  }

  async function handleOptimize() {
    if (!technician) return;
    setOptimizing(true);
    try {
      const res = await fetch("/api/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ technicianId: technician.id, date }),
      });
      const data = (await res.json()) as OptimizeResponse;

      if (!data.ok) {
        toast.error(data.error ?? "Optimization failed.");
        return;
      }
      if (!data.optimized) {
        toast.info(data.message ?? "Nothing to optimize.");
        return;
      }

      // Re-order the list to match the optimized sequence.
      if (data.stops) {
        const order = new Map(data.stops.map((s) => [s.id, s.sequence]));
        setJobs((prev) =>
          [...prev].sort((a, b) => {
            const sa = order.get(a.id) ?? Number.MAX_SAFE_INTEGER;
            const sb = order.get(b.id) ?? Number.MAX_SAFE_INTEGER;
            return sa - sb;
          }),
        );
      }
      setPolyline(data.polyline ?? null);

      const mi = data.savings?.distance_mi ?? 0;
      const min = data.savings?.duration_min ?? 0;
      if (mi > 0.05 || min > 0.5) {
        toast.success(
          `Saved ${mi.toFixed(1)} mi and ${Math.round(min)} min vs your original order.`,
        );
      } else {
        toast.success("Your route is already optimal.");
      }
    } catch {
      toast.error("Could not reach the optimizer.");
    } finally {
      setOptimizing(false);
    }
  }

  async function handleSend() {
    if (!technician || jobs.length === 0) return;
    setSending(true);
    try {
      const res = await fetch("/api/send-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ technicianId: technician.id, date }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string; stops?: number };
      if (!data.ok) {
        toast.error(data.error ?? "Could not send the route.");
        return;
      }
      toast.success(
        `Route sent to ${technician.name} (${data.stops ?? jobs.length} ${
          (data.stops ?? jobs.length) === 1 ? "stop" : "stops"
        }).`,
      );
    } catch {
      toast.error("Could not reach the SMS service.");
    } finally {
      setSending(false);
    }
  }

  if (!technician) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border bg-card px-6 py-16 text-center">
        <span className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <MapPin className="size-6" />
        </span>
        <div className="space-y-1">
          <p className="font-heading text-lg font-semibold text-foreground">
            No technicians yet
          </p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Add a technician to plan and optimize their route.
          </p>
        </div>
        <Button asChild>
          <Link href="/technicians">Go to Technicians</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={handleOptimize} disabled={optimizing || routableCount < 2}>
          {optimizing ? <Loader2 className="animate-spin" /> : <Route className="size-4" />}
          Optimize Route
        </Button>
        <Button
          variant="outline"
          onClick={handleSend}
          disabled={sending || jobs.length === 0}
        >
          {sending ? <Loader2 className="animate-spin" /> : <Send className="size-4" />}
          Send to Technician
        </Button>
        {routableCount < 2 && jobs.length > 0 && (
          <span className="text-xs text-muted-foreground">
            Need at least two mapped stops to optimize.
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="order-2 lg:order-1">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Route order
            </h2>
            <span className="text-xs text-muted-foreground">
              {jobs.length} {jobs.length === 1 ? "stop" : "stops"}
            </span>
          </div>
          {jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-card px-6 py-12 text-center">
              <p className="text-sm text-muted-foreground">
                No jobs for {technician.name} on this date.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href={`/jobs?date=${date}&tech=${technician.id}`}>Add jobs</Link>
              </Button>
            </div>
          ) : (
            <SortableJobList jobs={jobs} color={color} onReorder={handleReorder} />
          )}
        </div>

        <div className="order-1 lg:order-2 lg:sticky lg:top-20 lg:self-start">
          <GoogleMap stops={mapStops} homeBase={homeBase} color={color} polyline={polyline} />
        </div>
      </div>
    </div>
  );
}
