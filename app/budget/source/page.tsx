import Link from "next/link";
import { CopyApa } from "@/components/copy-apa";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ExternalLink, BookOpen } from "lucide-react";

const BLGF_URL = "https://blgf.gov.ph/lgu-fiscal-data/";

const apa =
  "Bureau of Local Government Finance. (n.d.). LGU fiscal data [Data set]. Department of Finance, Republic of the Philippines. https://blgf.gov.ph/lgu-fiscal-data/";

export default function BudgetSourcePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link
        href="/budget"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2 mb-6"
      >
        <ArrowLeft size={14} /> Back to Budget
      </Link>

      <div className="mb-8">
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Budget Data</p>
        <h1 className="text-2xl font-bold tracking-tight">BLGF LGU Fiscal Data</h1>
        <p className="text-muted-foreground text-sm mt-2">
          Source for all budget figures shown on the Budget Dashboard — income, expenditure,
          surplus, DRRF, and SEF for City of San Jose del Monte.
        </p>
      </div>

      <Card className="mb-5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Source Attribution
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          {[
            ["Source Agency", "Bureau of Local Government Finance (BLGF)"],
            ["Parent Agency", "Department of Finance, Republic of the Philippines"],
            ["Dataset", "Annual Statement of Receipts and Expenditures — LGU Fiscal Data"],
            ["Coverage", "City of San Jose del Monte, Bulacan — 2020 to present"],
            ["Source Type", "Government Fiscal Dataset"],
            ["Access", "Publicly available at blgf.gov.ph"],
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
            View Original Source
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-4">
          <p className="text-muted-foreground">
            The BLGF LGU Fiscal Data portal is publicly accessible. All budget figures on this
            platform are derived directly from the published BLGF dataset.
          </p>
          <a
            href={BLGF_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Open BLGF LGU Fiscal Data <ExternalLink size={13} />
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
