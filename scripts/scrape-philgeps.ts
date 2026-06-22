/**
 * Scrapes PhilGEPS award notices for CSJDM (City of San Jose del Monte).
 * Upserts results into the `contracts` table in Neon.
 *
 * Usage: npx tsx scripts/scrape-philgeps.ts
 *
 * PhilGEPS awards search:
 *   https://www.philgeps.gov.ph/GEPSNONPILOT/Tender/SplashAwardNotice.aspx
 * Filter by Organization = "City of San Jose del Monte"
 *
 * PhilGEPS is server-rendered ASP.NET WebForms. Selectors target the standard
 * GridView table structure. Verify row count matches the browser after first run.
 */
import "dotenv/config";
import { chromium } from "playwright";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { contracts } from "../db/schema";

const PHILGEPS_SEARCH_URL =
  "https://www.philgeps.gov.ph/GEPSNONPILOT/Tender/SplashAwardNotice.aspx?menuIndex=3";
const CSJDM_KEYWORD = "San Jose Del Monte";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

type ScrapedContract = {
  id: string;
  title: string;
  awardee: string;
  amount: number;
  category: string;
  date: string;
  status: string;
};

function categorize(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("flood") || t.includes("drainage") || t.includes("creek")) return "Flood Control";
  if (t.includes("water") || t.includes("potable")) return "Water & Utilities";
  if (t.includes("road") || t.includes("pavement") || t.includes("bridge")) return "Roads";
  if (t.includes("building") || t.includes("hall") || t.includes("center") || t.includes("school")) return "Buildings";
  if (t.includes("light") || t.includes("electric") || t.includes("solar")) return "Street Lighting";
  if (t.includes("medical") || t.includes("health") || t.includes("hospital")) return "Health";
  return "Other";
}

async function scrape(): Promise<ScrapedContract[]> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const results: ScrapedContract[] = [];

  try {
    await page.goto(PHILGEPS_SEARCH_URL, { waitUntil: "networkidle", timeout: 30000 });

    const searchInput = page.locator('input[name*="txtKeyword"], input[id*="txtKeyword"]').first();
    await searchInput.fill(CSJDM_KEYWORD);
    await page.locator('input[value="Search"], input[id*="btnSearch"]').first().click();
    await page.waitForLoadState("networkidle");

    let hasNextPage = true;
    let pageNum = 1;

    while (hasNextPage) {
      console.log(`  Page ${pageNum}...`);
      const rows = await page.locator("table tr").all();

      for (const row of rows) {
        const cells = await row.locator("td").all();
        if (cells.length < 6) continue;

        const referenceNo = (await cells[0].innerText()).trim();
        const title = (await cells[1].innerText()).trim();
        const awardee = (await cells[2].innerText()).trim();
        const amountText = (await cells[3].innerText()).trim().replace(/[₱,\s]/g, "");
        const dateText = (await cells[4].innerText()).trim();
        const statusText = (await cells[5].innerText()).trim();

        if (!referenceNo || !title) continue;

        const amount = parseFloat(amountText) || 0;

        const dateParts = dateText.split("/");
        const date =
          dateParts.length === 3
            ? `${dateParts[2]}-${dateParts[0].padStart(2, "0")}-${dateParts[1].padStart(2, "0")}`
            : dateText;

        const status = statusText.toLowerCase().includes("active")
          ? "Active"
          : statusText.toLowerCase().includes("cancel")
          ? "Cancelled"
          : "Completed";

        results.push({
          id: `PH-${referenceNo}`,
          title,
          awardee,
          amount,
          category: categorize(title),
          date,
          status,
        });
      }

      const nextLink = page.locator('a:has-text("Next"), a[id*="Next"]').first();
      const nextExists = (await nextLink.count()) > 0 && (await nextLink.isVisible());
      if (nextExists) {
        await nextLink.click();
        await page.waitForLoadState("networkidle");
        pageNum++;
      } else {
        hasNextPage = false;
      }
    }
  } finally {
    await browser.close();
  }

  return results;
}

async function main() {
  console.log(`Scraping PhilGEPS for "${CSJDM_KEYWORD}"...`);
  const rows = await scrape();
  console.log(`Found ${rows.length} award records.`);

  if (rows.length === 0) {
    console.warn("No records found — check selectors against the live PhilGEPS page.");
    return;
  }

  for (const row of rows) {
    await db
      .insert(contracts)
      .values({ ...row, source: "philgeps" })
      .onConflictDoUpdate({
        target: contracts.id,
        set: {
          title: row.title,
          awardee: row.awardee,
          amount: row.amount,
          category: row.category,
          date: row.date,
          status: row.status,
        },
      });
  }

  console.log(`Done. Upserted ${rows.length} PhilGEPS contracts.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
