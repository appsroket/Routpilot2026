"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2, ArrowUpRight, CreditCard } from "lucide-react";

import { Button } from "@/components/ui/button";

type Endpoint = "/api/stripe/checkout" | "/api/stripe/portal";

function useStripeRedirect() {
  const [pending, setPending] = React.useState<Endpoint | null>(null);

  async function go(endpoint: Endpoint) {
    setPending(endpoint);
    try {
      const res = await fetch(endpoint, { method: "POST" });
      const data = (await res.json()) as { ok: boolean; url?: string; error?: string };
      if (!data.ok || !data.url) {
        toast.error(data.error ?? "Something went wrong.");
        setPending(null);
        return;
      }
      window.location.href = data.url;
    } catch {
      toast.error("Could not reach the billing service.");
      setPending(null);
    }
  }

  return { pending, go };
}

export function UpgradeButton({ label = "Upgrade" }: { label?: string }) {
  const { pending, go } = useStripeRedirect();
  const loading = pending === "/api/stripe/checkout";
  return (
    <Button onClick={() => go("/api/stripe/checkout")} disabled={pending !== null}>
      {loading ? <Loader2 className="animate-spin" /> : <ArrowUpRight className="size-4" />}
      {label}
    </Button>
  );
}

export function ManageBillingButton() {
  const { pending, go } = useStripeRedirect();
  const loading = pending === "/api/stripe/portal";
  return (
    <Button variant="outline" onClick={() => go("/api/stripe/portal")} disabled={pending !== null}>
      {loading ? <Loader2 className="animate-spin" /> : <CreditCard className="size-4" />}
      Manage billing
    </Button>
  );
}
