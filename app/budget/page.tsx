export const revalidate = 86400;

import { getBudgetYears } from "@/lib/queries";
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
          No budget data available yet. Run{" "}
          <code className="bg-muted px-1 rounded">npx tsx scripts/import-blgf.ts</code> to import BLGF fiscal data.
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
        CSJDM annual fiscal data sourced from BLGF (Bureau of Local Government Finance).
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
              <p className="text-2xl font-bold">{s.value}</p>
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
              {["Year", "Income", "Expenditure", "Surplus", "DRRF", "SEF"].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium text-muted-foreground">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...budgetData].reverse().map((row, i) => (
              <tr key={row.year} className={i % 2 === 0 ? "bg-background" : "bg-muted/30"}>
                <td className="px-4 py-3 font-medium">{row.year}</td>
                <td className="px-4 py-3">{formatPeso(row.income)}</td>
                <td className="px-4 py-3">{formatPeso(row.expenditure)}</td>
                <td className="px-4 py-3 text-green-700">{formatPeso(row.income - row.expenditure)}</td>
                <td className="px-4 py-3">{formatPeso(row.drrf)}</td>
                <td className="px-4 py-3">{formatPeso(row.sef)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground mt-3">
        Source: BLGF (Bureau of Local Government Finance) — Annual Statement of Receipts and Expenditures.
        Refresh: <code className="bg-muted px-1 rounded">npx tsx scripts/import-blgf.ts</code>
      </p>
    </div>
  );
}
