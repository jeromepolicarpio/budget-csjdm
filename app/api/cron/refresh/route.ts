import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { budgetYears, contracts, dpwhProjects } from "@/db/schema";
import {
  fetchLiveDpwhProjects,
  fetchLiveBlgfData,
  fetchLivePhilGeps,
} from "@/lib/bettergov";
import { categorizeTitle } from "@/lib/categorize";
import type { Contract } from "@/lib/types";

// Called daily by Vercel Cron. Syncs BetterGov live data into Neon so the
// fallback store stays fresh if the live APIs ever go down.
export async function GET(req: NextRequest) {
  if (
    req.headers.get("Authorization") !==
    `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const log: Record<string, unknown> = {};

  // ── BLGF → budget_years ────────────────────────────────────────────────
  try {
    const rows = await fetchLiveBlgfData();
    if (rows.length > 0) {
      await db
        .insert(budgetYears)
        .values(
          rows.map((r) => ({
            year: r.year,
            income: r.income,
            expenditure: r.expenditure,
            drrf: r.drrf,
            sef: r.sef,
          }))
        )
        .onConflictDoNothing();
      log.blgf = { synced: rows.length };
    } else {
      log.blgf = { synced: 0, note: "no live data returned" };
    }
  } catch (err) {
    log.blgf = { error: String(err) };
  }

  // ── DPWH → dpwh_projects ──────────────────────────────────────────────
  try {
    const rows = await fetchLiveDpwhProjects();
    if (rows.length > 0) {
      const values = rows.map((p) => ({
        contractId: p.contractId.slice(0, 100),
        description: p.description,
        category: p.category.slice(0, 100),
        status: p.status.slice(0, 50),
        budget: Math.round(p.budget),
        amountPaid: Math.round(p.amountPaid),
        progress: Math.round(p.progress),
        contractor: p.contractor,
        startDate: p.startDate.slice(0, 50),
        completionDate: p.completionDate.slice(0, 50),
        infraYear: p.infraYear.slice(0, 10),
        sourceOfFunds: p.sourceOfFunds.slice(0, 255),
        ...(p.latitude !== null ? { latitude: p.latitude } : {}),
        ...(p.longitude !== null ? { longitude: p.longitude } : {}),
      }));

      // Insert in chunks of 50 to stay well within Postgres parameter limits
      const CHUNK = 50;
      for (let i = 0; i < values.length; i += CHUNK) {
        await db
          .insert(dpwhProjects)
          .values(values.slice(i, i + CHUNK))
          .onConflictDoNothing();
      }
      log.dpwh = { synced: rows.length };
    } else {
      log.dpwh = { synced: 0, note: "no live data returned" };
    }
  } catch (err) {
    log.dpwh = { error: String(err) };
  }

  // ── PhilGEPS → contracts ───────────────────────────────────────────────
  try {
    const hits = await fetchLivePhilGeps();
    if (hits.length > 0) {
      const s = (v: unknown) =>
        typeof v === "string" ? v : String(v ?? "");
      const n = (v: unknown) => {
        if (typeof v === "number") return v;
        const p = parseFloat(String(v ?? "").replace(/[^\d.-]/g, ""));
        return isNaN(p) ? 0 : p;
      };

      const rows = hits.flatMap((hit) => {
        // Field names match BetterGov PhilGEPS Meilisearch index (verified in lib/queries.ts)
        const id = s(hit.reference_id ?? hit.contract_no ?? hit.reference_no ?? hit.id ?? "");
        if (!id) return [];
        const rawStatus = s(hit.award_status ?? hit.status ?? "Active").toLowerCase();
        const status: Contract["status"] = rawStatus.includes("cancel")
          ? "Cancelled"
          : rawStatus.includes("complet")
          ? "Completed"
          : "Active";
        const title = s(hit.award_title ?? hit.notice_title ?? hit.title ?? hit.description ?? "");
        return [
          {
            id,
            title,
            awardee: s(hit.awardee_name ?? hit.awardee ?? hit.contractor ?? ""),
            amount: n(hit.contract_amount ?? hit.amount ?? hit.award_amount ?? 0),
            category: categorizeTitle(title),
            date: s(hit.award_date ?? hit.date ?? "").slice(0, 10),
            status,
            source: "bettergov" as const,
          },
        ];
      });

      if (rows.length > 0) {
        await db.insert(contracts).values(rows).onConflictDoNothing();
      }
      log.philgeps = { synced: rows.length };
    } else {
      log.philgeps = {
        synced: 0,
        note: "BetterGov PhilGEPS index unavailable — run scrape:philgeps manually",
      };
    }
  } catch (err) {
    log.philgeps = { error: String(err) };
  }

  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    results: log,
  });
}
