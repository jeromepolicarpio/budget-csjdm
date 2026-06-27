export const revalidate = 3600;

import type { Metadata } from "next";
import { getBudgetYears, getDpwhProjects, getContracts } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Accountability Report | CSJDM Budget Portal",
  description: "Critical findings on CSJDM's spending priorities — water crisis funding gaps, budget allocations, and infrastructure accountability.",
  openGraph: {
    title: "Accountability Report | CSJDM Budget Portal",
    description: "Critical findings on CSJDM's spending priorities — water crisis funding gaps, budget allocations, and infrastructure accountability.",
  },
};
import { formatPeso } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { AlertTriangle, CheckCircle, XCircle, ExternalLink } from "lucide-react";
import type { Contract, DpwhProject } from "@/lib/types";

type FindingType = "critical" | "warn" | "ok";

type Source = {
  label: string;
  url: string;
};

type Finding = {
  type: FindingType;
  title: string;
  detail: string;
  sources?: Source[];
  relatedContracts?: Contract[];
  relatedProjects?: DpwhProject[];
};

export default async function AccountabilityPage() {
  const [budgetData, projects, contracts] = await Promise.all([
    getBudgetYears(),
    getDpwhProjects(),
    getContracts(),
  ]);

  if (budgetData.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Accountability Report</h1>
        <p className="text-muted-foreground">No budget data available at the moment.</p>
      </div>
    );
  }

  const latest = budgetData[budgetData.length - 1];
  const firstYear = budgetData[0].year;
  const floodBudget = projects
    .filter((p) => p.category === "Flood Control")
    .reduce((sum, p) => sum + p.budget, 0);
  const waterContracts = contracts
    .filter((c) => c.category === "Water & Utilities")
    .reduce((sum, c) => sum + c.amount, 0);
  const drrfTotal = budgetData.reduce((sum, y) => sum + y.drrf, 0);
  const sefTotal = budgetData.reduce((sum, y) => sum + y.sef, 0);

  const waterContractsList = contracts.filter((c) => c.category === "Water & Utilities");
  const floodProjectsList = projects.filter((p) => p.category === "Flood Control");
  const sportsContract = contracts.filter((c) => c.id === "20CD0147");

  const floodSince = floodProjectsList.reduce(
    (min, p) => (p.infraYear && p.infraYear < min ? p.infraYear : min),
    "9999"
  );
  const floodSinceYear = floodSince === "9999" ? "2020" : floodSince;

  const evacCenter = projects.find((p) => p.contractId === "23CD0301");
  const evacProgress = evacCenter ? evacCenter.progress : null;
  const evacDetail =
    evacProgress !== null
      ? ` The evacuation center in Brgy. San Rafael I (Contract 23CD0301) was only ${evacProgress}% complete when floods hit.`
      : "";

  const findings: Finding[] = [
    {
      type: "critical",
      title: "Water Crisis: ₱2B Capex Promised, 1% Delivered",
      detail: `PrimeWater committed a ₱2 billion capital expenditure program under its joint venture with the city water district — but utilized only 1% of it. The deal was pre-terminated in April 2025 and officially ended in November 2025. Today, 47,611 households (≈250,000 residents, nearly a third of the city) still lack reliable piped water. As a stopgap, the city spends an estimated ₱370 million every year running 22 water tankers across all 62 barangays, 24/7. Meanwhile, the water district awarded ${formatPeso(waterContracts)} in water & utility contracts throughout PrimeWater's tenure.`,
      sources: [
        { label: "Manila Times — Termination", url: "https://www.manilatimes.net/2025/11/06/regions/san-jose-del-monte-ends-primewater-deal/2216174" },
        { label: "Rappler — LGU Takes Control", url: "https://www.rappler.com/philippines/san-jose-del-monte-bulacan-takeover-water-district-primewater/" },
        { label: "PNA — Pre-termination Move", url: "https://www.pna.gov.ph/articles/1248873" },
        { label: "Inquirer — Residents' Account", url: "https://opinion.inquirer.net/191183/san-jose-del-monte-city-drowning-in-promises-residents-left-gasping-for-potable-water" },
      ],
      relatedContracts: waterContractsList,
    },
    {
      type: "critical",
      title: `Flooding Persists Despite ${formatPeso(floodBudget)} in Flood Projects`,
      detail: `DPWH has funded ${formatPeso(floodBudget)} in flood control projects in CSJDM since ${floodSinceYear}. On June 6, 2025, a single habagat event inundated 22 barangays — floodwaters rose neck-deep in Barangay San Rafael I within 45 minutes, overflowing a creek and damaging a bridge railing.${evacDetail}`,
      sources: [
        { label: "The Watchers — June 6 flooding", url: "https://watchers.news/2025/06/10/severe-flooding-san-jose-del-monte-metro-manila-philippines/" },
        { label: "GMA News", url: "https://www.gmanetwork.com/regionaltv/news/108529/heavy-floods-hit-san-jose-del-monte-bulacan/story/" },
        { label: "Manila Standard — NDRRMC", url: "https://manilastandard.net/lgu/314600289/flood-hits-13-areas-in-san-jose-del-monte-amid-heavy-rains-ndrrmc.html" },
      ],
      relatedProjects: floodProjectsList,
    },
    {
      type: "warn",
      title: `${formatPeso(drrfTotal)} in LDRRMF Collected — No Public Accounting`,
      detail: `CSJDM has collected an estimated ${formatPeso(drrfTotal)} in Local Disaster Risk Reduction and Management Funds (LDRRMF) from ${firstYear}–${latest.year}. RA 10121 mandates this be spent on disaster preparedness and mitigation. The city's Full Disclosure Policy page lists the required LDRRMF utilization report, but no COA-audited summary of how these funds were actually spent has been published publicly.`,
      sources: [
        { label: "CSJDM — LDRRMF Utilization (Full Disclosure)", url: "https://csjdm.gov.ph/full-disclosure-policy/report-of-local-disaster-risk-reduction-and-management-fund-ldrrmf-utilization/" },
        { label: "COA — LDRRMF Audit Reports", url: "https://www.coa.gov.ph/index.php/reports/citizen-participatory-audit-reports/category/6570-local-disaster-risk-reduction-and-management-fund-ldrrmf" },
      ],
    },
    {
      type: "warn",
      title: `${formatPeso(sefTotal)} in Special Education Fund — No Public Spending Breakdown`,
      detail: `CSJDM's budget data (via BLGF) shows an estimated ${formatPeso(sefTotal)} collected under the Special Education Fund (SEF) from ${firstYear}–${latest.year}. These figures reflect what the city reported as SEF income — not a direct accounting of how the fund was spent. By law, SEF must be used exclusively for public school operations and facilities in the city. However, no SEF utilization report has been published online by either the city government or SDO City of San Jose del Monte. Citizens currently have no way to verify whether the fund was spent on classrooms, teachers, or learning materials — or how much remains unspent.`,
      sources: [
        { label: "BLGF — FY2025 SEF Income & Expenditures (xlsx)", url: "https://blgf.gov.ph/wp-content/uploads/2026/06/FY2025-SEF-Income-and-Expenditures.xlsx" },
        { label: "BLGF — FY2024 SEF Income & Expenditures (xlsx)", url: "https://blgf.gov.ph/wp-content/uploads/2025/06/FY2024-SEF-Income-and-Expenditures.xlsx" },
        { label: "BLGF — LGU Fiscal Data (all years)", url: "https://blgf.gov.ph/lgu-fiscal-data/" },
        { label: "RA 5447 — Special Education Fund Act", url: "https://www.officialgazette.gov.ph/1968/09/01/republic-act-no-5447/" },
        { label: "File an FOI — DepEd via eFOI Portal", url: "https://www.foi.gov.ph/agencies/deped" },
      ],
    },
    {
      type: "warn",
      title: "Budget Surplus Every Year — But Basic Services Are Failing",
      detail: `CSJDM has posted a budget surplus every year from ${firstYear}–${latest.year} (${formatPeso(latest.income - latest.expenditure)} unspent in ${latest.year} alone). If the city consistently underspends its budget, why are water supply and flood control — both funded for years — still failing residents? Underspending on capital projects while outsourcing services that fail is a pattern worth scrutinizing.`,
      sources: [
        { label: "BLGF — LGU Fiscal Data", url: "https://blgf.gov.ph/lgu-fiscal-data/" },
      ],
    },
    {
      type: "ok",
      title: "Sports Complex Delivered On Time",
      detail: `The San Jose del Monte Sports Complex (Contract 20CD0147, ${formatPeso(14_106_670)}) was completed in 2021 as contracted. At least one project was delivered as promised.`,
      sources: [
        { label: "PhilGEPS — Award Notice", url: "https://www.philgeps.gov.ph/" },
      ],
      relatedContracts: sportsContract.length > 0 ? sportsContract : undefined,
    },
  ];

  const icons: Record<FindingType, React.ReactNode> = {
    critical: <XCircle aria-hidden="true" className="text-red-500 shrink-0 mt-0.5" size={20} />,
    warn: <AlertTriangle aria-hidden="true" className="text-amber-500 shrink-0 mt-0.5" size={20} />,
    ok: <CheckCircle aria-hidden="true" className="text-green-500 shrink-0 mt-0.5" size={20} />,
  };

  const bgColors: Record<FindingType, string> = {
    critical: "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30",
    warn: "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30",
    ok: "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30",
  };

  const textColors: Record<FindingType, string> = {
    critical: "text-red-900 dark:text-red-200",
    warn: "text-amber-900 dark:text-amber-200",
    ok: "text-green-900 dark:text-green-200",
  };

  const detailColors: Record<FindingType, string> = {
    critical: "text-red-800 dark:text-red-300",
    warn: "text-amber-800 dark:text-amber-300",
    ok: "text-green-800 dark:text-green-300",
  };

  const sourceColors: Record<FindingType, string> = {
    critical: "text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200",
    warn: "text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200",
    ok: "text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200",
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Accountability Report</h1>
        <p className="text-muted-foreground">
          Cross-referencing CSJDM budget data, DPWH projects, and PhilGEPS contracts against what
          residents are actually experiencing on the ground. All findings are sourced and linkable.
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
                <p className="text-xs sm:text-sm text-muted-foreground">{labels[type]}</p>
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

                {f.sources && f.sources.length > 0 && (
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3">
                    <span className={`text-xs font-medium ${detailColors[f.type]}`}>Sources:</span>
                    {f.sources.map((s) => (
                      <a
                        key={s.url}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-xs inline-flex items-center gap-0.5 underline underline-offset-2 ${sourceColors[f.type]}`}
                      >
                        {s.label}
                        <ExternalLink size={10} />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {(f.relatedContracts || f.relatedProjects) && (
              <details className="mt-3 ml-8">
                <summary className={`text-xs font-medium cursor-pointer select-none underline underline-offset-2 ${detailColors[f.type]}`}>
                  Show related {f.relatedContracts ? `contracts (${f.relatedContracts.length})` : ""}
                  {f.relatedContracts && f.relatedProjects ? " & " : ""}
                  {f.relatedProjects ? `projects (${f.relatedProjects.length})` : ""}
                </summary>
                <div className="mt-2 space-y-1">
                  {f.relatedContracts?.map((c) => (
                    <Link
                      key={c.id}
                      href={`/procurement/${encodeURIComponent(c.id)}/source`}
                      className="flex justify-between text-xs py-1 border-b border-black/10 dark:border-white/10 last:border-0 gap-3 hover:opacity-70 transition-opacity"
                    >
                      <span className={`min-w-0 truncate underline underline-offset-2 inline-flex items-center gap-0.5 ${detailColors[f.type]}`}>
                        {c.title}
                        <ExternalLink size={9} className="shrink-0" />
                      </span>
                      <span className={`shrink-0 font-semibold ${detailColors[f.type]}`}>{formatPeso(c.amount)}</span>
                    </Link>
                  ))}
                  {f.relatedProjects?.map((p) => (
                    <Link
                      key={p.contractId}
                      href={`/projects/${encodeURIComponent(p.contractId)}/source`}
                      className="flex justify-between text-xs py-1 border-b border-black/10 dark:border-white/10 last:border-0 gap-3 hover:opacity-70 transition-opacity"
                    >
                      <span className={`min-w-0 truncate underline underline-offset-2 inline-flex items-center gap-0.5 ${detailColors[f.type]}`}>
                        {p.description}
                        <ExternalLink size={9} className="shrink-0" />
                      </span>
                      <span className={`shrink-0 font-semibold ${detailColors[f.type]}`}>{formatPeso(p.budget)}</span>
                    </Link>
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
            ["Residents without reliable piped water", "≈250,000 (47,611 households)"],
            ["City's annual water tanker cost (stopgap)", "≈₱370,000,000"],
            ["Barangays flooded — June 6, 2025", "22"],
            [`DPWH flood control budget (since ${floodSinceYear})`, formatPeso(floodBudget)],
            [`LDRRMF collected (${firstYear}–${latest.year})`, formatPeso(drrfTotal)],
            [`SEF collected (${firstYear}–${latest.year}, est.)`, formatPeso(sefTotal)],
            [`${latest.year} budget surplus (unspent)`, formatPeso(latest.income - latest.expenditure)],
            ["Water & utility contracts awarded", formatPeso(waterContracts)],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between border-b pb-3 last:border-0 last:pb-0">
              <span className="text-muted-foreground">{label}</span>
              <span className="font-semibold text-right">{value}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground mt-6">
        Data sources: BLGF LGU Fiscal Data, DPWH Infrastructure Dataset, PhilGEPS, NDRRMC/DROMIC
        incident reports, and news reports (Manila Times, Rappler, GMA News, The Watchers, Inquirer, PNA).
        Numbers are computed from live database records; narratives are sourced and linked above.
      </p>
      <p className="text-xs text-muted-foreground mt-2">
        Findings last reviewed: <time dateTime="2026-06">June 2026</time>. Budget and contract
        figures update automatically from live data. Narrative details (water crisis status, flood
        event dates, tanker cost estimates) reflect published reports as of that date — verify
        primary sources linked above for the latest developments.
      </p>
    </div>
  );
}
