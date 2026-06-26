export const revalidate = 3600;

import type { Metadata } from "next";
import { getContracts } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Procurement & Contracts | CSJDM Budget Portal",
  description: "Explore San Jose del Monte's government contracts — active projects, contractors, amounts, and categories from PhilGEPS.",
  openGraph: {
    title: "Procurement & Contracts | CSJDM Budget Portal",
    description: "Explore San Jose del Monte's government contracts — active projects, contractors, amounts, and categories from PhilGEPS.",
  },
};
import { formatPeso } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProcurementTable } from "./procurement-table";

export default async function ProcurementPage() {
  const contracts = await getContracts();

  const total = contracts.reduce((sum, c) => sum + c.amount, 0);
  const active = contracts.filter((c) => c.status === "Active");
  const healthSpend = contracts
    .filter((c) => c.category === "Health")
    .reduce((sum, c) => sum + c.amount, 0);
  const healthCount = contracts.filter((c) => c.category === "Health").length;
  const waterSpend = contracts
    .filter((c) => c.category === "Water & Utilities")
    .reduce((sum, c) => sum + c.amount, 0);

  if (contracts.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold tracking-tight mb-1">Procurement & Contracts</h1>
        <p className="text-muted-foreground">No contract data available at the moment.</p>
      </div>
    );
  }

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
            <p className="text-xl font-bold sm:text-2xl">{formatPeso(total)}</p>
            <p className="text-xs text-muted-foreground">{contracts.length} contracts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Active Contracts</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-xl font-bold sm:text-2xl">{active.length}</p>
            <p className="text-xs text-muted-foreground">{formatPeso(active.reduce((s, c) => s + c.amount, 0))}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Health</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-xl font-bold sm:text-2xl">{formatPeso(healthSpend)}</p>
            <p className="text-xs text-muted-foreground">{healthCount} health contracts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Water & Utilities</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-xl font-bold sm:text-2xl">{formatPeso(waterSpend)}</p>
            <p className="text-xs text-muted-foreground">250k residents lack water</p>
          </CardContent>
        </Card>
      </div>

      <ProcurementTable contracts={contracts} />
      <p className="text-xs text-muted-foreground mt-4">
        Source:{" "}
        <a
          href="https://www.philgeps.gov.ph/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-foreground transition-colors"
        >
          PhilGEPS (Philippine Government Electronic Procurement System)
        </a>
        . Click any reference number in the table to view its source details and verification steps.
      </p>
    </div>
  );
}
