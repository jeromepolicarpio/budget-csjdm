import { db } from "@/db";
import { budgetYears, contracts, dpwhProjects } from "@/db/schema";
import { asc, desc } from "drizzle-orm";
import {
  fetchLiveDpwhProjects,
  fetchLiveBlgfData,
  fetchLivePhilGeps,
} from "./bettergov";
import { categorizeTitle } from "./categorize";
import type { BudgetYear, Contract, DpwhProject } from "./types";

// ── Budget years ───────────────────────────────────────────────────────────
// Primary: BetterGov BLGF dataset (live, daily cache)
// Fallback: Neon (seeded from real BLGF CSV)

export async function getBudgetYears(): Promise<BudgetYear[]> {
  const live = await fetchLiveBlgfData().catch(() => []);
  if (live.length > 0) return live.sort((a, b) => a.year - b.year);

  const rows = await db
    .select()
    .from(budgetYears)
    .orderBy(asc(budgetYears.year));

  return rows.map((r) => ({
    year: r.year,
    income: r.income,
    expenditure: r.expenditure,
    drrf: r.drrf,
    sef: r.sef,
  }));
}

// ── Contracts (PhilGEPS) ───────────────────────────────────────────────────
// Primary: BetterGov PhilGEPS index (live, hourly cache)
// Fallback: Neon (scraped via Playwright, refreshed by daily cron)

function normalizePhilGepsHit(hit: Record<string, unknown>): Contract | null {
  const s = (v: unknown) => (typeof v === "string" ? v : String(v ?? ""));
  const n = (v: unknown) => {
    if (typeof v === "number") return v;
    const parsed = parseFloat(String(v ?? "").replace(/[^\d.-]/g, ""));
    return isNaN(parsed) ? 0 : parsed;
  };

  // BetterGov PhilGEPS index uses snake_case: reference_id, award_title, awardee_name, contract_amount, award_status
  const id = s(
    hit.reference_id ?? hit.contract_no ?? hit.reference_no ?? hit.id ?? ""
  );
  if (!id) return null;

  const rawStatus = s(hit.award_status ?? hit.status ?? "active").toLowerCase();
  const status: Contract["status"] = rawStatus.includes("cancel")
    ? "Cancelled"
    : rawStatus.includes("complet")
    ? "Completed"
    : "Active";

  const title = s(
    hit.award_title ?? hit.notice_title ?? hit.title ?? hit.description ?? ""
  );

  return {
    id,
    title,
    awardee: s(hit.awardee_name ?? hit.awardee ?? hit.contractor ?? ""),
    amount: n(hit.contract_amount ?? hit.amount ?? hit.award_amount ?? 0),
    category: categorizeTitle(title),
    date: s(hit.award_date ?? hit.date ?? "").slice(0, 10),
    status,
  };
}


export async function getContracts(): Promise<Contract[]> {
  const liveHits = await fetchLivePhilGeps();
  if (liveHits.length > 0) {
    return liveHits
      .map(normalizePhilGepsHit)
      .filter((c): c is Contract => c !== null && c.amount > 0)
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  const rows = await db
    .select()
    .from(contracts)
    .orderBy(desc(contracts.date));

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    awardee: r.awardee,
    amount: r.amount,
    category: r.category,
    date: r.date,
    status: r.status as Contract["status"],
  }));
}

// ── DPWH projects ─────────────────────────────────────────────────────────
// Primary: BetterGov DPWH Meilisearch (live, hourly cache)
// Fallback: Neon (scraped via Playwright, refreshed by daily cron)

export async function getDpwhProjects(): Promise<DpwhProject[]> {
  const live = await fetchLiveDpwhProjects().catch(() => []);
  if (live.length > 0) return live;

  const rows = await db
    .select()
    .from(dpwhProjects)
    .orderBy(desc(dpwhProjects.infraYear));

  return rows.map((r) => ({
    contractId: r.contractId,
    description: r.description,
    category: r.category,
    status: r.status,
    budget: r.budget,
    amountPaid: r.amountPaid,
    progress: r.progress,
    contractor: r.contractor,
    startDate: r.startDate,
    completionDate: r.completionDate,
    infraYear: r.infraYear,
    sourceOfFunds: r.sourceOfFunds,
    latitude: r.latitude ?? null,
    longitude: r.longitude ?? null,
  }));
}
