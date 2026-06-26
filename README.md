# City of San Jose del Monte — People's Budget Portal

> *"Para sa bawat San Joseño"*

[![Live](https://img.shields.io/badge/live-budget--csjdm.vercel.app-black?logo=vercel)](https://budget-csjdm.vercel.app)
[![License: MIT](https://img.shields.io/badge/license-MIT-green)](LICENSE)

A citizen-built transparency tracker for **City of San Jose del Monte, Bulacan**. Follow where the money goes — annual budget, government contracts, and DPWH infrastructure projects — sourced entirely from Philippine open data portals.

> Not affiliated with the City Government of San Jose del Monte.

---

## Why This Exists

CSJDM is the 4th most populous city in the Philippines, yet its budget data is buried in spreadsheets on a government website most residents don't know exists. This site makes that data readable, searchable, and linkable — so ordinary San Joseños can ask: *"We spent how much on flood control — then why did 22 barangays still flood?"*

---

## Pages

| Page | What It Shows | Data Source | Updates |
|---|---|---|---|
| **Budget** | Annual income, expenditure, SEF, DRRF | BLGF | Annual (manual import) |
| **Procurement** | Awarded government contracts | PhilGEPS via BetterGov | Daily (cron) |
| **Projects** | DPWH infrastructure projects | DPWH e-IPIS via BetterGov | Daily (cron) |
| **Accountability** | Cross-referenced findings on spending vs. outcomes | All of the above | Annual (manual review) |

---

## Data Sources

- **[BLGF](https://blgf.gov.ph)** — Bureau of Local Government Finance. Annual LGU fiscal data: income, expenditures, SEF, and LDRRMF.
- **[PhilGEPS](https://philgeps.gov.ph)** — Philippine Government Electronic Procurement System. All awarded contracts involving CSJDM.
- **[DPWH](https://dpwh.gov.ph)** — Department of Public Works and Highways. Infrastructure project tracking.
- **[BetterGov.ph](https://data.bettergov.ph)** — Open data aggregator that indexes DPWH and PhilGEPS for fast search.

---

## Tech Stack

- **[Next.js 15](https://nextjs.org)** — App Router, ISR caching
- **[Neon](https://neon.tech)** — Serverless Postgres (fallback data store)
- **[Drizzle ORM](https://orm.drizzle.team)** — Type-safe DB queries
- **[BetterGov Meilisearch](https://search2.bettergov.ph)** — Live DPWH & PhilGEPS search index
- **[shadcn/ui](https://ui.shadcn.com)** — UI components
- **[Recharts](https://recharts.org)** — Budget charts
- **[Vercel](https://vercel.com)** — Hosting + daily cron job

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/jeromepolicarpio/budget-csjdm.git
cd budget-csjdm
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Then fill in `.env.local`:

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | Neon Postgres connection string |
| `CRON_SECRET` | Yes | Random secret for authenticating the daily cron job |
| `BETTERGOV_MEILISEARCH_KEY` | Yes | Read-only API key from [data.bettergov.ph](https://data.bettergov.ph) |
| `RESEND_API_KEY` | Yes | API key from [resend.com](https://resend.com) for the contact form |
| `CONTACT_EMAIL_TO` | Yes | Email address that receives contact form submissions |
| `BLGF_IMPORT_DATE` | Yes | Date of last BLGF import in `YYYY-MM-DD` format |

### 3. Push the database schema

```bash
npx drizzle-kit push
```

### 4. Import BLGF fiscal data

Opens a real browser window to bypass BLGF's WAF, downloads the annual Excel files, and upserts CSJDM rows into Neon.

```bash
npx tsx scripts/import-blgf.ts
```

### 5. Run locally

```bash
npm run dev
```

---

## Importing New BLGF Data

When BLGF publishes a new fiscal year (usually mid-year for the prior FY):

1. Find the new file URLs on [blgf.gov.ph/lgu-fiscal-data](https://blgf.gov.ph/lgu-fiscal-data/)
2. Add the year entry to `FILE_URLS` in `scripts/import-blgf.ts`
3. Run `npx tsx scripts/import-blgf.ts --years <YEAR>`
4. Update `BLGF_IMPORT_DATE` in your Vercel environment variables

---

## Architecture

```
BetterGov Meilisearch ──→ lib/bettergov.ts ──→ lib/queries.ts ──→ Pages
        (live, daily)             │
                                  └──→ Neon DB  (fallback + budget cache)
                                                       ↑
BLGF Excel (annual) ──→ scripts/import-blgf.ts ───────┘
```

Live data from BetterGov is always tried first. On failure, pages fall back to Neon. Budget data is always from Neon (imported from BLGF Excel files).

---

## License

MIT — data belongs to the public.
