export const revalidate = 3600;

import { getDpwhProjects } from "@/lib/queries";
import { formatPeso } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const STATUS_COLORS: Record<string, string> = {
  Completed: "bg-green-100 text-green-800",
  "On-going": "bg-blue-100 text-blue-800",
  Suspended: "bg-red-100 text-red-800",
  Terminated: "bg-red-100 text-red-800",
};

export default async function ProjectsPage() {
  const projects = await getDpwhProjects();

  const total = projects.reduce((sum, p) => sum + p.budget, 0);
  const ongoing = projects.filter((p) => p.status === "On-going");
  const completed = projects.filter((p) => p.status === "Completed");
  const floodProjects = projects.filter((p) => p.category === "Flood Control");

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight mb-1">DPWH Infrastructure Projects</h1>
      <p className="text-muted-foreground mb-8">
        Department of Public Works and Highways projects in City of San Jose del Monte, Bulacan.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <Card>
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Total Budget</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-2xl font-bold">{formatPeso(total)}</p>
            <p className="text-xs text-muted-foreground">{projects.length} projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wide">On-going</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-2xl font-bold">{ongoing.length}</p>
            <p className="text-xs text-muted-foreground">{formatPeso(ongoing.reduce((s, p) => s + p.budget, 0))}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Completed</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-2xl font-bold">{completed.length}</p>
            <p className="text-xs text-muted-foreground">{formatPeso(completed.reduce((s, p) => s + p.budget, 0))}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Flood Control</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-2xl font-bold">{floodProjects.length} projects</p>
            <p className="text-xs text-muted-foreground">{formatPeso(floodProjects.reduce((s, p) => s + p.budget, 0))}</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {projects.map((p) => (
          <div key={p.contractId} className="border rounded-lg p-5">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1">
                <p className="font-medium leading-snug">{p.description}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Contract ID: {p.contractId} · {p.infraYear} · {p.sourceOfFunds}
                </p>
              </div>
              <span className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[p.status] ?? "bg-muted text-muted-foreground"}`}>
                {p.status}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-4">
              <div>
                <p className="text-xs text-muted-foreground">Budget</p>
                <p className="font-semibold">{formatPeso(p.budget)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Amount Paid</p>
                <p className="font-semibold">{formatPeso(p.amountPaid)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Contractor</p>
                <p className="font-medium truncate">{p.contractor}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Category</p>
                <p className="font-medium">{p.category}</p>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Progress</span>
                <span>{p.progress}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${p.progress === 100 ? "bg-green-500" : "bg-primary"}`}
                  style={{ width: `${p.progress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Started: {p.startDate}</span>
                <span>Target: {p.completionDate}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground mt-6">
        Source: DPWH Infrastructure Transparency Dataset via{" "}
        <a href="https://data.bettergov.ph/datasets/19" target="_blank" rel="noopener noreferrer" className="underline">
          BetterGov.ph Dataset #19
        </a>
        . Run <code className="bg-muted px-1 rounded">npx tsx scripts/scrape-dpwh.ts</code> to refresh.
      </p>
    </div>
  );
}
