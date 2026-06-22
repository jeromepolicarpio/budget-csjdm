export const revalidate = 3600;

import { getContracts } from "@/lib/queries";
import { formatPeso } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProcurementTable } from "./procurement-table";

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
    <div className="max-w-7xl mx-auto px-6 py-10">
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

      <ProcurementTable contracts={contracts} />
      <p className="text-xs text-muted-foreground mt-3">
        Source: PhilGEPS contract awards. Run{" "}
        <code className="bg-muted px-1 rounded">npx tsx scripts/scrape-philgeps.ts</code> to refresh live data.
      </p>
    </div>
  );
}
