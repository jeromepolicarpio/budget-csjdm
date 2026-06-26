import { Database, RefreshCw, BarChart3, FileText, HardDrive, Globe, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactTrigger } from "@/components/contact-trigger";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation | City of San Jose del Monte People's Budget Portal",
  description:
    "How the People's Budget Portal works — data sources, update frequency, data flow, tech stack, environment variables, and FAQ.",
};

const navItems = [
  { href: "#overview", label: "Overview" },
  { href: "#pages", label: "Pages" },
  { href: "#data-sources", label: "Data Sources" },
  { href: "#data-flow", label: "How Data Flows" },
  { href: "#tech-stack", label: "Tech Stack" },
  { href: "#environment-variables", label: "Environment Variables" },
  { href: "#faq", label: "FAQ" },
  { href: "#disclaimer", label: "Disclaimer" },
];

const pages = [
  {
    name: "Budget",
    description:
      "Annual income and expenditure breakdown — how much CSJDM collected and spent each year, broken down by fund and category.",
    source: "BLGF — Statement of Receipts & Expenditures",
    frequency: "Annual (manual import after BLGF publishes)",
  },
  {
    name: "Procurement",
    description:
      "All government contracts awarded by CSJDM agencies, searchable by title, supplier, and category.",
    source: "PhilGEPS via BetterGov.ph Meilisearch",
    frequency: "Hourly (live index)",
  },
  {
    name: "Projects",
    description:
      "DPWH infrastructure projects funded in CSJDM — roads, flood control, buildings, and more.",
    source: "DPWH e-IPIS via BetterGov.ph Meilisearch",
    frequency: "Hourly (live index)",
  },
  {
    name: "Accountability",
    description:
      "Cross-referencing spending data against real outcomes on the ground, sourced from public records and news reports.",
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
    icon: <FileText size={16} />,
  },
  {
    name: "PhilGEPS",
    full: "Philippine Government Electronic Procurement System",
    url: "https://philgeps.gov.ph",
    detail:
      "The official registry for all Philippine government procurement. Every contract awarded by CSJDM agencies must be posted here by law. This portal shows all contracts where the procuring entity is a CSJDM agency.",
    icon: <Database size={16} />,
  },
  {
    name: "DPWH e-IPIS",
    full: "Dept. of Public Works and Highways — Infrastructure Project Information System",
    url: "https://dpwh.gov.ph",
    detail:
      "DPWH's public tracking system for infrastructure projects. Contains project descriptions, contract amounts, location, and physical progress. Filtered to projects in San Jose del Monte, Bulacan.",
    icon: <HardDrive size={16} />,
  },
  {
    name: "BetterGov.ph",
    full: "BetterGov Open Data Platform",
    url: "https://data.bettergov.ph",
    detail:
      "An independent open-data aggregator that indexes PhilGEPS and DPWH data into a fast Meilisearch API. This portal queries BetterGov for live procurement and project data, falling back to a cached Neon database when the live API is unavailable.",
    icon: <Globe size={16} />,
  },
];

const stack: [string, string][] = [
  ["Next.js 15", "App Router with Incremental Static Regeneration (ISR)"],
  ["Neon", "Serverless Postgres — stores BLGF budget data and caches contract/project data"],
  ["Drizzle ORM", "Type-safe database queries"],
  ["BetterGov Meilisearch", "Live PhilGEPS and DPWH search index"],
  ["shadcn/ui + Tailwind CSS", "UI components and styling"],
  ["Recharts", "Budget charts"],
  ["Vercel", "Hosting, ISR cache, and scheduled cron jobs"],
];

const envVars: { name: string; required: boolean; description: string }[] = [
  {
    name: "DATABASE_URL",
    required: true,
    description: "Neon Postgres connection string. Get from console.neon.tech.",
  },
  {
    name: "CRON_SECRET",
    required: true,
    description:
      "Secret used to authenticate Vercel cron job requests. Generate with: openssl rand -hex 32",
  },
  {
    name: "BETTERGOV_MEILISEARCH_KEY",
    required: true,
    description:
      "Read-only API key for the BetterGov Meilisearch index. Get from data.bettergov.ph.",
  },
  {
    name: "BLGF_IMPORT_DATE",
    required: true,
    description:
      "Date of the last successful BLGF data import in YYYY-MM-DD format. Update after running import:blgf.",
  },
  {
    name: "RESEND_API_KEY",
    required: false,
    description:
      "Resend API key for sending contact form submissions. Get from resend.com/api-keys.",
  },
  {
    name: "CONTACT_EMAIL_TO",
    required: false,
    description: "Email address that receives contact form submissions.",
  },
];

const faqs: { q: string; a: React.ReactNode }[] = [
  {
    q: "Is this portal affiliated with the City Government of San Jose del Monte?",
    a: "No. This is an independent civic project. It is not affiliated with, endorsed by, or connected to the City Government of CSJDM, any of its offices, or any elected official.",
  },
  {
    q: "How often is the data updated?",
    a: "Procurement and infrastructure project data is refreshed hourly from BetterGov.ph. Budget (income and expenditure) data is updated annually after the BLGF publishes new data, typically mid-year for the prior fiscal year. The Accountability page is updated manually.",
  },
  {
    q: "Can I download the raw data?",
    a: (
      <>
        Budget data comes from BLGF&apos;s{" "}
        <a
          href="https://blgf.gov.ph/lgu-fiscal-data/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-foreground"
        >
          LGU Fiscal Data portal
        </a>{" "}
        where you can download the original Excel files. Procurement data is available at{" "}
        <a
          href="https://philgeps.gov.ph"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-foreground"
        >
          PhilGEPS
        </a>
        , and infrastructure project data at the DPWH website.
      </>
    ),
  },
  {
    q: "What do I do if I spot an error or outdated figure?",
    a: (
      <>
        Please <ContactTrigger />. Include the page, the figure in question, and a link to the
        correct source if you have one. Verified errors are corrected promptly.
      </>
    ),
  },
  {
    q: "Is the source code available?",
    a: (
      <>
        Yes. The portal is open-source and available on{" "}
        <a
          href="https://github.com/crispee107161/csjdm-budget"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-foreground"
        >
          GitHub
        </a>
        .
      </>
    ),
  },
];

export default function DocsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Mobile nav — horizontal scroll */}
      <nav className="lg:hidden flex gap-2 overflow-x-auto pb-4 mb-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="shrink-0 px-3 py-1.5 rounded-full border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors whitespace-nowrap"
          >
            {item.label}
          </a>
        ))}
      </nav>

      <div className="flex gap-12">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-48 shrink-0">
          <div className="sticky top-20">
            <div className="flex items-center gap-2 mb-4 text-sm font-medium">
              <BookOpen size={15} className="text-muted-foreground" />
              Documentation
            </div>
            <nav className="space-y-0.5">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="block px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-16">
          {/* Overview */}
          <section id="overview" className="scroll-mt-20">
            <h1 className="text-3xl font-bold tracking-tight mb-3">
              People&apos;s Budget Portal
            </h1>
            <p className="text-muted-foreground leading-relaxed mb-6">
              An independent civic transparency tool that makes the City of San Jose del
              Monte&apos;s public financial data — budget, contracts, and infrastructure projects —
              easy to explore in one place. All data comes from official Philippine open data
              portals and is updated automatically.
            </p>
            <div className="grid sm:grid-cols-3 gap-3 text-sm">
              <div className="border rounded-lg p-4">
                <div className="font-medium mb-1">Live URL</div>
                <a
                  href="https://budget-csjdm.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground underline underline-offset-2 hover:text-foreground break-all"
                >
                  budget-csjdm.vercel.app
                </a>
              </div>
              <div className="border rounded-lg p-4">
                <div className="font-medium mb-1">Target area</div>
                <span className="text-muted-foreground">San Jose del Monte, Bulacan</span>
              </div>
              <div className="border rounded-lg p-4">
                <div className="font-medium mb-1">License</div>
                <span className="text-muted-foreground">MIT</span>
              </div>
            </div>
          </section>

          {/* Pages */}
          <section id="pages" className="scroll-mt-20">
            <h2 className="text-xl font-semibold mb-1">Pages</h2>
            <p className="text-sm text-muted-foreground mb-5">
              What each section of the portal covers and where the data comes from.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {pages.map((p) => (
                <Card key={p.name}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{p.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p className="text-muted-foreground">{p.description}</p>
                    <div className="flex items-start gap-2 pt-1">
                      <Database size={13} className="mt-0.5 shrink-0 text-muted-foreground" />
                      <span className="text-muted-foreground">{p.source}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <RefreshCw size={13} className="mt-0.5 shrink-0 text-muted-foreground" />
                      <span className="text-muted-foreground">{p.frequency}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Data Sources */}
          <section id="data-sources" className="scroll-mt-20">
            <h2 className="text-xl font-semibold mb-1">Data Sources</h2>
            <p className="text-sm text-muted-foreground mb-5">
              All data is sourced from official Philippine government portals or independent
              aggregators that index them.
            </p>
            <div className="space-y-3">
              {sources.map((s) => (
                <div key={s.name} className="border rounded-lg p-5">
                  <div className="flex items-center gap-2 mb-2">
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

          {/* Data Flow */}
          <section id="data-flow" className="scroll-mt-20">
            <h2 className="text-xl font-semibold mb-1">How Data Flows</h2>
            <p className="text-sm text-muted-foreground mb-5">
              The portal uses two data paths depending on the data type.
            </p>
            <div className="space-y-3">
              <div className="border rounded-lg p-5">
                <div className="font-medium text-sm mb-2">Live data (Procurement & Projects)</div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Fetched from the BetterGov Meilisearch API on every page load and cached for 1
                  hour via ISR. If the live API is unavailable, the portal automatically falls back
                  to a snapshot stored in the Neon database. Cron jobs run hourly to keep the
                  cached snapshot fresh.
                </p>
              </div>
              <div className="border rounded-lg p-5">
                <div className="font-medium text-sm mb-2">Budget data (Income & Expenditures)</div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Imported manually from BLGF&apos;s annual Excel files using a{" "}
                  <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">
                    import:blgf
                  </code>{" "}
                  script that parses and upserts CSJDM rows into the Neon database. BLGF typically
                  publishes the prior fiscal year&apos;s data around mid-year. After each import,
                  update the{" "}
                  <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">
                    BLGF_IMPORT_DATE
                  </code>{" "}
                  environment variable.
                </p>
              </div>
            </div>
          </section>

          {/* Tech Stack */}
          <section id="tech-stack" className="scroll-mt-20">
            <h2 className="text-xl font-semibold mb-1">Tech Stack</h2>
            <p className="text-sm text-muted-foreground mb-5">
              Technologies used to build and run the portal.
            </p>
            <Card>
              <CardContent className="pt-5">
                <div className="space-y-3">
                  {stack.map(([name, desc]) => (
                    <div
                      key={name}
                      className="flex gap-3 text-sm border-b pb-3 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center gap-1.5 shrink-0 w-44">
                        <BarChart3 size={13} className="text-muted-foreground" />
                        <span className="font-medium">{name}</span>
                      </div>
                      <span className="text-muted-foreground">{desc}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Environment Variables */}
          <section id="environment-variables" className="scroll-mt-20">
            <h2 className="text-xl font-semibold mb-1">Environment Variables</h2>
            <p className="text-sm text-muted-foreground mb-5">
              Copy{" "}
              <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">.env.example</code>{" "}
              to{" "}
              <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">.env.local</code>{" "}
              and fill in the values below.
            </p>
            {/* Desktop: table */}
            <div className="hidden sm:block border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-4 py-3 font-medium">Variable</th>
                    <th className="text-left px-4 py-3 font-medium">Required</th>
                    <th className="text-left px-4 py-3 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {envVars.map((v, i) => (
                    <tr key={v.name} className={i < envVars.length - 1 ? "border-b" : ""}>
                      <td className="px-4 py-3 align-top">
                        <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono whitespace-nowrap">
                          {v.name}
                        </code>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <span
                          className={
                            v.required ? "text-foreground font-medium" : "text-muted-foreground"
                          }
                        >
                          {v.required ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-top text-muted-foreground leading-relaxed">
                        {v.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile: stacked cards */}
            <div className="sm:hidden space-y-3">
              {envVars.map((v) => (
                <div key={v.name} className="border rounded-lg p-4 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono break-all">
                      {v.name}
                    </code>
                    <span
                      className={`text-xs shrink-0 ${
                        v.required ? "text-foreground font-medium" : "text-muted-foreground"
                      }`}
                    >
                      {v.required ? "Required" : "Optional"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{v.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" className="scroll-mt-20">
            <h2 className="text-xl font-semibold mb-1">FAQ</h2>
            <p className="text-sm text-muted-foreground mb-5">
              Common questions about the portal.
            </p>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.q} className="border rounded-lg p-5">
                  <div className="font-medium text-sm mb-2">{faq.q}</div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <section id="disclaimer" className="scroll-mt-20">
            <h2 className="text-xl font-semibold mb-1">Disclaimer</h2>
            <p className="text-sm text-muted-foreground mb-5">Last updated: June 2026</p>
            <div className="space-y-3 text-sm">
              <div className="border rounded-lg p-5">
                <div className="font-medium mb-2">Independence</div>
                <p className="text-muted-foreground leading-relaxed">
                  This site is a citizen-built transparency tool. It is{" "}
                  <strong className="text-foreground">
                    not affiliated with, endorsed by, or connected to the City Government of San
                    Jose del Monte, Bulacan
                  </strong>
                  , any of its offices, or any elected official. It does not represent the position
                  of any government agency.
                </p>
              </div>
              <div className="border rounded-lg p-5">
                <div className="font-medium mb-2">Data Accuracy</div>
                <p className="text-muted-foreground leading-relaxed">
                  Budget figures are sourced from the{" "}
                  <a
                    href="https://blgf.gov.ph/lgu-fiscal-data/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 hover:text-foreground"
                  >
                    BLGF LGU Fiscal Data portal
                  </a>
                  . Procurement and contract data come from{" "}
                  <a
                    href="https://www.philgeps.gov.ph/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 hover:text-foreground"
                  >
                    PhilGEPS
                  </a>{" "}
                  via{" "}
                  <a
                    href="https://data.bettergov.ph"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 hover:text-foreground"
                  >
                    BetterGov.ph
                  </a>
                  . Infrastructure project data comes from the DPWH Infrastructure Transparency
                  Dataset, also via BetterGov.ph.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  While every effort is made to present data accurately, figures are reproduced from
                  public sources and may contain errors present in those original records. Computed
                  values (totals, per-capita figures, year-on-year changes) are derived
                  automatically and may not match official government summaries.{" "}
                  <strong className="text-foreground">
                    Do not use this site as a substitute for official government data when making
                    legal, financial, or policy decisions.
                  </strong>
                </p>
              </div>
              <div className="border rounded-lg p-5">
                <div className="font-medium mb-2">Accountability Report</div>
                <p className="text-muted-foreground leading-relaxed">
                  The findings on the Accountability page are based on cross-referencing public data
                  with published news reports. All narratives are sourced and linked. Estimates
                  (e.g., water tanker costs, household counts) are drawn from published reports and
                  noted as such — they are not independently audited.
                </p>
              </div>
              <div className="border rounded-lg p-5">
                <div className="font-medium mb-2">No Warranty</div>
                <p className="text-muted-foreground leading-relaxed">
                  This site is provided as-is, without any warranty of completeness, accuracy, or
                  fitness for a particular purpose. The maintainer is not liable for decisions made
                  based on data presented here.
                </p>
              </div>
            </div>
          </section>

          <div className="border-t pt-8 text-sm text-muted-foreground">
            Spotted an error or have a question? <ContactTrigger />.
          </div>
        </div>
      </div>
    </div>
  );
}
