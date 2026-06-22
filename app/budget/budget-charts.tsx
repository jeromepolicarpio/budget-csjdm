"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import type { BudgetYear } from "@/lib/types";

export function BudgetCharts({ data }: { data: BudgetYear[] }) {
  const chartData = data.map((d) => ({
    year: d.year.toString(),
    Income: d.income / 1_000_000,
    Expenditure: d.expenditure / 1_000_000,
    DRRF: d.drrf / 1_000_000,
    SEF: d.sef / 1_000_000,
  }));

  return (
    <>
      <div className="rounded-lg border bg-card">
        <div className="p-6 pb-0">
          <h3 className="font-semibold">Income vs. Expenditure (₱ Millions)</h3>
        </div>
        <div className="p-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="year" className="text-xs" />
              <YAxis tickFormatter={(v) => `₱${v}M`} className="text-xs" />
              <Tooltip formatter={(v) => `₱${Number(v).toFixed(0)}M`} />
              <Legend />
              <Bar dataKey="Income" fill="#2563eb" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Expenditure" fill="#93c5fd" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="p-6 pb-0">
          <h3 className="font-semibold">Disaster Risk Reduction Fund (DRRF) Trend</h3>
          <p className="text-sm text-muted-foreground mt-1">
            5% of income is mandated for DRRF — but did CSJDM actually spend it on flood prep?
          </p>
        </div>
        <div className="p-6">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="year" className="text-xs" />
              <YAxis tickFormatter={(v) => `₱${v}M`} className="text-xs" />
              <Tooltip formatter={(v) => `₱${Number(v).toFixed(0)}M`} />
              <Line type="monotone" dataKey="DRRF" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}
