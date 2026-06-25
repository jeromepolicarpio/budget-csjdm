export const revalidate = 3600;

import { notFound } from "next/navigation";
import Link from "next/link";
import { getContractById } from "@/lib/queries";
import { formatPeso } from "@/lib/data";
import { CopyApa } from "@/components/copy-apa";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ExternalLink, BookOpen } from "lucide-react";

function buildApa(id: string, title: string, date: string): string {
  const year = date ? date.slice(0, 4) : "n.d.";
  return `Philippine Government Electronic Procurement System. (${year}). ${title} [Contract Award Notice, Ref. No. ${id}]. Government Procurement Policy Board, Republic of the Philippines. https://www.philgeps.gov.ph/`;
}

export default async function ProcurementSourcePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const contract = await getContractById(id);
  if (!contract) notFound();

  const apa = buildApa(contract.id, contract.title, contract.date);

  const meta: [string, string][] = [
    ["Reference Number", contract.id],
    ["Awardee / Contractor", contract.awardee || "—"],
    ["Contract Amount", formatPeso(contract.amount)],
    ["Award Date", contract.date || "—"],
    ["Category", contract.category],
    ["Status", contract.status],
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link
        href="/procurement"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft size={14} /> Back to Procurement
      </Link>

      <div className="mb-8">
        <p className="text-xs text-muted-foreground font-mono mb-1">Ref. No. {contract.id}</p>
        <h1 className="text-2xl font-bold tracking-tight leading-snug">{contract.title}</h1>
      </div>

      <Card className="mb-5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Record Details
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          {meta.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 border-b py-2.5 last:border-0 last:pb-0">
              <span className="text-muted-foreground shrink-0">{label}</span>
              <span className="font-medium text-right">{value}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="mb-5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Source Attribution
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          {[
            ["Original Source", "PhilGEPS — Philippine Government Electronic Procurement System"],
            ["Data via", "BetterGov.ph Transparency Portal (transparency.bettergov.ph)"],
            ["Issuing Authority", "Government Procurement Policy Board (GPPB)"],
            ["Record Type", "Contract Award Notice"],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 border-b py-2.5 last:border-0 last:pb-0">
              <span className="text-muted-foreground shrink-0">{label}</span>
              <span className="font-medium text-right">{value}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="mb-5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <BookOpen size={13} /> APA 7th Edition Citation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm font-mono leading-relaxed bg-muted/50 rounded-md p-3 mb-3">
            {apa}
          </p>
          <CopyApa text={apa} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Verify This Record
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-4">
          {contract.sourceUrl ? (
            <a
              href={contract.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
            >
              View Original Source <ExternalLink size={13} />
            </a>
          ) : (
            <>
              <p className="text-muted-foreground">
                This record is indexed from PhilGEPS by BetterGov.ph. To verify it,
                search for the reference number on BetterGov.ph&apos;s procurement portal:
              </p>

              <div className="rounded-lg border bg-muted/40 p-4 space-y-1.5">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Reference Number — copy this</p>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-lg font-bold tracking-wide">{contract.id}</span>
                  <CopyApa text={contract.id} label="Copy" />
                </div>
              </div>

              <ol className="space-y-1 list-decimal list-inside text-muted-foreground">
                <li>Click <strong className="text-foreground">Open BetterGov.ph Procurement</strong> below</li>
                <li>Paste the reference number into the search box</li>
                <li>Find this record in the results</li>
              </ol>

              <div className="flex flex-wrap gap-2 pt-1">
                <a
                  href="https://transparency.bettergov.ph/procurement"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Open BetterGov.ph Procurement <ExternalLink size={13} />
                </a>
                <a
                  href="https://www.philgeps.gov.ph/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md border text-sm font-medium hover:bg-muted transition-colors"
                >
                  Original source: PhilGEPS <ExternalLink size={13} />
                </a>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
