/**
 * Scrapes DPWH e-IPIS (Infrastructure Projects Information System) for CSJDM.
 * Upserts results into the `dpwh_projects` table in Neon.
 *
 * Usage: npx tsx scripts/scrape-dpwh.ts
 *
 * Portal: https://e.dpwh.gov.ph/eprs
 * Filter path: Region III > Bulacan > City of San Jose Del Monte
 *
 * Also cross-references data.bettergov.ph Dataset #19 (pre-filtered for CSJDM).
 * e-IPIS is a React SPA so Playwright is required (not cheerio).
 */
import "dotenv/config";
import { chromium } from "playwright";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { dpwhProjects } from "../db/schema";

const DPWH_EPRS_URL = "https://e.dpwh.gov.ph/eprs/index";
const REGION = "Region III";
const PROVINCE = "Bulacan";
const CITY = "City of San Jose Del Monte";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

type ScrapedProject = {
  contractId: string;
  description: string;
  category: string;
  status: string;
  budget: number;
  amountPaid: number;
  progress: number;
  contractor: string;
  startDate: string;
  completionDate: string;
  infraYear: string;
  sourceOfFunds: string;
  latitude: number | null;
  longitude: number | null;
};

const parseAmount = (text: string) => parseFloat(text.replace(/[₱,\s]/g, "")) || 0;
const parseProgress = (text: string) => parseInt(text.replace(/[%\s]/g, ""), 10) || 0;

async function scrape(): Promise<ScrapedProject[]> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const results: ScrapedProject[] = [];

  try {
    await page.goto(DPWH_EPRS_URL, { waitUntil: "networkidle", timeout: 45000 });

    await page.selectOption('select[name*="region"], select[id*="region"]', { label: REGION });
    await page.waitForTimeout(1000);
    await page.selectOption('select[name*="province"], select[id*="province"]', { label: PROVINCE });
    await page.waitForTimeout(1000);
    await page.selectOption('select[name*="city"], select[name*="municipality"]', { label: CITY });
    await page.waitForTimeout(500);

    await page.locator('button:has-text("Search"), input[value="Search"]').first().click();
    await page.waitForLoadState("networkidle");

    let hasNextPage = true;
    let pageNum = 1;

    while (hasNextPage) {
      console.log(`  Page ${pageNum}...`);
      const rows = await page.locator("table tbody tr").all();

      for (const row of rows) {
        const cells = await row.locator("td").all();
        if (cells.length < 8) continue;

        const contractId = (await cells[0].innerText()).trim();
        const description = (await cells[1].innerText()).trim();
        if (!contractId || !description) continue;

        results.push({
          contractId,
          description,
          category: (await cells[2].innerText()).trim() || "Other",
          status: (await cells[3].innerText()).trim(),
          budget: parseAmount(await cells[4].innerText()),
          amountPaid: parseAmount(await cells[5].innerText()),
          progress: parseProgress(await cells[6].innerText()),
          contractor: (await cells[7].innerText()).trim(),
          startDate: cells[8] ? (await cells[8].innerText()).trim() : "",
          completionDate: cells[9] ? (await cells[9].innerText()).trim() : "",
          infraYear: cells[10] ? (await cells[10].innerText()).trim() : "",
          sourceOfFunds: cells[11] ? (await cells[11].innerText()).trim() : "",
          latitude: null,
          longitude: null,
        });
      }

      const nextBtn = page
        .locator('button:has-text("Next"), a:has-text("Next"), [aria-label="Next page"]')
        .first();
      const nextEnabled = (await nextBtn.count()) > 0 && (await nextBtn.isEnabled());
      if (nextEnabled) {
        await nextBtn.click();
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
  console.log(`Scraping DPWH e-IPIS for ${CITY}...`);
  const rows = await scrape();
  console.log(`Found ${rows.length} project records.`);

  if (rows.length === 0) {
    console.warn("No records found — check selectors against the live DPWH portal.");
    return;
  }

  for (const row of rows) {
    await db
      .insert(dpwhProjects)
      .values(row)
      .onConflictDoUpdate({
        target: dpwhProjects.contractId,
        set: {
          description: row.description,
          category: row.category,
          status: row.status,
          budget: row.budget,
          amountPaid: row.amountPaid,
          progress: row.progress,
          contractor: row.contractor,
          startDate: row.startDate,
          completionDate: row.completionDate,
          infraYear: row.infraYear,
          sourceOfFunds: row.sourceOfFunds,
        },
      });
  }

  console.log(`Done. Upserted ${rows.length} DPWH projects.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
