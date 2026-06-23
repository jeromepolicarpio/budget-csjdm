# Pre-Launch Checklist — People's Budget Portal

## Frontend / UX

- [x] **OG image for Facebook preview** — Created `app/opengraph-image.tsx` using `next/og` (1200×630, green gradient, portal name + tagline + live data badges).
- [x] **"About this site" section** — Added visible card on home page above nav cards; explains citizen-built, not city-affiliated, sources BLGF/DPWH/PhilGEPS, contact link.
- [x] **Mobile check** — Verified good on mobile.
- [x] **"Data as of" / last updated timestamp** — Budget page shows `BLGF_IMPORT_DATE` env var when set; procurement/projects pages note "data refreshed hourly" via BetterGov.
- [x] **Share buttons on Accountability page** — `ShareButton` component added to each finding; uses Web Share API on mobile, clipboard fallback on desktop.
- [x] **Filipino/Tagalog option** — Added "Saan napunta ang pera ng bayan?" tagline to hero; Tagalog subtitles on all four nav cards ("Kita at Gastos ng Lungsod", "Sino ang Binigyan ng Kontrata?", etc.).
- [x] **Contact / tip line** — "Spot an error? Email the maintainer" link added to Accountability page; also in About section on home page.

---

## Backend / Data Credibility

- [x] **Move Meilisearch API key to env var** — moved to `BETTERGOV_MEILISEARCH_KEY` in `.env.local`; updated `.env.example`; `lib/bettergov.ts` now reads `process.env.BETTERGOV_MEILISEARCH_KEY`.
- [x] **BLGF data freshness label** — Budget page shows "Budget data last imported: [date]" when `BLGF_IMPORT_DATE` env var is set. Note: `fetchLiveBlgfData()` still returns `[]`; data comes from Neon DB seed — set `BLGF_IMPORT_DATE` in env after each import.
- [x] **Zero-amount contracts are misleading** — `normalizePhilGepsHit` now returns `null` for any contract with `amount === 0`, filtering them out of all contract lists.
- [x] **PhilGEPS search misses abbreviations** — `fetchLivePhilGeps` now queries "San Jose del Monte", "SJDM", and "San José del Monte" in parallel and deduplicates by `reference_id`.
- [x] **Category fallback is too broad** — expanded `categorizeTitle()` with more PH gov project keywords; added two new categories: "Livelihood" and "Parks & Public Space".
- [x] **Hardcoded accountability figures will go stale** — findings copy now says "estimated" + "last verified: June 2025"; Key Numbers rows show source freshness ("live from DPWH", "as of June 2025", etc.).
- [x] **No source links on individual data points** — PhilGEPS contract rows now link to `notices.philgeps.gov.ph` by reference_id. Accountability page has a "Verify the data yourself" section linking to COA, BetterGov, and BLGF.
- [x] **No error fallback UI** — created `app/error.tsx` (Next.js App Router error boundary) showing "Data temporarily unavailable" with a retry button.
- [x] **DPWH status values are inconsistent** — `normalizeDpwhHit` now normalizes On-going, Completed, Terminated, Suspended, and Not Yet Started (case-insensitive).

---

## Missing Data Sources (credibility boosters)

- [x] **COA Annual Audit Reports** — Added link to COA Bulacan LGU audit reports in the Accountability page "Verify the data yourself" card.
- [x] **Barangay-level breakdown** — `lib/barangay.ts` extracts mentions from DPWH descriptions; Projects page shows top 15 barangays by total budget with a mini bar chart and share %.
- [x] **Per-capita spending** — Added "Per Capita Spending" stat to home page hero (income / PSA 2020 population 651,816).
- [x] **Year-over-year change indicators** — Budget table shows ↑/↓ arrows with green/red coloring on income and expenditure columns, comparing each year to the previous.

---

## Nice to Have (post-launch)

- [x] Dark mode — `next-themes` + `ThemeProvider` in layout; Moon/Sun toggle in Navbar (respects system preference).
- [x] Custom 404 page — `app/not-found.tsx` with friendly message and "Go to homepage" link.
- [x] Sitemap / robots.txt for SEO — `app/sitemap.ts` and `app/robots.ts` created; served at `/sitemap.xml` and `/robots.txt`.
- [x] Analytics — `@vercel/analytics` installed; `<Analytics />` added to root layout.
