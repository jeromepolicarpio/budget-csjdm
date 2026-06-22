export const revalidate = 3600;

import { getContracts } from "@/lib/queries";
import { formatPeso } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const STATUS_COLORS: Record<string, string> = {
  Active: "bg-green-100 text-green-800",
  Completed: "bg-blue-100 text-blue-800",
  Cancelled: "bg-red-100 text-red-800",
};

const CATEGORY_COLORS: Record<string, string> = {
  "Flood Control": "bg-amber-100 text-amber-800",
  "Water & Utilities": "bg-cyan-100 text-cyan-800",
  Roads: "bg-slate-100 text-slate-800",
  Buildings: "bg-purple-100 text-purple-800",
  "Street Lighting": "bg-yellow-100 text-yellow-800",
  Health: "bg-pink-100 text-pink-800",
};

export default async function ProcurementPage() {
  const contracts = await getContracts();

  const total = contracts.reduce((sum, c) => sum + c.amount, 0);
  const active = contracts.filter((c) => c.status === "Active");
  const floodSpend = contracts
    .filter((c) => c.category === "Flood Control")
    .reduce((sum, c) => sum + c.amount, 0);
  const waterSpend = contracts
    .filter((c) => c.category === "Water & Utilities")
    .reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight mb-1">Procurement & Contracts</h1>
      <p className="text-muted-foreground mb-8">
        Government contracts awarded in CSJDM via PhilGEPS (Philippine Government Electronic Procurement System).
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <Card>
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Total Awarded</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-2xl font-bold">{formatPeso(total)}</p>
            <p className="text-xs text-muted-foreground">{contracts.length} contracts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Active Contracts</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-2xl font-bold">{active.length}</p>
            <p className="text-xs text-muted-foreground">{formatPeso(active.reduce((s, c) => s + c.amount, 0))}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Flood Control</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-2xl font-bold">{formatPeso(floodSpend)}</p>
            <p className="text-xs text-muted-foreground">Yet flooding persists</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Water & Utilities</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-2xl font-bold">{formatPeso(waterSpend)}</p>
            <p className="text-xs text-muted-foreground">250k residents lack water</p>
          </CardContent>
        </Card>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              {["Contract ID", "Title", "Awardee", "Category", "Amount", "Date", "Status"].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {contracts.map((c, i) => (
              <tr key={c.id} className={i % 2 === 0 ? "bg-background" : "bg-muted/30"}>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{c.id}</td>
                <td className="px-4 py-3 max-w-xs">
                  <p className="font-medium leading-snug">{c.title}</p>
                </td>
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{c.awardee}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[c.category] ?? "bg-muted text-muted-foreground"}`}>
                    {c.category}
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold whitespace-nowrap">{formatPeso(c.amount)}</td>
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{c.date}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[c.status]}`}>
                    {c.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground mt-3">
        Source: PhilGEPS contract awards. Run{" "}
        <code className="bg-muted px-1 rounded">npx tsx scripts/scrape-philgeps.ts</code> to refresh live data.
      </p>
    </div>
  );
}
