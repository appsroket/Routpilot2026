"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { Technician } from "@/types";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type TechOption = Pick<Technician, "id" | "name">;

export function JobsFilters({
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
        <Label htmlFor="filter-date">Date</Label>
        <Input
          id="filter-date"
          type="date"
          value={date}
          onChange={(e) => setParam("date", e.target.value)}
          className="w-auto"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="filter-tech">Technician</Label>
        <Select
          id="filter-tech"
          value={tech}
          onChange={(e) => setParam("tech", e.target.value)}
          className="w-full sm:w-56"
        >
          <option value="all">All technicians</option>
          <option value="unassigned">Unassigned</option>
          {technicians.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}
