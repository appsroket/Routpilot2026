import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/dashboard/app-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const pathname = headers().get("x-pathname") ?? "";

  // Onboarding lives in this route group but must render without the app
  // shell (and without the company-name gate, or it would redirect to itself).
  if (pathname === "/onboarding") {
    return <>{children}</>;
  }

  const supabase = createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("company_name")
    .eq("id", user.id)
    .single();

  if (!profile?.company_name) {
    redirect("/onboarding");
  }

  return (
    <AppShell companyName={profile.company_name} email={user.email ?? ""}>
      {children}
    </AppShell>
  );
}
