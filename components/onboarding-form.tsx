"use client";

import { useEffect, useRef, useState } from "react";
// useFormState lives in react-dom on React 18 / Next 14.
import { useFormState, useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { configureMaps, importMapsLibrary } from "@/lib/google";
import { saveOnboarding, type OnboardingState } from "@/app/(dashboard)/onboarding/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  defaults: {
    company_name: string;
    phone: string;
    hourly_rate: number;
    home_base_address: string;
  };
};

const initialState: OnboardingState = { error: null };

export function OnboardingForm({ defaults }: Props) {
  const [state, formAction] = useFormState(saveOnboarding, initialState);

  const addressInputRef = useRef<HTMLInputElement>(null);
  const [lat, setLat] = useState<string>("");
  const [lng, setLng] = useState<string>("");

  // Surface server-action errors as toasts.
  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state]);

  // Wire up Google Places Autocomplete on the address field.
  useEffect(() => {
    let autocomplete: google.maps.places.Autocomplete | undefined;
    let listener: google.maps.MapsEventListener | undefined;
    let cancelled = false;

    async function init() {
      const input = addressInputRef.current;
      if (!input) return;

      if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
        // No key configured — leave a plain text field the user can type into.
        return;
      }

      try {
        configureMaps();
        const places = await importMapsLibrary("places");
        if (cancelled || !addressInputRef.current) return;

        autocomplete = new places.Autocomplete(addressInputRef.current, {
          fields: ["formatted_address", "geometry"],
          types: ["address"],
        });

        listener = autocomplete.addListener("place_changed", () => {
          const place = autocomplete!.getPlace();
          if (place.formatted_address && addressInputRef.current) {
            addressInputRef.current.value = place.formatted_address;
          }
          const loc = place.geometry?.location;
          setLat(loc ? String(loc.lat()) : "");
          setLng(loc ? String(loc.lng()) : "");
        });
      } catch {
        toast.error("Could not load address autocomplete.");
      }
    }

    init();
    return () => {
      cancelled = true;
      if (listener) listener.remove();
    };
  }, []);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="company_name">Company name</Label>
        <Input
          id="company_name"
          name="company_name"
          type="text"
          required
          defaultValue={defaults.company_name}
          placeholder="Rivera HVAC"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={defaults.phone}
          placeholder="+1 555 123 4567"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="hourly_rate">Default technician hourly rate ($)</Label>
        <Input
          id="hourly_rate"
          name="hourly_rate"
          type="number"
          min={0}
          step="1"
          required
          defaultValue={defaults.hourly_rate}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="home_base_address">Home base / shop address</Label>
        <Input
          id="home_base_address"
          name="home_base_address"
          type="text"
          ref={addressInputRef}
          defaultValue={defaults.home_base_address}
          placeholder="Start typing your address…"
          autoComplete="off"
        />
        {/* Captured from the selected place */}
        <input type="hidden" name="home_base_lat" value={lat} />
        <input type="hidden" name="home_base_lng" value={lng} />
      </div>

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending && <Loader2 className="animate-spin" />}
      Finish setup
    </Button>
  );
}
