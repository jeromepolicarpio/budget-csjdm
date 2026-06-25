export const revalidate = 3600;

import { getDpwhProjects } from "@/lib/queries";
import { formatPeso } from "@/lib/data";
import { aggregateByBarangay } from "@/lib/barangay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ProjectsList } from "./projects-list";

export default async function ProjectsPage() {
  const projects = await getDpwhProjects();

  const total = projects.reduce((sum, p) => sum + p.budget, 0);
  const ongoing = projects.filter((p) => p.status === "On-going");
  const completed = projects.filter((p) => p.status === "Completed");
  const floodProjects = projects.filter((p) => p.category === "Flood Control");
  const byBarangay = aggregateByBarangay(projects).slice(0, 15);

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

      {byBarangay.length > 0 && (
        <>
          <Separator className="my-8" />
          <h2 className="text-xl font-semibold mb-1">Infrastructure by Barangay</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Top barangays by total DPWH project budget — extracted from project descriptions.
          </p>
          <div className="overflow-x-auto rounded-lg border mb-8">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground w-8">#</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Barangay</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Projects</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Total Budget</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Share</th>
                </tr>
              </thead>
              <tbody>
                {byBarangay.map((row, i) => {
                  const pct = total > 0 ? (row.totalBudget / total) * 100 : 0;
                  return (
                    <tr key={row.name} className="border-t hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                      <td className="px-4 py-3 font-medium">Brgy. {row.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{row.projectCount}</td>
                      <td className="px-4 py-3">{formatPeso(row.totalBudget)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-muted rounded-full h-1.5 overflow-hidden">
                            {/* 5× amplification so small percentages remain visible */}
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${Math.min(pct * 5, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{pct.toFixed(1)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      <ProjectsList projects={projects} />

      <p className="text-xs text-muted-foreground mt-6">
        Source: DPWH Infrastructure Transparency Dataset via{" "}
        <a
          href="https://data.bettergov.ph/datasets/19"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-foreground transition-colors"
        >
          BetterGov.ph Dataset #19
        </a>
        . Click any contract ID to view its source details and verification steps.
      </p>
    </div>
  );
}
