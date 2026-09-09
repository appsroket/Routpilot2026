import { Plus, Users } from "lucide-react";

import type { Technician } from "@/types";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { TechnicianFormDialog } from "@/components/technicians/technician-form-dialog";
import { TechnicianCard } from "@/components/technicians/technician-card";

export default async function TechniciansPage() {
  const user = await requireUser();
  const supabase = createClient();

  const { data } = await supabase
    .from("technicians")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true });

  const technicians = (data ?? []) as Technician[];

  return (
    <div>
      <PageHeader
        title="Technicians"
        description="Your field crew — assign jobs and send SMS updates."
        action={
          <TechnicianFormDialog
            mode="create"
            trigger={
              <Button>
                <Plus className="size-4" />
                Add technician
              </Button>
            }
          />
        }
      />

      {technicians.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {technicians.map((technician) => (
            <TechnicianCard key={technician.id} technician={technician} />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border bg-card px-6 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Users className="size-6" />
      </span>
      <div className="space-y-1">
        <p className="font-heading text-lg font-semibold text-foreground">
          No technicians yet
        </p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Add your crew to start assigning jobs and routing their day.
        </p>
      </div>
      <TechnicianFormDialog
        mode="create"
        trigger={
          <Button>
            <Plus className="size-4" />
            Add your first technician
          </Button>
        }
      />
    </div>
  );
}
