/**
 * Placeholder seed script — real data is loaded via dedicated import scripts.
 *
 * Budget data (budget_years):
 *   npx tsx scripts/import-blgf.ts
 *
 * Contracts and DPWH projects are served live from BetterGov Meilisearch
 * and cached in Neon only when the live index is unavailable (handled
 * automatically by lib/queries.ts).
 */
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { budgetYears } from "../db/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function seed() {
  const rows = await db.select().from(budgetYears);
  console.log(`budget_years has ${rows.length} row(s).`);
  console.log("To import BLGF data: npx tsx scripts/import-blgf.ts");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
