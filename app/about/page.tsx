import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, RefreshCw, BarChart3, FileText, HardDrive, Globe } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | City of San Jose del Monte People's Budget Portal",
  description:
    "How the People's Budget Portal works — data sources, update frequency, methodology, and tech stack.",
};

const pages = [
  {
    name: "Budget",
    description: "Annual income and expenditure breakdown — how much CSJDM collected and spent each year.",
    source: "BLGF — Statement of Receipts & Expenditures",
    frequency: "Annual (manual import after BLGF publishes)",
  },
  {
    name: "Procurement",
    description: "All government contracts awarded by CSJDM, searchable by title, supplier, and category.",
    source: "PhilGEPS via BetterGov.ph Meilisearch",
    frequency: "Hourly (live index)",
  },
  {
    name: "Projects",
    description: "DPWH infrastructure projects funded in CSJDM — roads, flood control, buildings, and more.",
    source: "DPWH e-IPIS via BetterGov.ph Meilisearch",
    frequency: "Hourly (live index)",
  },
  {
    name: "Accountability",
    description: "Cross-referencing spending data against real outcomes on the ground.",
    source: "BLGF, DPWH, PhilGEPS, and news reports",
    frequency: "Updated manually as new data is available",
  },
];

const sources = [
  {
    name: "BLGF",
    full: "Bureau of Local Government Finance",
    url: "https://blgf.gov.ph",
    detail:
      "The national agency that collects and publishes LGU fiscal data. Annual Statement of Receipts & Expenditures (SRE) covers income, expenditures, Special Education Fund (SEF), and Local Disaster Risk Reduction and Management Fund (LDRRMF).",
    icon: <FileText size={18} />,
  },
  {
    name: "PhilGEPS",
    full: "Philippine Government Electronic Procurement System",
    url: "https://philgeps.gov.ph",
    detail:
      "The official registry for all Philippine government procurement. Every contract awarded by CSJDM agencies must be posted here by law. This portal shows all contracts where the procuring entity is a CSJDM agency.",
    icon: <Database size={18} />,
  },
  {
    name: "DPWH e-IPIS",
    full: "Dept. of Public Works and Highways — Infrastructure Project Information System",
    url: "https://dpwh.gov.ph",
    detail:
      "DPWH's public tracking system for infrastructure projects. Contains project descriptions, contract amounts, location, and physical progress. Filtered to projects in San Jose del Monte, Bulacan.",
    icon: <HardDrive size={18} />,
  },
  {
    name: "BetterGov.ph",
    full: "BetterGov Open Data Platform",
    url: "https://data.bettergov.ph",
    detail:
      "An independent open-data aggregator that indexes PhilGEPS and DPWH data into a fast Meilisearch API. This portal queries BetterGov for live procurement and project data, falling back to a cached Neon database when the live API is unavailable.",
    icon: <Globe size={18} />,
  },
];

const stack = [
  ["Next.js 15", "App Router with Incremental Static Regeneration (ISR)"],
  ["Neon", "Serverless Postgres — stores BLGF budget data and caches contract/project data"],
  ["Drizzle ORM", "Type-safe database queries"],
  ["BetterGov Meilisearch", "Live PhilGEPS and DPWH search index"],
  ["shadcn/ui + Tailwind CSS", "UI components and styling"],
  ["Recharts", "Budget charts"],
  ["Vercel", "Hosting, ISR cache, and scheduled cron jobs"],
];

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-3">About This Portal</h1>
        <p className="text-muted-foreground leading-relaxed max-w-2xl">
          The People&apos;s Budget Portal is a civic transparency project that makes the City of San
          Jose del Monte&apos;s public financial data — budget, contracts, and infrastructure
          projects — easy to explore in one place. All data comes from official Philippine open data
          portals. This site is not affiliated with the City Government of CSJDM.
        </p>
      </div>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">What&apos;s on Each Page</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {pages.map((p) => (
            <Card key={p.name}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{p.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-muted-foreground">{p.description}</p>
                <div className="flex items-start gap-2 pt-1">
                  <Database size={14} className="mt-0.5 shrink-0 text-muted-foreground" />
                  <span className="text-muted-foreground">{p.source}</span>
                </div>
                <div className="flex items-start gap-2">
                  <RefreshCw size={14} className="mt-0.5 shrink-0 text-muted-foreground" />
                  <span className="text-muted-foreground">{p.frequency}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Data Sources</h2>
        <div className="space-y-4">
          {sources.map((s) => (
            <div key={s.name} className="border rounded-lg p-5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-muted-foreground">{s.icon}</span>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold hover:underline"
                >
                  {s.name}
                </a>
                <span className="text-sm text-muted-foreground">— {s.full}</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed ml-6">{s.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">How Data Flows</h2>
        <Card>
          <CardContent className="pt-5 text-sm text-muted-foreground space-y-3 leading-relaxed">
            <p>
              Live procurement and project data is fetched from the BetterGov Meilisearch API on
              every page load (cached for 1 hour via ISR). If the live API is unavailable, the
              portal falls back to a snapshot stored in the Neon database.
            </p>
            <p>
              Budget data (income, expenditures, SEF, LDRRMF) is imported manually from BLGF&apos;s
              annual Excel files using a script that parses and upserts CSJDM rows into Neon. BLGF
              typically publishes the prior fiscal year&apos;s data around mid-year.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Tech Stack</h2>
        <Card>
          <CardContent className="pt-5">
            <div className="space-y-3">
              {stack.map(([name, desc]) => (
                <div key={name} className="flex gap-3 text-sm border-b pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-1.5 shrink-0 w-44">
                    <BarChart3 size={14} className="text-muted-foreground" />
                    <span className="font-medium">{name}</span>
                  </div>
                  <span className="text-muted-foreground">{desc}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <div className="border rounded-lg p-5 bg-muted/50 text-sm text-muted-foreground leading-relaxed">
        <p className="font-medium text-foreground mb-1">Disclaimer</p>
        <p>
          This portal is an independent civic project. It is not affiliated with, endorsed by, or
          operated by the City Government of San Jose del Monte or any Philippine government agency.
          Data is reproduced from public government sources as-is. If you spot an error or outdated
          figure, use the contact link in the footer.
        </p>
      </div>
    </div>
  );
}
