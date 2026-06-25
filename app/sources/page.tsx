import { ExternalLink, FileText, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SourceType = "web" | "pdf";

type Source = {
  id: string;
  type: SourceType;
  apa: string;
  url: string;
  description?: string;
  relatedFinding?: string;
};

type SourceGroup = {
  category: string;
  description: string;
  sources: Source[];
};

const sourceGroups: SourceGroup[] = [
  {
    category: "News & Media Reports",
    description: "Investigative and news articles used to corroborate findings in the Accountability Report.",
    sources: [
      {
        id: "manilatimes-primewater",
        type: "web",
        apa: "Manila Times. (2025, November 6). San Jose del Monte ends PrimeWater deal. <em>Manila Times</em>.",
        url: "https://www.manilatimes.net/2025/11/06/regions/san-jose-del-monte-ends-primewater-deal/2216174",
        relatedFinding: "Water Crisis",
        description: "Reports the official termination of the PrimeWater joint venture agreement with the city water district in November 2025.",
      },
      {
        id: "rappler-lgu-takeover",
        type: "web",
        apa: "Rappler. (2025). San Jose del Monte, Bulacan takes over water district from PrimeWater. <em>Rappler</em>.",
        url: "https://www.rappler.com/philippines/san-jose-del-monte-bulacan-takeover-water-district-primewater/",
        relatedFinding: "Water Crisis",
        description: "Details the LGU's decision to take back control of the city water district after PrimeWater's failure to deliver on its commitments.",
      },
      {
        id: "pna-pretermination",
        type: "web",
        apa: "Philippine News Agency. (2025). SJDM pre-terminates PrimeWater deal. <em>PNA</em>.",
        url: "https://www.pna.gov.ph/articles/1248873",
        relatedFinding: "Water Crisis",
        description: "State news agency report on the April 2025 pre-termination move before the deal officially ended.",
      },
      {
        id: "inquirer-water-residents",
        type: "web",
        apa: "Inquirer Opinion. (2025). San Jose del Monte City: Drowning in promises, residents left gasping for potable water. <em>Philippine Daily Inquirer</em>.",
        url: "https://opinion.inquirer.net/191183/san-jose-del-monte-city-drowning-in-promises-residents-left-gasping-for-potable-water",
        relatedFinding: "Water Crisis",
        description: "Residents' firsthand accounts of the water crisis, including reliance on water tankers and the gap between the ₱2B capex promise and actual delivery.",
      },
      {
        id: "watchers-june6-flood",
        type: "web",
        apa: "The Watchers. (2025, June 10). Severe flooding in San Jose del Monte, Philippines. <em>The Watchers</em>.",
        url: "https://watchers.news/2025/06/10/severe-flooding-san-jose-del-monte-metro-manila-philippines/",
        relatedFinding: "Persistent Flooding",
        description: "International disaster tracking outlet's report on the June 6, 2025 habagat event that inundated 22 barangays.",
      },
      {
        id: "gma-floods",
        type: "web",
        apa: "GMA Regional TV. (2025). Heavy floods hit San Jose del Monte, Bulacan. <em>GMA Network</em>.",
        url: "https://www.gmanetwork.com/regionaltv/news/108529/heavy-floods-hit-san-jose-del-monte-bulacan/story/",
        relatedFinding: "Persistent Flooding",
        description: "Local broadcast news coverage of the June 2025 flooding event.",
      },
      {
        id: "manila-standard-ndrrmc",
        type: "web",
        apa: "Manila Standard. (2025). Flood hits 13 areas in San Jose del Monte amid heavy rains — NDRRMC. <em>Manila Standard</em>.",
        url: "https://manilastandard.net/lgu/314600289/flood-hits-13-areas-in-san-jose-del-monte-amid-heavy-rains-ndrrmc.html",
        relatedFinding: "Persistent Flooding",
        description: "NDRRMC situational report coverage on the extent of June 2025 flooding in CSJDM.",
      },
    ],
  },
  {
    category: "Government Data & Official Records",
    description: "Primary sources from government agencies — fiscal data, audit reports, and full disclosure documents.",
    sources: [
      {
        id: "blgf-fiscal",
        type: "web",
        apa: "Bureau of Local Government Finance. (n.d.). <em>LGU fiscal data</em> [Data set]. Department of Finance, Republic of the Philippines.",
        url: "https://blgf.gov.ph/lgu-fiscal-data/",
        relatedFinding: "Budget Surplus / LDRRMF",
        description: "Annual income, expenditure, and fiscal position data for all LGUs in the Philippines. Primary source for CSJDM's budget surplus figures.",
      },
      {
        id: "csjdm-ldrrmf",
        type: "web",
        apa: "City Government of San Jose del Monte. (n.d.). <em>Report on LDRRMF utilization</em> [Full disclosure policy document]. CSJDM Official Website.",
        url: "https://csjdm.gov.ph/full-disclosure-policy/report-of-local-disaster-risk-reduction-and-management-fund-ldrrmf-utilization/",
        relatedFinding: "LDRRMF Accountability",
        description: "The city's mandatory full disclosure policy page for the Local Disaster Risk Reduction and Management Fund (LDRRMF) utilization. RA 10121 requires this report to be publicly accessible.",
      },
      {
        id: "coa-ldrrmf",
        type: "web",
        apa: "Commission on Audit. (n.d.). <em>Local disaster risk reduction and management fund (LDRRMF) citizen participatory audit reports</em>. COA, Republic of the Philippines.",
        url: "https://www.coa.gov.ph/index.php/reports/citizen-participatory-audit-reports/category/6570-local-disaster-risk-reduction-and-management-fund-ldrrmf",
        relatedFinding: "LDRRMF Accountability",
        description: "COA's citizen participatory audit on LDRRMF across local government units. Referenced to note the absence of a published audit for CSJDM's LDRRMF.",
      },
      {
        id: "philgeps",
        type: "web",
        apa: "Philippine Government Electronic Procurement System. (n.d.). <em>Award notices and contract data</em> [Database]. GPPB-TSO, Republic of the Philippines.",
        url: "https://www.philgeps.gov.ph/",
        relatedFinding: "Procurement / Sports Complex",
        description: "National procurement transparency database. Source for all contract data displayed in the Procurement and Projects pages, including the Sports Complex award notice.",
      },
      {
        id: "dpwh-infra",
        type: "web",
        apa: "Department of Public Works and Highways. (n.d.). <em>DPWH infrastructure program dataset</em> [Data set]. DPWH, Republic of the Philippines.",
        url: "https://www.dpwh.gov.ph/",
        relatedFinding: "Persistent Flooding",
        description: "DPWH-published infrastructure dataset used to identify all flood control projects funded in CSJDM and their corresponding budget amounts.",
      },
    ],
  },
];

function ApaText({ html }: { html: string }) {
  return (
    <p
      className="text-sm text-foreground leading-relaxed font-mono"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default function SourcesPage() {
  const totalSources = sourceGroups.reduce((sum, g) => sum + g.sources.length, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Sources</h1>
        <p className="text-muted-foreground">
          All {totalSources} sources cited in this project, formatted in APA 7th edition. Every claim
          in the Accountability Report is traceable to one of the entries below.
        </p>
      </div>

      <div className="space-y-10">
        {sourceGroups.map((group) => (
          <section key={group.category}>
            <div className="mb-4">
              <h2 className="text-xl font-semibold tracking-tight">{group.category}</h2>
              <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
            </div>

            <div className="space-y-4">
              {group.sources.map((source, idx) => (
                <Card key={source.id} className="overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex gap-3">
                      <span className="text-xs text-muted-foreground font-mono shrink-0 pt-0.5 w-5">
                        {idx + 1}.
                      </span>
                      <div className="flex-1 min-w-0">
                        <ApaText html={source.apa} />

                        {source.description && (
                          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                            {source.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-3 mt-3">
                          {source.relatedFinding && (
                            <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                              {source.relatedFinding}
                            </span>
                          )}

                          {source.type === "pdf" ? (
                            <a
                              href={source.url}
                              download
                              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                            >
                              <Download size={12} />
                              Download PDF
                            </a>
                          ) : (
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                            >
                              <ExternalLink size={12} />
                              View Source
                            </a>
                          )}
                        </div>

                        {source.type === "pdf" && (
                          <div className="mt-4 rounded-md overflow-hidden border bg-muted/30">
                            <iframe
                              src={source.url}
                              className="w-full h-[500px]"
                              title={`PDF: ${source.apa}`}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>

      <Card className="mt-10">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText size={16} />
            Data Methodology Note
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            Budget figures (income, expenditure, LDRRMF) are pulled directly from the Bureau of Local
            Government Finance (BLGF) LGU Fiscal Data portal and stored in this project&apos;s database.
          </p>
          <p>
            Procurement contracts and DPWH infrastructure projects are sourced from PhilGEPS and DPWH
            open data, respectively. Numbers displayed on this site are computed live from those records.
          </p>
          <p>
            All citations follow <strong>APA 7th edition</strong> format. Where exact publication dates
            were unavailable, &ldquo;n.d.&rdquo; (no date) is used per APA guidelines.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
