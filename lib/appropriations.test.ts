import { test } from "node:test";
import assert from "node:assert/strict";
import { summarizeYears, floodLines, bypassLines, slice } from "./appropriations";
import type { AppropriationMatch } from "./match-appropriations";
import type { DpwhProject } from "./types";

function project(contractId: string, budget: number, status: string): DpwhProject {
  return {
    contractId, description: contractId, category: "Other", status, budget,
    amountPaid: 0, progress: 0, contractor: "", startDate: "", completionDate: "",
    infraYear: "", sourceOfFunds: "", latitude: null, longitude: null,
  };
}

function m(name: string, year: number, amount: number, p: DpwhProject | null, confidence: "high" | "medium" | null = p ? "high" : null): AppropriationMatch {
  return { line: { key: name, name, year, amount }, project: p, score: p ? 1 : 0, confidence };
}

const matches: AppropriationMatch[] = [
  m("Construction of Dike along Santo Cristo River, Barangay Kaypian", 2024, 100, project("A", 96, "Completed")),
  m("Construction of Bypass Road (Phase 8) at Doña Remedios Trinidad to San Jose del Monte City", 2024, 300, project("B", 284, "On-Going")),
  m("Construction of Multi-Purpose Building, Barangay Citrus", 2024, 10, null),
  m("Construction of Flood Control Structure, Barangay Muzon", 2026, 50, null),
  m("Construction of Bypass Road at Do±a Remedios Trinidad to San Jose Del Monte, Bulacan", 2021, 190, project("C", 188, "Completed"), "medium"),
];

test("summarizeYears totals each year and flags years DPWH has not published", () => {
  const years = summarizeYears(matches);
  assert.deepEqual(years.map((y) => y.year), [2021, 2024, 2026]);
  const y2024 = years.find((y) => y.year === 2024)!;
  assert.equal(y2024.lines, 3);
  assert.equal(y2024.enacted, 410);
  assert.equal(y2024.matched, 2);
  assert.equal(y2024.contracted, 380);
  assert.equal(y2024.completed, 1);
  assert.equal(y2024.ongoing, 1);
  assert.equal(y2024.published, true);
  assert.equal(years.find((y) => y.year === 2026)!.published, false);
  assert.equal(years.find((y) => y.year === 2021)!.mediumConfidence, 1);
});

test("floodLines keeps flood-control lines from published years only", () => {
  const trail = { matches, years: summarizeYears(matches) };
  const flood = floodLines(trail);
  // The 2026 flood line is left out: DPWH has no 2026 records to compare yet.
  assert.deepEqual(flood.matches.map((x) => x.line.year), [2024]);
  assert.equal(flood.enacted, 100);
  assert.equal(flood.completed, 1);
});

test("bypassLines collects every Doña Remedios Trinidad phase in year order", () => {
  const trail = { matches, years: summarizeYears(matches) };
  const bypass = bypassLines(trail);
  assert.deepEqual(bypass.matches.map((x) => x.line.year), [2021, 2024]);
  assert.equal(bypass.enacted, 490);
  assert.equal(bypass.contracted, 472);
  assert.equal(bypass.firstYear, 2021);
  assert.equal(bypass.lastYear, 2024);
});

test("slice of nothing is all zeros", () => {
  const s = slice([]);
  assert.equal(s.enacted, 0);
  assert.equal(s.matched, 0);
  assert.equal(s.firstYear, 0);
});
