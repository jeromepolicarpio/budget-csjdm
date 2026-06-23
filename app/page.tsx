export const revalidate = 3600;

import { getBudgetYears, getDpwhProjects, getContracts } from "@/lib/queries";
import { formatPeso } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, AlertTriangle, TrendingUp, Building2, FileText, Check } from "lucide-react";
import { ContactTrigger } from "@/components/contact-trigger";

const BUDGET_STEPS = [
  { label: "Executive Prepared", sub: "LGU Budget Office", done: true, active: false },
  { label: "Council Review", sub: "Sanggunian Panlungsod", done: true, active: false },
  { label: "Budget Enacted", sub: "Resolution passed", done: true, active: false },
  { label: "In Effect", sub: "Active (CY 2024)", done: false, active: true },
];

export default async function HomePage() {
  const [budgetData, projects, contracts] = await Promise.all([
    getBudgetYears(),
    getDpwhProjects(),
    getContracts(),
  ]);

  const latest = budgetData[budgetData.length - 1];
  const totalDpwhBudget = projects.reduce((sum, p) => sum + p.budget, 0);
  const ongoingProjects = projects.filter((p) => p.status === "On-going").length;
  const activeContracts = contracts.filter((c) => c.status === "Active").length;
  // PSA 2020 Census population for CSJDM
  const POPULATION = 651_816;
  const perCapitaExpenditure = Math.round(latest.expenditure / POPULATION);

  return (
    <div>
      {/* Hero */}
      <section className="border-b bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-3xl mx-auto px-4 pt-16 pb-14 flex flex-col items-center text-center">
          <Image
            src="/San-Jose-del-Monte-Official-Seal.png"
            alt="City of San Jose del Monte Official Seal"
            width={72}
            height={72}
            className="rounded-full mb-6"
            priority
          />
          <Badge variant="outline" className="mb-5 border-primary/30 text-primary bg-primary/5">
            San Jose del Monte, Bulacan · Citizen-Built · Open Data
          </Badge>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-3 leading-tight text-balance">
            People&apos;s <span className="text-primary">Budget Portal</span>
          </h1>
          <p className="text-base font-semibold text-primary/90 mb-8">Saan napunta ang pera ng bayan?</p>

          <dl className="w-full flex flex-col sm:flex-row items-center justify-center divide-y sm:divide-y-0 sm:divide-x border rounded-xl overflow-hidden bg-background">
            <div className="flex-1 px-6 py-5 text-center">
              <dd className="text-2xl font-bold tracking-tight">{formatPeso(latest.income)}</dd>
              <dt className="text-xs text-muted-foreground mt-1">{latest.year} City Income</dt>
            </div>
            <div className="flex-1 px-6 py-5 text-center">
              <dd className="text-2xl font-bold tracking-tight">{formatPeso(latest.expenditure)}</dd>
              <dt className="text-xs text-muted-foreground mt-1">{latest.year} Expenditure</dt>
            </div>
            <div className="flex-1 px-6 py-5 text-center">
              <dd className="text-2xl font-bold tracking-tight">{formatPeso(totalDpwhBudget)}</dd>
              <dt className="text-xs text-muted-foreground mt-1">{projects.length} DPWH Projects</dt>
            </div>
            <div className="flex-1 px-6 py-5 text-center">
              <dd className="text-2xl font-bold tracking-tight">{formatPeso(latest.drrf)}</dd>
              <dt className="text-xs text-muted-foreground mt-1">Disaster Risk Reduction Fund (DRRF)</dt>
            </div>
            <div className="flex-1 px-6 py-5 text-center">
              <dd className="text-2xl font-bold tracking-tight">₱{perCapitaExpenditure.toLocaleString()}</dd>
              <dt className="text-xs text-muted-foreground mt-1">Per Capita (2020 census)</dt>
            </div>
          </dl>
          <p className="text-xs text-muted-foreground mt-3">
            Budget data as of {latest.year} · DPWH data refreshed periodically via BetterGov.ph
          </p>
        </div>
      </section>

      {/* Budget process timeline */}
      <section className="border-b bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 py-7">
          <p className="text-sm font-medium text-muted-foreground mb-4">
            {latest.year} Budget Process
          </p>
          {/* Mobile: 2×2 grid */}
          <div className="sm:hidden grid grid-cols-2 gap-2">
            {BUDGET_STEPS.map((step) => (
              <div
                key={step.label}
                className="flex items-center gap-2.5 p-3 rounded-lg bg-background border"
                {...(step.active ? { "aria-current": "step" } : {})}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                  step.active
                    ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                    : step.done
                    ? "bg-primary/20 text-primary"
                    : "bg-muted border-2 border-border"
                }`}>
                  {(step.done || step.active) && (
                    <Check size={13} className={step.active ? "text-primary-foreground" : "text-primary"} />
                  )}
                </div>
                <div className="min-w-0">
                  <p className={`text-xs font-semibold leading-tight ${
                    step.active ? "text-primary" : step.done ? "text-foreground" : "text-muted-foreground"
                  }`}>
                    {step.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{step.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: horizontal timeline */}
          <div className="hidden sm:flex items-center py-2">
            {BUDGET_STEPS.map((step, i) => (
              <div key={step.label} className="flex items-center min-w-0 flex-1 last:flex-none" {...(step.active ? { "aria-current": "step" } : {})}>
                <div className="flex flex-col items-center text-center min-w-[110px]">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center mb-2 shrink-0 ${
                    step.active
                      ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                      : step.done
                      ? "bg-primary/20 text-primary"
                      : "bg-muted border-2 border-border"
                  }`}>
                    {(step.done || step.active) && (
                      <Check size={13} className={step.active ? "text-primary-foreground" : "text-primary"} />
                    )}
                  </div>
                  <p className={`text-xs font-semibold leading-tight ${
                    step.active ? "text-primary" : step.done ? "text-foreground" : "text-muted-foreground"
                  }`}>
                    {step.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{step.sub}</p>
                </div>
                {i < BUDGET_STEPS.length - 1 && (
                  <div className={`flex-1 h-px mx-2 mb-7 ${step.done ? "bg-primary/30" : "bg-border"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Alert banner */}
        <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
          <AlertTriangle aria-hidden="true" className="text-amber-500 shrink-0 mt-0.5" size={18} />
          <div>
            <p className="font-medium text-amber-900 text-sm">Active Water Crisis</p>
            <p className="text-amber-800 text-sm mt-0.5">
              250,000 CSJDM residents are without reliable water supply after PrimeWater&apos;s contract
              was terminated. The city allocated {formatPeso(latest.expenditure)} in {latest.year} — see
              how much went to water infrastructure.{" "}
              <Link href="/accountability" className="underline font-medium">
                View accountability report →
              </Link>
            </p>
          </div>
        </div>

        {/* Nav cards */}
        <div className="mt-10 grid md:grid-cols-3 gap-4">
          <Link href="/budget">
            <Card className="hover:border-primary/40 transition-colors cursor-pointer h-full group">
              <CardContent className="p-6 flex gap-4 items-start">
                <div className="bg-primary/10 rounded-lg p-2.5 shrink-0 group-hover:bg-primary/20 transition-colors">
                  <TrendingUp size={20} className="text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold mb-0.5">Budget Dashboard</h2>
                  <p className="text-xs text-primary/70 font-medium mb-1">Kita at Gastos ng Lungsod</p>
                  <p className="text-sm text-muted-foreground">
                    Annual income vs. expenditure from 2020–{latest.year}. See how much goes to
                    education, disaster preparedness, and public services.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">Includes SEF (education fund), DRRF (disaster fund), year-on-year trends</p>
                  <span className="inline-flex items-center gap-1 text-sm font-medium mt-3 text-primary">
                    View budget <ArrowRight size={14} />
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/procurement">
            <Card className="hover:border-primary/40 transition-colors cursor-pointer h-full group">
              <CardContent className="p-6 flex gap-4 items-start">
                <div className="bg-primary/10 rounded-lg p-2.5 shrink-0 group-hover:bg-primary/20 transition-colors">
                  <FileText size={20} className="text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold mb-0.5">Procurement & Contracts</h2>
                  <p className="text-xs text-primary/70 font-medium mb-1">Sino ang Binigyan ng Kontrata?</p>
                  <p className="text-sm text-muted-foreground">
                    {activeContracts} active contracts tracked via PhilGEPS. Who got the contracts, and what for?
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">Includes supplier names, award amounts, and contract categories</p>
                  <span className="inline-flex items-center gap-1 text-sm font-medium mt-3 text-primary">
                    View contracts <ArrowRight size={14} />
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/projects">
            <Card className="hover:border-primary/40 transition-colors cursor-pointer h-full group">
              <CardContent className="p-6 flex gap-4 items-start">
                <div className="bg-primary/10 rounded-lg p-2.5 shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Building2 size={20} className="text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold mb-0.5">DPWH Infrastructure Projects</h2>
                  <p className="text-xs text-primary/70 font-medium mb-1">Mga Proyektong Imprastraktura</p>
                  <p className="text-sm text-muted-foreground">
                    {ongoingProjects} projects ongoing in CSJDM. Track progress, contractors, and
                    whether they were delivered on time.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">Includes flood control, roads, bridges — filterable by barangay</p>
                  <span className="inline-flex items-center gap-1 text-sm font-medium mt-3 text-primary">
                    View projects <ArrowRight size={14} />
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/accountability" className="md:col-span-3">
            <Card className="hover:border-amber-300 transition-colors cursor-pointer h-full border-amber-200">
              <CardContent className="p-6 flex flex-col sm:flex-row gap-4 items-start">
                <div className="bg-amber-50 rounded-lg p-2.5 shrink-0">
                  <AlertTriangle size={20} className="text-amber-600" />
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold mb-0.5">Accountability Report</h2>
                  <p className="text-xs text-amber-600/80 font-medium mb-1">Ulat ng Pananagutan</p>
                  <p className="text-sm text-muted-foreground max-w-2xl">
                    Budget spent on flood control vs. areas still flooding. Water contracts vs. the
                    ongoing water crisis. The gap between spending and reality.
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm font-medium mt-3 text-amber-600">
                    View report <ArrowRight size={14} />
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* About this site */}
        <div className="mt-10 bg-muted/50 border rounded-lg p-5">
          <h2 className="font-semibold text-sm mb-1">About this site</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This is a citizen-built transparency tool. It is{" "}
            <strong>not affiliated with the City Government of San Jose del Monte</strong>. Data
            comes from public sources: BLGF (Bureau of Local Government Finance, budget),
            DPWH (Department of Public Works and Highways, infrastructure), and PhilGEPS
            (Philippine Government Electronic Procurement System, contracts) via{" "}
            <a
              href="https://data.bettergov.ph"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              BetterGov.ph
            </a>
            . If you spot an error or have new data,{" "}
            <ContactTrigger />
            .
          </p>
        </div>
      </div>
    </div>
  );
}
