"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

const AXIS = { fontSize: 12, fill: "#5b6b82" };
const GRID = "#eef1f6";

function ChartTooltip({ active, payload, label, currency }: TooltipProps<number, string> & { currency?: boolean; payload?: { value: number; payload: Record<string, unknown> }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  const v = Number(payload[0].value);
  const name = String(payload[0].payload.name ?? label ?? "");
  return (
    <div className="rounded-lg border bg-white px-3 py-2 text-xs shadow-[var(--shadow-lift)]">
      <p className="font-medium text-foreground">{label && !payload[0].payload.name ? label : name}</p>
      <p className="mt-0.5 text-muted-foreground">{currency ? formatCurrency(v) : v}</p>
    </div>
  );
}

/** Monthly revenue — single series, single hue. */
export function RevenueChart({ data }: { data: { month: string; revenue: number }[] }) {
  return (
    <div className="h-[260px] w-full" role="img" aria-label={`Monthly revenue: ${data.map((d) => `${d.month} ${formatCurrency(d.revenue)}`).join(", ")}`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, left: 4, bottom: 0 }} barCategoryGap="28%">
          <CartesianGrid vertical={false} stroke={GRID} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tick={AXIS} />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={AXIS}
            width={52}
            tickFormatter={(v: number) => (v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : v >= 1000 ? `₹${Math.round(v / 1000)}k` : `₹${v}`)}
          />
          <Tooltip cursor={{ fill: "rgba(31,90,214,0.06)" }} content={<ChartTooltip currency />} />
          <Bar dataKey="revenue" fill="var(--chart-1)" radius={[4, 4, 0, 0]} maxBarSize={44} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Horizontal bars with category labels on the axis (label is the primary encoding, colour secondary). */
export function HorizontalBars({
  data,
  color = "var(--chart-1)",
  height,
  valueFormat = "count",
}: {
  data: { name: string; value: number; color?: string }[];
  color?: string;
  height?: number;
  valueFormat?: "count" | "currency";
}) {
  const fmt = (v: number) => (valueFormat === "currency" ? formatCurrency(v) : String(v));
  const h = height ?? Math.max(160, data.length * 38 + 16);
  return (
    <div style={{ height: h }} className="w-full" role="img" aria-label={data.map((d) => `${d.name}: ${d.value}`).join(", ")}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: valueFormat === "currency" ? 72 : 28, left: 0, bottom: 0 }} barCategoryGap="30%">
          <CartesianGrid horizontal={false} stroke={GRID} />
          <XAxis type="number" hide allowDecimals={false} />
          <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} tick={AXIS} width={140} />
          <Tooltip cursor={{ fill: "rgba(31,90,214,0.06)" }} content={<ChartTooltip currency={valueFormat === "currency"} />} />
          <Bar
            dataKey="value"
            radius={[0, 4, 4, 0]}
            maxBarSize={18}
            isAnimationActive={false}
            label={{ position: "right", fontSize: 12, fill: "#334155", formatter: (v: unknown) => fmt(Number(v)) }}
          >
            {data.map((d) => (
              <Cell key={d.name} fill={d.color ?? color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
