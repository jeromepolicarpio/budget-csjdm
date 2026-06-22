# City of San Jose del Monte — People's Budget Portal

> *"Para sa bawat San Joseño"*

A civic transparency tracker for **City of San Jose del Monte, Bulacan**. Follow where the money goes — annual budget, government contracts, and DPWH infrastructure projects — sourced entirely from Philippine open data portals.

**Live:** [csjdm-budget.vercel.app](https://csjdm-budget.vercel.app)

---

## What's Inside

| Page | Data Source | Updates |
|---|---|---|
| **Budget** | BLGF — Statement of Receipts & Expenditures | Annual (manual import) |
| **Procurement** | PhilGEPS via BetterGov Meilisearch | Hourly (live) |
| **Projects** | DPWH e-IPIS via BetterGov Meilisearch | Hourly (live) |
| **Accountability** | LDRRMF & SEF from BLGF | Annual (manual import) |

---

## Data Sources

- **[BLGF](https://blgf.gov.ph)** — Bureau of Local Government Finance. Annual LGU fiscal data: income, expenditures, SEF, and LDRRMF.
- **[PhilGEPS](https://philgeps.gov.ph)** — Philippine Government Electronic Procurement System. All awarded contracts involving CSJDM.
- **[DPWH](https://dpwh.gov.ph)** — Department of Public Works and Highways. Infrastructure project tracking.
- **[BetterGov.ph](https://data.bettergov.ph)** — Open data aggregator that indexes DPWH and PhilGEPS for fast search.

> Not affiliated with the City Government of San Jose del Monte.

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
git clone https://github.com/jeromepolicarpio/csjdm-budget.git
cd csjdm-budget
npm install
```

### 2. Set up environment

```bash
cp .env.example .env.local
# Fill in DATABASE_URL (Neon connection string)
# Fill in CRON_SECRET (any random string)
```

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

---

## Architecture

```
BetterGov Meilisearch ──→ lib/bettergov.ts ──→ lib/queries.ts ──→ Pages
        (live, hourly)            │
                                  └──→ Neon DB  (fallback + budget cache)
                                                       ↑
BLGF Excel (annual) ──→ scripts/import-blgf.ts ───────┘
```

Live data from BetterGov is always tried first. On failure, pages fall back to Neon. Budget data is always from Neon (imported from BLGF Excel files).

---

## License

MIT — data belongs to the public.
