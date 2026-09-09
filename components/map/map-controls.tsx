"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { Technician } from "@/types";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type TechOption = Pick<Technician, "id" | "name">;

export function MapControls({
  date,
  tech,
  technicians,
}: {
  date: string;
  tech: string;
  technicians: TechOption[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end">
      <div className="space-y-1.5">
        <Label htmlFor="map-date">Date</Label>
        <Input
          id="map-date"
          type="date"
          value={date}
          onChange={(e) => setParam("date", e.target.value)}
          className="w-auto"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="map-tech">Technician</Label>
        <Select
          id="map-tech"
          value={tech}
          onChange={(e) => setParam("tech", e.target.value)}
          className="w-full sm:w-56"
          disabled={technicians.length === 0}
        >
          {technicians.length === 0 ? (
            <option value="">No technicians</option>
          ) : (
            technicians.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))
          )}
        </Select>
      </div>
    </div>
  );
}
