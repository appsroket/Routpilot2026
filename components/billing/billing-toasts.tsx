"use client";

import * as React from "react";
import { toast } from "sonner";

// Fires one-off toasts based on redirect/query state, then leaves the URL
// as-is. Rendered by the billing page.
export function BillingToasts({
  gated,
  checkout,
}: {
  gated: boolean;
  checkout: string | null;
}) {
  const fired = React.useRef(false);

  React.useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    if (gated) {
      toast.info("Start your subscription to keep optimizing routes.");
    }
    if (checkout === "success") {
      toast.success("You're subscribed — thanks! Your plan will update shortly.");
    } else if (checkout === "cancel") {
      toast.info("Checkout canceled — no charge was made.");
    }
  }, [gated, checkout]);

  return null;
}
