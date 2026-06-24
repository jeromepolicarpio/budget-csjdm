import type { DpwhProject, BudgetYear } from "./types";
import { categorizeTitle } from "./categorize";

const MEILISEARCH_URL = "https://search2.bettergov.ph/indexes";

// ── helpers ────────────────────────────────────────────────────────────────

function str(v: unknown): string {
  return typeof v === "string" ? v : String(v ?? "");
}

function num(v: unknown): number {
  if (typeof v === "number") return v;
  const n = parseFloat(String(v ?? "").replace(/[^\d.-]/g, ""));
  return isNaN(n) ? 0 : n;
}

function lat(v: unknown): number | null {
  if (typeof v === "number" && v !== 0) return v;
  return null;
}

// Returns true when the Meilisearch `category` field contains a fund source
// label (e.g. "GAA 2019 LP") rather than a real project category.
function isFundSourceLabel(category: string): boolean {
  return /\d/.test(category); // any digit → it's a year/code, not a category
}

async function meilisearchPost(
  index: string,
  body: Record<string, unknown>
): Promise<{ hits: Record<string, unknown>[] }> {
  const key = process.env.BETTERGOV_MEILISEARCH_KEY;
  if (!key) throw new Error("BETTERGOV_MEILISEARCH_KEY environment variable is not set");
  const res = await fetch(`${MEILISEARCH_URL}/${index}/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(body),
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`BetterGov ${index} ${res.status}`);
  return res.json() as Promise<{ hits: Record<string, unknown>[] }>;
}

// ── DPWH (BetterGov Meilisearch) ──────────────────────────────────────────

// BetterGov may return fields in UPPER_SNAKE or camelCase depending on
// which index version is active — handle both defensively.
function normalizeDpwhHit(hit: Record<string, unknown>): DpwhProject {
  const description = str(
    hit.PROJECT_DESCRIPTION ?? hit.description ?? hit.DESCRIPTION ?? ""
  );
  const rawCategory = str(hit.CATEGORY ?? hit.category ?? "");
  const fromRaw =
    rawCategory && !isFundSourceLabel(rawCategory)
      ? categorizeTitle(rawCategory)
      : "Other";
  const category = fromRaw !== "Other" ? fromRaw : categorizeTitle(description);

  return {
    contractId: str(
      hit.CONTRACT_ID ?? hit.contract_id ?? hit.contractId ?? hit.id
    ),
    description,
    category,
    status: (() => {
      const raw = str(hit.STATUS ?? hit.status ?? "").trim();
      const lower = raw.toLowerCase();
      if (lower === "on-going" || lower === "ongoing") return "On-going";
      if (lower === "completed" || lower === "complete") return "Completed";
      if (lower === "terminated") return "Terminated";
      if (lower === "suspended") return "Suspended";
      if (lower === "not yet started" || lower === "nys") return "Not Yet Started";
      return raw;
    })(),
    budget: Math.round(num(hit.CONTRACT_AMOUNT ?? hit.budget ?? hit.BUDGET ?? 0)),
    amountPaid: Math.round(num(hit.AMOUNT_PAID ?? hit.amount_paid ?? hit.amountPaid ?? 0)),
    progress: Math.round(num(hit.PROGRESS ?? hit.progress ?? 0)),
    contractor: str(hit.CONTRACTOR ?? hit.contractor ?? hit.CONTRACTOR_NAME ?? ""),
    startDate: str(hit.START_DATE ?? hit.start_date ?? hit.startDate ?? ""),
    completionDate: str(
      hit.COMPLETION_DATE ?? hit.completion_date ?? hit.completionDate ?? ""
    ),
    infraYear: str(hit.INFRA_YEAR ?? hit.infra_year ?? hit.infraYear ?? ""),
    sourceOfFunds: str(
      hit.SOURCE_OF_FUNDS ?? hit.source_of_funds ?? hit.sourceOfFunds ?? ""
    ),
    latitude: lat(hit.LATITUDE ?? hit.latitude),
    longitude: lat(hit.LONGITUDE ?? hit.longitude),
  };
}

export async function fetchLiveDpwhProjects(): Promise<DpwhProject[]> {
  // Meilisearch hard cap is 10 000 hits total. Fetch two pages of 500 sorted
  // by most-recent infra year so callers always see the newest projects first.
  const pages = await Promise.all([
    meilisearchPost("dpwh", {
      q: "San Jose del Monte",
      limit: 500,
      offset: 0,
      sort: ["infraYear:desc"],
      attributesToRetrieve: ["*"],
    }).catch(() =>
      meilisearchPost("dpwh", {
        q: "San Jose del Monte",
        limit: 500,
        offset: 0,
        attributesToRetrieve: ["*"],
      })
    ),
    meilisearchPost("dpwh", {
      q: "San Jose del Monte",
      limit: 500,
      offset: 500,
      sort: ["infraYear:desc"],
      attributesToRetrieve: ["*"],
    }).catch(() =>
      meilisearchPost("dpwh", {
        q: "San Jose del Monte",
        limit: 500,
        offset: 500,
        attributesToRetrieve: ["*"],
      })
    ),
  ]);

  const hits = [...(pages[0].hits ?? []), ...(pages[1].hits ?? [])];
  return hits
    .filter((h) =>
      str(h.PROJECT_DESCRIPTION ?? h.description ?? h.DESCRIPTION ?? "")
        .toLowerCase()
        .includes("san jose del monte")
    )
    .map(normalizeDpwhHit);
}

// ── BLGF ──────────────────────────────────────────────────────────────────
// The BetterGov open data portal does not publish a machine-readable BLGF
// CSV for CSJDM. Real data is imported via scripts/import-blgf.ts which
// downloads BLGF Excel files and upserts them to Neon. This stub keeps the
// queries.ts fallback chain intact.

export async function fetchLiveBlgfData(): Promise<BudgetYear[]> {
  return [];
}

// ── PhilGEPS (BetterGov Meilisearch) ─────────────────────────────────────

export type RawPhilGepsHit = Record<string, unknown>;

export async function fetchLivePhilGeps(): Promise<RawPhilGepsHit[]> {
  const queries = ["San Jose del Monte", "SJDM", "San José del Monte"];
  const offsets = [0, 1000];

  // Fetch 2 pages per query (6 requests total) to get beyond the 1000-hit limit.
  // Each individual request falls back to unsorted if the index rejects the sort field.
  // null = both attempts failed for that page.
  const requests = queries.flatMap((q) =>
    offsets.map((offset) =>
      meilisearchPost("philgeps", {
        q,
        limit: 1000,
        offset,
        sort: ["award_date:desc"],
        attributesToRetrieve: ["*"],
      }).catch(() =>
        meilisearchPost("philgeps", {
          q,
          limit: 1000,
          offset,
          attributesToRetrieve: ["*"],
        }).catch(() => null)
      )
    )
  );

  const rawResults = await Promise.all(requests);
  const succeeded = rawResults.filter(
    (r): r is { hits: Record<string, unknown>[] } => r !== null
  );

  // If every single request failed, throw so Next.js ISR keeps the last good
  // cache instead of overwriting it with an empty render.
  if (succeeded.length === 0) {
    throw new Error("BetterGov PhilGEPS unavailable — all requests failed");
  }

  const seen = new Set<string>();
  const deduped: RawPhilGepsHit[] = [];
  for (const result of succeeded) {
    for (const hit of result.hits ?? []) {
      const id = String(
        hit.reference_id ?? hit.contract_no ?? hit.reference_no ?? hit.id ?? ""
      );
      if (id && !seen.has(id)) {
        seen.add(id);
        deduped.push(hit);
      }
    }
  }
  return deduped;
}
