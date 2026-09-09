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
          <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "#a0a0a0", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "#1f1f1f" }}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: "#a0a0a0", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={40}
            allowDecimals={false}
          />
          <Tooltip
            cursor={{ fill: "rgba(184,247,36,0.08)" }}
            contentStyle={{
              background: "#111111",
              border: "1px solid #1f1f1f",
              borderRadius: 8,
              color: "#ffffff",
            }}
            labelStyle={{ color: "#a0a0a0" }}
            formatter={(value) => [`${Number(value).toFixed(1)} h`, "Hours saved"]}
          />
          <Bar dataKey="hours" fill="#b8f724" radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
