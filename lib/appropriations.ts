import { searchDpwhProjects } from "./bettergov";
import { categorizeTitle } from "./categorize";
import {
  isSjdmTitle,
  matchAppropriations,
  type AppropriationMatch,
  type GaaLine,
} from "./match-appropriations";
import type { DpwhProject } from "./types";

/**
 * The money trail: what Congress appropriated for DPWH work naming SJDM
 * (GAA 2020 onward, BetterGov Budget API), matched to the DPWH e-IPIS projects
 * that carried it out.
 *
 * Appropriations are the authority to spend, not spending. DPWH's "amount
 * paid" field is empty for every SJDM record, so this trail stops at the
 * contract amount and DPWH's own reported status.
 */

const BUDGET_API = "https://budget.bettergov.ph";
const PLACE_QUERY = "San Jose del Monte";
/** DPWH abbreviates the city; each query catches spellings the others miss. */
const DPWH_QUERIES = ["San Jose del Monte", "SJDM", "Sn Jose del Monte"];
const GAA_PAGE_SIZE = 200;
const MAX_GAA_PAGES = 20;
const DAY = 86_400;
const REQUEST_TIMEOUT_MS = 15_000;

type GaaProgramRow = {
  fam_key: string;
  name: string;
  years: Record<string, { count: number; amount: number }>;
};

async function budgetApi<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(path, BUDGET_API);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url, { next: { revalidate: DAY }, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  if (!res.ok) throw new Error(`BetterGov Budget API ${res.status} for ${url.pathname}`);
  return res.json() as Promise<T>;
}

/** Every enacted DPWH line whose name names SJDM, one entry per year it was funded. */
export async function fetchGaaDpwhLines(): Promise<GaaLine[]> {
  const departments = await budgetApi<{ data: { id: string; description: string }[] }>(
    "/api/v1/gaa/departments"
  );
  const dpwh = departments.data.find((d) => /public works and highways/i.test(d.description));
  if (!dpwh) throw new Error("BetterGov Budget API: DPWH missing from GAA departments");

  const rows: GaaProgramRow[] = [];
  let cursor: string | null | undefined;
  let pages = 0;
  do {
    const page = await budgetApi<{ data: GaaProgramRow[]; next_cursor?: string | null }>(
      `/api/v1/gaa/departments/${dpwh.id}/programs`,
      { q: PLACE_QUERY, limit: String(GAA_PAGE_SIZE), ...(cursor ? { cursor } : {}) }
    );
    rows.push(...page.data);
    cursor = page.next_cursor;
  } while (cursor && ++pages < MAX_GAA_PAGES);
  if (cursor) throw new Error("BetterGov Budget API: GAA results exceed the page limit");

  return rows
    // The API's search may be loose; keep only names that spell the city out.
    .filter((r) => isSjdmTitle(r.name))
    // Region-wide studies name SJDM in passing; they are not works in the city.
    .filter((r) => !/^\s*(regionwide|nationwide)/i.test(r.name))
    .flatMap((r) =>
      Object.entries(r.years)
        .filter(([, v]) => v.amount > 0)
        .map(([year, v]) => ({ key: r.fam_key, name: r.name.trim(), year: Number(year), amount: v.amount }))
    );
}

/** DPWH projects whose title names SJDM in any spelling, de-duplicated. */
export async function fetchAppropriationProjects(): Promise<DpwhProject[]> {
  const results = await Promise.all(DPWH_QUERIES.map((q) => searchDpwhProjects(q)));
  const byId = new Map<string, DpwhProject>();
  for (const p of results.flat()) {
    if (p.contractId && isSjdmTitle(p.description) && !byId.has(p.contractId)) byId.set(p.contractId, p);
  }
  return [...byId.values()];
}

export type YearTrail = {
  year: number;
  lines: number;
  enacted: number;
  matched: number;
  mediumConfidence: number;
  contracted: number;
  completed: number;
  ongoing: number;
  /** False while DPWH has published no project for this year's funds yet. */
  published: boolean;
};

export type MoneyTrail = {
  matches: AppropriationMatch[];
  years: YearTrail[];
};

export function isCompleted(p: DpwhProject): boolean {
  return /^completed?$/i.test(p.status.trim());
}

export function isOngoing(p: DpwhProject): boolean {
  return /^on-?going$/i.test(p.status.trim());
}

export function summarizeYears(matches: AppropriationMatch[]): YearTrail[] {
  const years = [...new Set(matches.map((m) => m.line.year))].sort((a, b) => a - b);
  return years.map((year) => {
    const inYear = matches.filter((m) => m.line.year === year);
    const projects = inYear.flatMap((m) => (m.project ? [m.project] : []));
    return {
      year,
      lines: inYear.length,
      enacted: inYear.reduce((s, m) => s + m.line.amount, 0),
      matched: projects.length,
      mediumConfidence: inYear.filter((m) => m.confidence === "medium").length,
      contracted: projects.reduce((s, p) => s + p.budget, 0),
      completed: projects.filter(isCompleted).length,
      ongoing: projects.filter(isOngoing).length,
      published: projects.length > 0,
    };
  });
}

export async function getMoneyTrail(): Promise<MoneyTrail> {
  const [lines, projects] = await Promise.all([fetchGaaDpwhLines(), fetchAppropriationProjects()]);
  const matches = matchAppropriations(lines, projects);
  return { matches, years: summarizeYears(matches) };
}

// ── Findings ───────────────────────────────────────────────────────────────

export type TrailSlice = {
  matches: AppropriationMatch[];
  enacted: number;
  contracted: number;
  matched: number;
  completed: number;
  ongoing: number;
  firstYear: number;
  lastYear: number;
};

export function slice(matches: AppropriationMatch[]): TrailSlice {
  const projects = matches.flatMap((m) => (m.project ? [m.project] : []));
  const years = matches.map((m) => m.line.year);
  return {
    matches,
    enacted: matches.reduce((s, m) => s + m.line.amount, 0),
    contracted: projects.reduce((s, p) => s + p.budget, 0),
    matched: projects.length,
    completed: projects.filter(isCompleted).length,
    ongoing: projects.filter(isOngoing).length,
    firstYear: years.length ? Math.min(...years) : 0,
    lastYear: years.length ? Math.max(...years) : 0,
  };
}

/** Lines from years DPWH has published projects for; later years cannot be compared yet. */
function publishedMatches(trail: MoneyTrail): AppropriationMatch[] {
  const published = new Set(trail.years.filter((y) => y.published).map((y) => y.year));
  return trail.matches.filter((m) => published.has(m.line.year));
}

/** Flood-control and drainage lines, classified the way the rest of the site classifies projects. */
export function floodLines(trail: MoneyTrail): TrailSlice {
  return slice(publishedMatches(trail).filter((m) => categorizeTitle(m.line.name) === "Flood Control"));
}

/** The road from Doña Remedios Trinidad to SJDM, every funded line. */
export function bypassLines(trail: MoneyTrail): TrailSlice {
  return slice(
    publishedMatches(trail)
      .filter((m) => /remedios\s+trinidad/i.test(m.line.name))
      .sort((a, b) => a.line.year - b.line.year)
  );
}
