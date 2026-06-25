export const revalidate = 3600;

import { notFound } from "next/navigation";
import Link from "next/link";
import { getDpwhProjectById } from "@/lib/queries";
import { formatPeso } from "@/lib/data";
import { CopyApa } from "@/components/copy-apa";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ExternalLink, BookOpen } from "lucide-react";

const HUGGINGFACE_DATASET = "https://huggingface.co/datasets/bettergovph/dpwh-transparency-data";

function buildApa(contractId: string, description: string, infraYear: string): string {
  const year = infraYear || "n.d.";
  return `Department of Public Works and Highways. (${year}). ${description} [Infrastructure Project, Contract No. ${contractId}]. DPWH, Republic of the Philippines. In bettergovph/dpwh-transparency-data [Data set]. Hugging Face. ${HUGGINGFACE_DATASET}`;
}

export default async function ProjectSourcePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getDpwhProjectById(id);
  if (!project) notFound();

  const apa = buildApa(project.contractId, project.description, project.infraYear);

  const meta: [string, string][] = [
    ["Contract ID", project.contractId],
    ["Contractor", project.contractor || "—"],
    ["Contract Amount", formatPeso(project.budget)],
    ["Amount Paid", formatPeso(project.amountPaid)],
    ["Progress", `${project.progress}%`],
    ["Status", project.status],
    ["Start Date", project.startDate || "—"],
    ["Target Completion", project.completionDate || "—"],
    ["Infra Year", project.infraYear || "—"],
    ["Source of Funds", project.sourceOfFunds || "—"],
    ["Category", project.category],
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link
        href="/projects"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft size={14} /> Back to Projects
      </Link>

      <div className="mb-8">
        <p className="text-xs text-muted-foreground font-mono mb-1">Contract No. {project.contractId}</p>
        <h1 className="text-2xl font-bold tracking-tight leading-snug">{project.description}</h1>
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
            ["Source Agency", "Department of Public Works and Highways (DPWH)"],
            ["Published by", "BetterGov.ph (bettergovph)"],
            ["Dataset", "bettergovph/dpwh-transparency-data — Hugging Face"],
            ["Web Interface", "BetterGov.ph Dataset #19"],
            ["Record Type", "Infrastructure Project"],
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
          {project.sourceUrl ? (
            <a
              href={project.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
            >
              View Original Source <ExternalLink size={13} />
            </a>
          ) : (
            <>
              <p className="text-muted-foreground">
                This record is sourced from DPWH data published by BetterGov.ph. To verify it,
                search for the contract ID on BetterGov.ph&apos;s DPWH portal:
              </p>

              <div className="rounded-lg border bg-muted/40 p-4 space-y-1.5">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Contract ID — copy this</p>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-lg font-bold tracking-wide">{project.contractId}</span>
                  <CopyApa text={project.contractId} label="Copy" />
                </div>
              </div>

              <ol className="space-y-1 list-decimal list-inside text-muted-foreground">
                <li>Click <strong className="text-foreground">Open BetterGov.ph DPWH</strong> below</li>
                <li>Paste the contract ID into the search box</li>
                <li>Find this record in the results</li>
              </ol>

              <div className="flex flex-wrap gap-2 pt-1">
                <a
                  href="https://transparency.bettergov.ph/dpwh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Open BetterGov.ph DPWH <ExternalLink size={13} />
                </a>
                <a
                  href={HUGGINGFACE_DATASET}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md border text-sm font-medium hover:bg-muted transition-colors"
                >
                  Raw dataset (Hugging Face) <ExternalLink size={13} />
                </a>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
