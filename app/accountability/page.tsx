export const revalidate = 3600;

import { getBudgetYears, getDpwhProjects, getContracts } from "@/lib/queries";
import { formatPeso } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import type { Contract, DpwhProject } from "@/lib/types";

type FindingType = "critical" | "warn" | "ok";

type Finding = {
  type: FindingType;
  title: string;
  detail: string;
  relatedContracts?: Contract[];
  relatedProjects?: DpwhProject[];
};

export default async function AccountabilityPage() {
  const [budgetData, projects, contracts] = await Promise.all([
    getBudgetYears(),
    getDpwhProjects(),
    getContracts(),
  ]);

  const latest = budgetData[budgetData.length - 1];
  const floodBudget = projects
    .filter((p) => p.category === "Flood Control")
    .reduce((sum, p) => sum + p.budget, 0);
  const waterContracts = contracts
    .filter((c) => c.category === "Water & Utilities")
    .reduce((sum, c) => sum + c.amount, 0);
  const drrfTotal = budgetData.reduce((sum, y) => sum + y.drrf, 0);

  const waterContractsList = contracts.filter((c) => c.category === "Water & Utilities");
  const floodProjectsList = projects.filter((p) => p.category === "Flood Control");
  // PhilGEPS reference ID for the CSJDM Sports Complex contract (awarded 2020)
  const sportsContract = contracts.filter((c) => c.id === "20CD0147");

  const findings: Finding[] = [
    {
      type: "critical",
      title: "Water Crisis vs. Water Spending",
      detail: `The city awarded ${formatPeso(waterContracts)} in water & utility contracts, yet 250,000 residents (≈36% of the population) are without reliable water supply as of 2025 after PrimeWater's contract was terminated. Where did the money go?`,
      relatedContracts: waterContractsList,
    },
    {
      type: "critical",
      title: `Flooding Persists Despite ${formatPeso(floodBudget)} in Flood Projects`,
      detail: `DPWH has funded ${formatPeso(floodBudget)} in flood control projects in CSJDM since 2020. In June 2025, 22 barangays were still inundated — floodwater rose neck-deep in 45 minutes. The evacuation center in Brgy. San Rafael I (Contract 23CD0301) was still only 50% complete when floods hit.`,
      relatedProjects: floodProjectsList,
    },
    {
      type: "warn",
      title: `${formatPeso(drrfTotal)} in DRRF Collected — But Was It Spent?`,
      detail: `CSJDM has collected an estimated ${formatPeso(drrfTotal)} in Disaster Risk Reduction Funds from 2020–${latest.year}. The law mandates this be spent on disaster preparedness. No public accounting of DRRF expenditure has been published by the city.`,
    },
    {
      type: "warn",
      title: "Budget Surplus Every Year — But Services Are Failing",
      detail: `CSJDM has posted a budget surplus every year from 2020–${latest.year} (${formatPeso(latest.income - latest.expenditure)} in ${latest.year} alone). If the city consistently underspends, why are basic services like water and flood control still failing?`,
    },
    {
      type: "ok",
      title: "Sports Complex Delivered On Time",
      detail: `The San Jose del Monte Sports Complex (Contract 20CD0147, ${formatPeso(14_106_670)}) was completed in 2021 as contracted. At least one project was delivered as promised.`,
      relatedContracts: sportsContract.length > 0 ? sportsContract : undefined,
    },
  ];

  const icons: Record<FindingType, React.ReactNode> = {
    critical: <XCircle className="text-red-500 shrink-0 mt-0.5" size={20} />,
    warn: <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={20} />,
    ok: <CheckCircle className="text-green-500 shrink-0 mt-0.5" size={20} />,
  };

  const bgColors: Record<FindingType, string> = {
    critical: "border-red-200 bg-red-50",
    warn: "border-amber-200 bg-amber-50",
    ok: "border-green-200 bg-green-50",
  };

  const textColors: Record<FindingType, string> = {
    critical: "text-red-900",
    warn: "text-amber-900",
    ok: "text-green-900",
  };

  const detailColors: Record<FindingType, string> = {
    critical: "text-red-800",
    warn: "text-amber-800",
    ok: "text-green-800",
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Accountability Report</h1>
        <p className="text-muted-foreground">
          Cross-referencing CSJDM budget data, DPWH projects, and PhilGEPS contracts against what
          residents are actually experiencing on the ground.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-10">
        {(["critical", "warn", "ok"] as FindingType[]).map((type) => {
          const count = findings.filter((f) => f.type === type).length;
          const labels = { critical: "Critical Issues", warn: "Warnings", ok: "OK" };
          const colors = { critical: "text-red-600", warn: "text-amber-600", ok: "text-green-600" };
          return (
            <Card key={type}>
              <CardContent className="p-4 text-center">
                <p className={`text-3xl font-bold ${colors[type]}`}>{count}</p>
                <p className="text-sm text-muted-foreground">{labels[type]}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="space-y-4 mb-10">
        {findings.map((f, i) => (
          <div key={i} className={`border rounded-lg p-5 ${bgColors[f.type]}`}>
            <div className="flex gap-3">
              {icons[f.type]}
              <div className="flex-1">
                <p className={`font-semibold mb-1 ${textColors[f.type]}`}>{f.title}</p>
                <p className={`text-sm leading-relaxed ${detailColors[f.type]}`}>{f.detail}</p>
              </div>
            </div>
            {(f.relatedContracts || f.relatedProjects) && (
              <details className="mt-3 ml-8">
                <summary className={`text-xs font-medium cursor-pointer select-none hover:underline ${detailColors[f.type]}`}>
                  Show related {f.relatedContracts ? `contracts (${f.relatedContracts.length})` : ""}
                  {f.relatedContracts && f.relatedProjects ? " & " : ""}
                  {f.relatedProjects ? `projects (${f.relatedProjects.length})` : ""}
                </summary>
                <div className="mt-2 space-y-1">
                  {f.relatedContracts?.map((c) => (
                    <div key={c.id} className="flex justify-between text-xs py-1 border-b border-black/10 last:border-0 gap-3">
                      <span className={`truncate ${detailColors[f.type]}`}>{c.title}</span>
                      <span className={`shrink-0 font-semibold ${detailColors[f.type]}`}>{formatPeso(c.amount)}</span>
                    </div>
                  ))}
                  {f.relatedProjects?.map((p) => (
                    <div key={p.contractId} className="flex justify-between text-xs py-1 border-b border-black/10 last:border-0 gap-3">
                      <span className={`truncate ${detailColors[f.type]}`}>{p.description}</span>
                      <span className={`shrink-0 font-semibold ${detailColors[f.type]}`}>{formatPeso(p.budget)}</span>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Key Numbers at a Glance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {[
            ["Residents without reliable water", "250,000+"],
            ["Barangays flooded in June 2025", "22"],
            ["DPWH flood control budget (2020–2024)", formatPeso(floodBudget)],
            ["DRRF collected (2020–2024)", formatPeso(drrfTotal)],
            [`${latest.year} budget surplus (unspent)`, formatPeso(latest.income - latest.expenditure)],
            ["Water contracts awarded", formatPeso(waterContracts)],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between border-b pb-3 last:border-0 last:pb-0">
              <span className="text-muted-foreground">{label}</span>
              <span className="font-semibold">{value}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground mt-6">
        Data sources: BLGF LGU Fiscal Data, DPWH Infrastructure Dataset, PhilGEPS, DROMIC flood
        incident reports, and news reports (Inquirer, GMA, The Watchers).
      </p>
    </div>
  );
}
