import { Check } from "lucide-react";

import type { Subscription } from "@/types";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { cn } from "@/lib/utils";
import { UpgradeButton, ManageBillingButton } from "@/components/billing/billing-actions";
import { BillingToasts } from "@/components/billing/billing-toasts";

const PLAN_NAME = "Pro";
const PLAN_PRICE = "$99/mo";
const PLAN_FEATURES = [
  "Unlimited route optimizations",
  "SMS dispatch to technicians",
  "ROI tracking dashboard",
  "Unlimited jobs and technicians",
];

const STATUS_LABELS: Record<string, string> = {
  trialing: "Trial",
  active: "Active",
  past_due: "Past due",
  canceled: "Canceled",
  unpaid: "Unpaid",
  incomplete: "Incomplete",
};

const STATUS_CLASSES: Record<string, string> = {
  trialing: "bg-primary/15 text-primary border-primary/30",
  active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  past_due: "bg-red-500/10 text-red-400 border-red-500/30",
  canceled: "bg-muted text-muted-foreground border-border",
  unpaid: "bg-red-500/10 text-red-400 border-red-500/30",
  incomplete: "bg-muted text-muted-foreground border-border",
};

export default async function BillingPage({
  searchParams,
}: {
  searchParams: { gated?: string; checkout?: string };
}) {
  const user = await requireUser();
  const supabase = createClient();

  const { data } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("owner_id", user.id)
    .single();
  const subscription = data as Subscription | null;

  const status = subscription?.status ?? "trialing";
  const isActive = status === "active";
  const hasCustomer = Boolean(subscription?.stripe_customer_id);
  const periodEnd = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div>
      <BillingToasts
        gated={searchParams.gated === "1"}
        checkout={searchParams.checkout ?? null}
      />

      <PageHeader title="Billing" description="Your plan, status, and invoices." />

      <div className="grid max-w-3xl grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Current status */}
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Current plan
            </h2>
            <span
              className={cn(
                "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
                STATUS_CLASSES[status] ?? STATUS_CLASSES.incomplete,
              )}
            >
              {STATUS_LABELS[status] ?? status}
            </span>
          </div>
          <p className="mt-3 font-heading text-2xl font-bold text-foreground">
            {subscription?.plan === "pro" || isActive ? "Pro" : "Trial"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {isActive
              ? periodEnd
                ? `Renews ${periodEnd}.`
                : "Your subscription is active."
              : status === "trialing"
                ? "You're on the free trial. Upgrade to keep optimizing after it ends."
                : "Reactivate your plan to keep optimizing routes."}
          </p>
          {hasCustomer && (
            <div className="mt-4">
              <ManageBillingButton />
            </div>
          )}
        </div>

        {/* Pro plan offer */}
        <div className="rounded-lg border border-primary/40 bg-card p-6">
          <div className="flex items-baseline justify-between">
            <h2 className="font-heading text-lg font-bold text-foreground">{PLAN_NAME}</h2>
            <span className="font-heading text-xl font-bold text-primary">{PLAN_PRICE}</span>
          </div>
          <ul className="mt-4 space-y-2">
            {PLAN_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                {f}
              </li>
            ))}
          </ul>
          <div className="mt-6">
            {isActive ? (
              <p className="text-sm text-emerald-400">You&apos;re on Pro. Thanks!</p>
            ) : (
              <UpgradeButton label={hasCustomer ? "Resubscribe" : "Upgrade to Pro"} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
