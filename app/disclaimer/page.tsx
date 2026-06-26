import type { Metadata } from "next";
import Link from "next/link";
import { ContactTrigger } from "@/components/contact-trigger";

export const metadata: Metadata = {
  title: "Disclaimer | CSJDM Budget Portal",
  description: "Data accuracy disclaimer, independence notice, and data source information for the CSJDM People's Budget Portal.",
};

export default function DisclaimerPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Disclaimer</h1>
      <p className="text-muted-foreground mb-10">Last updated: June 2026</p>

      <div className="space-y-8 text-sm leading-relaxed">
        <section>
          <h2 className="text-base font-semibold mb-2">Independence</h2>
          <p className="text-muted-foreground">
            This site is a citizen-built transparency tool. It is <strong className="text-foreground">not
            affiliated with, endorsed by, or connected to the City Government of San Jose del Monte,
            Bulacan</strong>, any of its offices, or any elected official. It does not represent the
            position of any government agency.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">Data Accuracy</h2>
          <p className="text-muted-foreground">
            Budget figures are sourced from the{" "}
            <a href="https://blgf.gov.ph/lgu-fiscal-data/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground">
              Bureau of Local Government Finance (BLGF)
            </a>{" "}
            LGU Fiscal Data portal. Procurement and contract data come from{" "}
            <a href="https://www.philgeps.gov.ph/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground">
              PhilGEPS
            </a>{" "}
            via{" "}
            <a href="https://data.bettergov.ph" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground">
              BetterGov.ph
            </a>
            . Infrastructure project data comes from the DPWH Infrastructure Transparency Dataset,
            also via BetterGov.ph.
          </p>
          <p className="text-muted-foreground mt-3">
            While I make every effort to present data accurately, figures are reproduced from public
            sources and may contain errors present in those original records. Computed values
            (totals, per-capita figures, year-on-year changes) are derived automatically and may not
            match official government summaries. <strong className="text-foreground">Do not use
            this site as a substitute for official government data when making legal, financial, or
            policy decisions.</strong>
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">Accountability Report</h2>
          <p className="text-muted-foreground">
            The findings on the{" "}
            <Link href="/accountability" className="underline underline-offset-2 hover:text-foreground">
              Accountability Report
            </Link>{" "}
            page are based on cross-referencing public data with published news reports. All
            narratives are sourced and linked. Estimates (e.g., water tanker costs, household
            counts) are drawn from published reports and noted as such — they are not independently
            audited. The findings are reviewed periodically; the date of last review is shown on
            that page.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">Data Currency</h2>
          <p className="text-muted-foreground">
            Budget data is updated annually after new BLGF data is published. Procurement and
            project data is refreshed daily from BetterGov.ph. There may be a lag between
            when official records are updated and when changes appear here.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">Reporting Errors</h2>
          <p className="text-muted-foreground">
            If you find an error, outdated figure, or have access to more recent public data,
            please <ContactTrigger />. We take accuracy seriously and will correct verified
            errors promptly.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">No Warranty</h2>
          <p className="text-muted-foreground">
            This site is provided as-is, without any warranty of completeness, accuracy, or
            fitness for a particular purpose. I am not liable for decisions made based on data presented here.
          </p>
        </section>
      </div>
    </div>
  );
}
