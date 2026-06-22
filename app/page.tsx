export const revalidate = 3600;

import { getBudgetYears, getDpwhProjects, getContracts } from "@/lib/queries";
import { formatPeso } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowRight, AlertTriangle, TrendingUp, Building2, FileText, Check } from "lucide-react";

const BUDGET_STEPS = [
  { label: "Executive Prepared", sub: "LGU Budget Office", done: true, active: false },
  { label: "Council Review", sub: "Sanggunian Panlungsod", done: true, active: false },
  { label: "Budget Enacted", sub: "Resolution passed", done: true, active: false },
  { label: "Executing", sub: "CY 2024", done: false, active: true },
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

  return (
    <div>
      {/* Hero */}
      <section className="border-b bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-6xl mx-auto px-4 pt-14 pb-12">
          <Badge variant="outline" className="mb-5 border-primary/30 text-primary bg-primary/5">
            San Jose del Monte, Bulacan · Citizen-Built · Open Data
          </Badge>
          <h1 className="text-5xl font-bold tracking-tight mb-4 leading-tight">
            <span className="block">City of San Jose del Monte</span>
            <span className="block text-primary">People&apos;s Budget Portal</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mb-10">
            Track how CSJDM spends your taxes — budget, contracts, and infrastructure.
            Powered by public data from BLGF, PhilGEPS, and DPWH. No spin. Just numbers.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-primary/20">
              <CardHeader className="pb-1 pt-4 px-4">
                <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  {latest.year} City Income
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <p className="text-3xl font-bold tracking-tight">{formatPeso(latest.income)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-1 pt-4 px-4">
                <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  {latest.year} Expenditure
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <p className="text-3xl font-bold tracking-tight">{formatPeso(latest.expenditure)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-1 pt-4 px-4">
                <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  DPWH Projects
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <p className="text-3xl font-bold tracking-tight">{formatPeso(totalDpwhBudget)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{projects.length} tracked</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-1 pt-4 px-4">
                <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  Disaster Fund (DRRF)
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <p className="text-3xl font-bold tracking-tight">{formatPeso(latest.drrf)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{latest.year} allocation</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Budget process timeline */}
      <section className="border-b bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 py-5">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-4">
            {latest.year} Budget Process
          </p>
          <div className="flex items-center overflow-x-auto">
            {BUDGET_STEPS.map((step, i) => (
              <div key={step.label} className="flex items-center min-w-0 flex-1 last:flex-none">
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

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Alert banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
          <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={18} />
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
        <div className="grid md:grid-cols-2 gap-4">
          <Link href="/budget">
            <Card className="hover:border-primary/40 transition-colors cursor-pointer h-full group">
              <CardContent className="p-6 flex gap-4 items-start">
                <div className="bg-primary/10 rounded-lg p-2.5 shrink-0 group-hover:bg-primary/20 transition-colors">
                  <TrendingUp size={20} className="text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold mb-1">Budget Dashboard</h2>
                  <p className="text-sm text-muted-foreground">
                    Annual income vs. expenditure from 2020–{latest.year}. See how much goes to
                    education, disaster preparedness, and public services.
                  </p>
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
                  <h2 className="font-semibold mb-1">Procurement & Contracts</h2>
                  <p className="text-sm text-muted-foreground">
                    {activeContracts} active contracts tracked via PhilGEPS. Who got the money and for
                    what?
                  </p>
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
                  <h2 className="font-semibold mb-1">DPWH Infrastructure Projects</h2>
                  <p className="text-sm text-muted-foreground">
                    {ongoingProjects} projects ongoing in CSJDM. Track progress, contractors, and
                    whether they were delivered on time.
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm font-medium mt-3 text-primary">
                    View projects <ArrowRight size={14} />
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/accountability">
            <Card className="hover:border-amber-300 transition-colors cursor-pointer h-full border-amber-200">
              <CardContent className="p-6 flex gap-4 items-start">
                <div className="bg-amber-50 rounded-lg p-2.5 shrink-0">
                  <AlertTriangle size={20} className="text-amber-600" />
                </div>
                <div>
                  <h2 className="font-semibold mb-1">Accountability Report</h2>
                  <p className="text-sm text-muted-foreground">
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
      </div>
    </div>
  );
}
