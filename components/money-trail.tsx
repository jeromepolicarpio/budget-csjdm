import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { formatPeso } from "@/lib/data";
import type { MoneyTrail } from "@/lib/appropriations";
import { NATIONAL_BUDGET_PORTAL } from "@/lib/links";

/**
 * Year by year: what Congress appropriated for DPWH work naming SJDM, how much
 * of it DPWH's project records account for, and what DPWH reports about it.
 */
export function MoneyTrailSection({ trail }: { trail: MoneyTrail }) {
  const published = new Set(trail.years.filter((y) => y.published).map((y) => y.year));
  const unmatched = trail.matches.filter((m) => !m.project && published.has(m.line.year));
  const unmatchedTotal = unmatched.reduce((s, m) => s + m.line.amount, 0);
  const medium = trail.years.reduce((s, y) => s + y.mediumConfidence, 0);

  return (
    <section aria-labelledby="money-trail" className="mb-10">
      <h2 id="money-trail" className="text-xl font-semibold mb-1">
        Money Trail: National Budget → DPWH Contracts
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        Every DPWH line in the enacted national budget (GAA) whose name names San Jose del Monte,
        matched by year and title to the DPWH project that carried it out. See the lines themselves
        on the{" "}
        <a
          href={`${NATIONAL_BUDGET_PORTAL}/gaa`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 inline-flex items-center gap-0.5"
        >
          National Budget portal
          <ExternalLink size={11} aria-hidden="true" />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
        .
      </p>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <caption className="sr-only">
            National budget appropriations for DPWH work naming San Jose del Monte, by year, with matched DPWH contracts and reported status
          </caption>
          <thead className="bg-muted">
            <tr>
              {["Year", "Appropriated", "Matched to DPWH", "Contracted", "Completed", "On-going"].map((h) => (
                <th key={h} scope="col" className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...trail.years].reverse().map((y) => (
              <tr key={y.year} className="border-t hover:bg-muted/50 transition-colors">
                <th scope="row" className="px-4 py-3 text-left font-medium">{y.year}</th>
                <td className="px-4 py-3 whitespace-nowrap">
                  {formatPeso(y.enacted)}
                  <span className="text-xs text-muted-foreground ml-1">· {y.lines} lines</span>
                </td>
                {y.published ? (
                  <>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {y.matched} of {y.lines}
                      {y.mediumConfidence > 0 && (
                        <span className="text-xs text-muted-foreground ml-1">({y.mediumConfidence} probable)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatPeso(y.contracted)}</td>
                    <td className="px-4 py-3">{y.completed}</td>
                    <td className="px-4 py-3">{y.ongoing}</td>
                  </>
                ) : (
                  <td colSpan={4} className="px-4 py-3 text-muted-foreground">
                    DPWH has not published projects for {y.year} funds yet.
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="text-xs text-muted-foreground mt-3 space-y-1 list-disc pl-5">
        <li>Appropriations are the authority to spend, not spending. DPWH publishes no payment figures for these projects, so the trail stops at the contract amount.</li>
        <li>&ldquo;Completed&rdquo; and &ldquo;On-going&rdquo; are DPWH&apos;s own reported statuses, not independent inspections.</li>
        <li>
          A match pairs a budget line with a DPWH project funded the same year whose title contains nearly all of the line&apos;s words and whose contract is 50–105% of the appropriation.
          {medium > 0 && ` ${medium} ${medium === 1 ? "match is" : "matches are"} marked probable: most but not all words agree.`}
        </li>
        <li>The bypass road to Doña Remedios Trinidad runs between the two towns; its amounts are not all spent inside SJDM.</li>
      </ul>

      {unmatched.length > 0 && (
        <details className="mt-4">
          <summary className="text-sm font-medium cursor-pointer select-none underline underline-offset-2">
            Lines with no matching DPWH record ({unmatched.length}, {formatPeso(unmatchedTotal)})
          </summary>
          <p className="text-xs text-muted-foreground mt-2">
            No DPWH project funded the same year has a matching title. That can mean a renamed or merged
            project, a record DPWH has not published, or work not carried out. These are leads to check, not
            findings.
          </p>
          <ul className="mt-2 space-y-1">
            {unmatched.map((m) => (
              <li
                key={`${m.line.key}:${m.line.year}`}
                className="flex justify-between gap-3 text-xs py-1 border-b last:border-0"
              >
                <span className="min-w-0">
                  <span className="text-muted-foreground mr-2">{m.line.year}</span>
                  {m.line.name}
                </span>
                <span className="shrink-0 font-semibold">{formatPeso(m.line.amount)}</span>
              </li>
            ))}
          </ul>
        </details>
      )}

      <p className="text-xs text-muted-foreground mt-4">
        Method and sources: <Link href="/docs#money-trail" className="underline underline-offset-2">Docs</Link>.
      </p>
    </section>
  );
}
