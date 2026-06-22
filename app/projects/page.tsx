export const revalidate = 3600;

import { getDpwhProjects } from "@/lib/queries";
import { formatPeso } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectsList } from "./projects-list";

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

      <ProjectsList projects={projects} />

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
