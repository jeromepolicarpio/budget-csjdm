export const revalidate = 86400;

import type { Metadata } from "next";
import { getBudgetYears } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Budget Dashboard | CSJDM Budget Portal",
  description: "Year-by-year breakdown of San Jose del Monte's income, expenditure, and surplus from 2018 to present.",
  openGraph: {
    title: "Budget Dashboard | CSJDM Budget Portal",
    description: "Year-by-year breakdown of San Jose del Monte's income, expenditure, and surplus from 2018 to present.",
  },
};
import type { BudgetYear } from "@/lib/types";

function surplusColorClass(surplus: number, income: number): string {
  if (income === 0) return "text-muted-foreground";
  if (surplus < 0) return "text-red-600";
  const pct = surplus / income;
  if (pct > 0.3) return "text-amber-600";
  return "text-green-700";
}

function yoyIndicator(current: number, prev: BudgetYear | undefined, field: "income" | "expenditure"): string {
  if (!prev) return "";
  const diff = current - prev[field];
  if (diff > 0) return " ↑";
  if (diff < 0) return " ↓";
  return "";
}

function yoyColorClass(current: number, prev: BudgetYear | undefined, field: "income" | "expenditure"): string {
  if (!prev) return "";
  const diff = current - prev[field];
  if (field === "income") return diff > 0 ? "text-green-600" : diff < 0 ? "text-red-600" : "";
  return diff > 0 ? "text-red-600" : diff < 0 ? "text-green-600" : "";
}
import Link from "next/link";
import { formatPeso } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BudgetCharts } from "./budget-charts";

export default async function BudgetPage() {
  const budgetData = await getBudgetYears();

  if (budgetData.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold tracking-tight mb-4">Budget Dashboard</h1>
        <p className="text-muted-foreground">
          No budget data available yet.
        </p>
      </div>
    );
  }

  const latest = budgetData[budgetData.length - 1];
  const surplus = latest.income - latest.expenditure;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight mb-1">Budget Dashboard</h1>
      <p className="text-muted-foreground mb-4">
        CSJDM annual fiscal data sourced from the{" "}
        <a
          href="https://blgf.gov.ph/lgu-fiscal-data/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-foreground transition-colors"
        >
          Bureau of Local Government Finance (BLGF)
        </a>
        .
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: `${latest.year} Income`, value: formatPeso(latest.income) },
          { label: `${latest.year} Expenditure`, value: formatPeso(latest.expenditure) },
          { label: "Budget Surplus", value: formatPeso(surplus), note: surplus > 0 ? "Unspent" : "Deficit" },
          { label: "Education Fund (SEF)", value: formatPeso(latest.sef) },
        ].map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-1 pt-4 px-4">
              <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                {s.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-xl font-bold sm:text-2xl">{s.value}</p>
              {s.note && <p className="text-xs text-muted-foreground">{s.note}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-6 mb-8">
        <BudgetCharts data={budgetData} />
      </div>

      <Separator className="my-8" />

      <h2 className="text-xl font-semibold mb-4">Raw Fiscal Data</h2>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              {(["Year", "Income", "Expenditure", "Surplus"] as const).map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium text-muted-foreground">{h}</th>
              ))}
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                <abbr title="Disaster Risk Reduction Fund">DRRF</abbr>
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                <abbr title="Special Education Fund">SEF</abbr>
              </th>
            </tr>
          </thead>
          <tbody>
            {[...budgetData].reverse().map((row, i, arr) => {
              const prev = arr[i + 1];
              const surplus = row.income - row.expenditure;
              return (
                <tr key={row.year} className="border-t hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 font-medium">{row.year}</td>
                  <td className="px-4 py-3">
                    {formatPeso(row.income)}
                    <span className={`text-xs ml-1 ${yoyColorClass(row.income, prev, "income")}`}>
                      {yoyIndicator(row.income, prev, "income")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {formatPeso(row.expenditure)}
                    <span className={`text-xs ml-1 ${yoyColorClass(row.expenditure, prev, "expenditure")}`}>
                      {yoyIndicator(row.expenditure, prev, "expenditure")}
                    </span>
                  </td>
                  <td className={`px-4 py-3 font-medium ${surplusColorClass(surplus, row.income)}`}>
                    {formatPeso(surplus)}
                  </td>
                  <td className="px-4 py-3">{formatPeso(row.drrf)}</td>
                  <td className="px-4 py-3">{formatPeso(row.sef)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground mt-4">
        Source:{" "}
        <a
          href="https://blgf.gov.ph/lgu-fiscal-data/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-foreground transition-colors"
        >
          BLGF Annual Statement of Receipts and Expenditures
        </a>
        .{" "}
        <Link href="/budget/source" className="underline underline-offset-2 hover:text-foreground transition-colors">
          View source details →
        </Link>
      </p>
    </div>
  );
}
