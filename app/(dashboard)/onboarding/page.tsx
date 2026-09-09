import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { OnboardingForm } from "@/components/onboarding-form";

export default async function OnboardingPage() {
  const user = await requireUser();
  const supabase = createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_name, phone, hourly_rate, home_base_address")
    .eq("id", user.id)
    .single();

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-lg flex-col justify-center py-10">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-extrabold text-foreground">
          Set up your shop
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          A few details so RoutePilot can plan routes from your home base.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <OnboardingForm
          defaults={{
            company_name: profile?.company_name ?? "",
            phone: profile?.phone ?? "",
            hourly_rate: profile?.hourly_rate ?? 150,
            home_base_address: profile?.home_base_address ?? "",
          }}
        />
      </div>
    </div>
  );
}
