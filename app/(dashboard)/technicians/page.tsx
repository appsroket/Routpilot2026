import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";

export default function TechniciansPage() {
  return (
    <div>
      <PageHeader title="Technicians" action={<Button>Add technician</Button>} />
      <p className="text-sm text-muted-foreground">Coming soon.</p>
    </div>
  );
}
