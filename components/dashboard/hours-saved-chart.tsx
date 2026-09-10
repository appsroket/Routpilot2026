"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type HoursSavedPoint = { label: string; hours: number };

export function HoursSavedChart({ data }: { data: HoursSavedPoint[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e1f0" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "#6b6b7b", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "#e4e1f0" }}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: "#6b6b7b", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={40}
            allowDecimals={false}
          />
          <Tooltip
            cursor={{ fill: "rgba(90,47,218,0.08)" }}
            contentStyle={{
              background: "#ffffff",
              border: "1px solid #e4e1f0",
              borderRadius: 12,
              color: "#1b1930",
              boxShadow: "0 8px 24px -12px rgba(27,25,48,0.25)",
            }}
            labelStyle={{ color: "#6b6b7b" }}
            formatter={(value) => [`${Number(value).toFixed(1)} h`, "Hours saved"]}
          />
          <Bar dataKey="hours" fill="#5a2fda" radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
