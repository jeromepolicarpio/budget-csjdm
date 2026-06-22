/**
 * Downloads and imports BLGF LGU fiscal data for CSJDM into Neon.
 *
 * Uses Playwright to bypass the Azure WAF on blgf.gov.ph, downloads the
 * annual SRE, SEF, and LDRRMF Excel files, then parses them with xlsx.
 *
 * Column map (verified against FY2024 and FY2025 SRE files):
 *   col[3]  = LGU NAME
 *   col[22] = TOTAL CURRENT OPERATING INCOME
 *   col[32] = TOTAL CURRENT OPERATING EXPENDITURES
 *
 * SEF file:  col[3] = LGU NAME, col[5] = RPT Collections (SEF)
 * LDRRMF:    col[3] = LGU NAME, col[8] = TOTAL LDRRMF Budget Appropriation
 *
 * Usage:
 *   npx tsx scripts/import-blgf.ts
 *   npx tsx scripts/import-blgf.ts --years 2024,2025
 *   npx tsx scripts/import-blgf.ts --dir ./blgf-data  (use pre-downloaded files)
 */
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config(); // fallback to .env
import { chromium } from "playwright";
import * as fs from "fs";
import * as path from "path";
import * as XLSX from "xlsx";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { budgetYears } from "../db/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const BLGF_BASE = "https://blgf.gov.ph";
const CSJDM = "san jose del monte";

// Known file URLs keyed by year — update when BLGF publishes new annual data
const FILE_URLS: Record<number, { sre: string; sef: string; ldrrmf: string }> = {
  2025: {
    sre:    `${BLGF_BASE}/wp-content/uploads/2026/05/By-LGU-SRE-2025.xlsx`,
    sef:    `${BLGF_BASE}/wp-content/uploads/2026/06/FY2025-SEF-Income-and-Expenditures.xlsx`,
    ldrrmf: `${BLGF_BASE}/wp-content/uploads/2026/06/FY2025-LDRRMF-by-LGU.xlsx`,
  },
  2024: {
    sre:    `${BLGF_BASE}/wp-content/uploads/2025/08/By-LGU-SRE-2024.xlsx`,
    sef:    `${BLGF_BASE}/wp-content/uploads/2025/06/FY2024-SEF-Income-and-Expenditures.xlsx`,
    ldrrmf: `${BLGF_BASE}/wp-content/uploads/2025/06/FY2024-LDRRMF-by-LGU.xlsx`,
  },
};

function parseArgs() {
  const args = process.argv.slice(2);
  const yearsIdx = args.indexOf("--years");
  const dirIdx = args.indexOf("--dir");
  return {
    years: yearsIdx >= 0
      ? args[yearsIdx + 1].split(",").map(Number)
      : Object.keys(FILE_URLS).map(Number).sort((a, b) => b - a),
    dir: dirIdx >= 0 ? args[dirIdx + 1] : null,
  };
}

async function downloadWithBrowser(
  urls: string[],
  tmpDir: string
): Promise<void> {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });

  // Warm up session to pass WAF challenge
  await page.goto(`${BLGF_BASE}/lgu-fiscal-data/`, {
    waitUntil: "networkidle",
    timeout: 40000,
  });
  await page.waitForTimeout(1500);

  for (const url of urls) {
    const fname = path.join(tmpDir, path.basename(url));

    const result = await page.evaluate(async (u: string) => {
      try {
        const r = await fetch(u, { credentials: "include" });
        if (!r.ok) return { ok: false as const, status: r.status };
        const buf = await r.arrayBuffer();
        return { ok: true as const, data: Array.from(new Uint8Array(buf)), size: buf.byteLength };
      } catch (e: unknown) {
        return { ok: false as const, status: 0, error: String(e) };
      }
    }, url);

    if (result.ok && result.size > 10_000 && result.data[0] === 0x50) {
      fs.writeFileSync(fname, Buffer.from(result.data));
      console.log(`  ✓ ${path.basename(fname)} (${(result.size / 1024).toFixed(0)}KB)`);
    } else {
      console.warn(`  ✗ ${path.basename(url)} — status=${result.status}`);
    }
  }

  await browser.close();
}

function findCsjdmRow(ws: XLSX.WorkSheet): (number | string | null)[] | null {
  const rows = XLSX.utils.sheet_to_json<(number | string | null)[]>(ws, {
    header: 1,
    defval: null,
  });
  return (
    rows.find((r) =>
      r.some(
        (c) => typeof c === "string" && c.toLowerCase().includes(CSJDM)
      )
    ) ?? null
  );
}

function num(v: unknown): number {
  if (typeof v === "number") return v;
  const n = parseFloat(String(v ?? "").replace(/[^\d.-]/g, ""));
  return isNaN(n) ? 0 : n;
}

function parseSre(filePath: string, year: number) {
  const wb = XLSX.readFile(filePath);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const row = findCsjdmRow(ws);
  if (!row) throw new Error(`CSJDM not found in SRE file: ${filePath}`);
  return {
    year,
    income: Math.round(num(row[22])),
    expenditure: Math.round(num(row[32])),
  };
}

function parseSef(filePath: string): number {
  const wb = XLSX.readFile(filePath);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const row = findCsjdmRow(ws);
  if (!row) throw new Error(`CSJDM not found in SEF file: ${filePath}`);
  return Math.round(num(row[5]));
}

function parseLdrrmf(filePath: string): number {
  const wb = XLSX.readFile(filePath);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const row = findCsjdmRow(ws);
  if (!row) throw new Error(`CSJDM not found in LDRRMF file: ${filePath}`);
  return Math.round(num(row[8]));
}

async function main() {
  const { years, dir } = parseArgs();
  const tmpDir = dir ?? "blgf-data";
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  // Collect URLs that need downloading
  const urlsNeeded: string[] = [];
  for (const year of years) {
    const urls = FILE_URLS[year];
    if (!urls) {
      console.warn(`No known URLs for FY${year} — skipping`);
      continue;
    }
    for (const u of [urls.sre, urls.sef, urls.ldrrmf]) {
      const cached = path.join(tmpDir, path.basename(u));
      if (!fs.existsSync(cached) || fs.statSync(cached).size < 10_000) {
        urlsNeeded.push(u);
      }
    }
  }

  if (urlsNeeded.length > 0) {
    console.log(`Downloading ${urlsNeeded.length} file(s) from BLGF...`);
    await downloadWithBrowser(urlsNeeded, tmpDir);
  }

  for (const year of years) {
    const urls = FILE_URLS[year];
    if (!urls) continue;

    const sreFile = path.join(tmpDir, path.basename(urls.sre));
    const sefFile = path.join(tmpDir, path.basename(urls.sef));
    const ldrrmfFile = path.join(tmpDir, path.basename(urls.ldrrmf));

    const missing = [sreFile, sefFile, ldrrmfFile].filter(
      (f) => !fs.existsSync(f) || fs.statSync(f).size < 10_000
    );
    if (missing.length > 0) {
      console.warn(`FY${year}: missing files — ${missing.map((f) => path.basename(f)).join(", ")}`);
      continue;
    }

    const sre = parseSre(sreFile, year);
    const sef = parseSef(sefFile);
    const drrf = parseLdrrmf(ldrrmfFile);
    const row = { ...sre, sef, drrf };

    await db
      .insert(budgetYears)
      .values(row)
      .onConflictDoUpdate({
        target: budgetYears.year,
        set: {
          income: row.income,
          expenditure: row.expenditure,
          sef: row.sef,
          drrf: row.drrf,
        },
      });

    console.log(
      `✓ FY${year}: income=₱${(row.income / 1e9).toFixed(3)}B  ` +
      `exp=₱${(row.expenditure / 1e9).toFixed(3)}B  ` +
      `sef=₱${(row.sef / 1e6).toFixed(1)}M  ` +
      `drrf=₱${(row.drrf / 1e6).toFixed(1)}M`
    );
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
