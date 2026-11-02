import { test } from "node:test";
import assert from "node:assert/strict";
import {
  titleTokens,
  phaseOf,
  isSjdmTitle,
  fundingYear,
  matchAppropriations,
  type GaaLine,
} from "./match-appropriations";
import type { DpwhProject } from "./types";

// Real titles from the GAA (BetterGov Budget API) and DPWH e-IPIS, Nov 2026.

function project(over: Partial<DpwhProject> & Pick<DpwhProject, "contractId" | "description">): DpwhProject {
  return {
    category: "Other",
    status: "Completed",
    budget: 0,
    amountPaid: 0,
    progress: 100,
    contractor: "",
    startDate: "",
    completionDate: "",
    infraYear: "",
    sourceOfFunds: "",
    latitude: null,
    longitude: null,
    ...over,
  };
}

function line(name: string, year: number, amount = 100_000_000): GaaLine {
  return { key: `18-001|${name.toLowerCase()}`, name, year, amount };
}

test("titleTokens expands DPWH abbreviations and drops place words", () => {
  const gaa = titleTokens(
    "Construction of Bypass Road  ( Phase 8 )  at Doña Remedios Trinidad to San Jose del Monte City, Bulacan"
  );
  const dpwh = titleTokens(
    "CONST. OF BYPASS RD. (PHASE 8) AT DONA REMEDIOS TRINIDAD TO SAN JOSE DEL MONTE"
  );
  assert.deepEqual([...gaa].sort(), [...dpwh].sort());
});

test("titleTokens treats mis-encoded Doña spellings alike", () => {
  const a = titleTokens("Construction of Bypass Road at Do±a Remedios Trinidad to San Jose Del Monte, Bulacan");
  const b = titleTokens("Construction of bypass road at Donia Remedios Trinidad to San Jose Del Monte Bulacan");
  assert.deepEqual([...a].sort(), [...b].sort());
});

test("titleTokens reads roman phase numbers as digits", () => {
  assert.ok(titleTokens("Construction of Bypass (Alternate) Road (Phase V), Barangay Muzon").has("5"));
  assert.ok(titleTokens("CONSTRUCTION OF ROAD (PHASE II)").has("2"));
});

test("fundingYear reads the GAA year from source of funds, else infra year", () => {
  assert.equal(fundingYear(project({ contractId: "a", description: "", sourceOfFunds: "Regular Infra - GAA 2024 SSP", infraYear: "2025" })), 2024);
  assert.equal(fundingYear(project({ contractId: "b", description: "", sourceOfFunds: "", infraYear: "2023" })), 2023);
  assert.equal(fundingYear(project({ contractId: "c", description: "", sourceOfFunds: "Trust Funds 2018", infraYear: "" })), null);
});

test("matches a line through a long DPWH program prefix", () => {
  const [m] = matchAppropriations(
    [line("Construction of Bypass Road  ( Phase 8 )  at Doña Remedios Trinidad to San Jose del Monte City, Bulacan", 2024, 300_000_000)],
    [
      project({
        contractId: "24CD0001",
        sourceOfFunds: "Regular Infra - GAA 2024 SSP",
        infraYear: "2024",
        description:
          "CONVERGENCE & SPL. SUPP. PROG.-SUSTAINABLE INFRASTRUCTURE PROJS. ALLEVIATING GAPS (SIPAG)-INTERJURISDICTIONAL RDS. &/OR BRS. (OR,RDS. THAT TRAVERSE MULTIPLE LGU JURISDICTIONS), CONST. OF BYPASS RD. (PHASE 8) AT DONA REMEDIOS TRINIDAD TO SAN JOSE DEL MONTE",
      }),
    ]
  );
  assert.equal(m.project?.contractId, "24CD0001");
  assert.equal(m.confidence, "high");
});

test("tells phase 8 from phase 9 and uses each project once", () => {
  const lines = [
    line("Construction of Bypass Road  ( Phase 8 )  at Doña Remedios Trinidad to San Jose del Monte City, Bulacan", 2024),
    line("Construction of Bypass Road at Doña Remedios Trinidad to San Jose Del Monte City  ( Phase 9 ) , Bulacan", 2024),
  ];
  const projects = [
    project({ contractId: "P9", infraYear: "2024", sourceOfFunds: "Regular Infra - GAA 2024 SSP", description: "CONST. OF BYPASS RD. AT DONA REMEDIOS TRINIDAD TO SAN JOSE DEL MONTE CITY (PHASE 9), B" }),
    project({ contractId: "P8", infraYear: "2024", sourceOfFunds: "Regular Infra - GAA 2024 SSP", description: "CONST. OF BYPASS RD. (PHASE 8) AT DONA REMEDIOS TRINIDAD TO SAN JOSE DEL MONTE" }),
  ];
  const result = matchAppropriations(lines, projects);
  assert.equal(result[0].project?.contractId, "P8");
  assert.equal(result[1].project?.contractId, "P9");
});

test("rejects a pair whose titles name different phases", () => {
  // Real 2023 case: the Phase 7 line scored 0.86 against DPWH's Phase 3 project.
  const [m] = matchAppropriations(
    [line("Construction of Bypass Road (Phase 7) at Do±a Remedios Trinidad to San Jose del Monte City, Bulacan", 2023)],
    [project({ contractId: "P3", infraYear: "2023", sourceOfFunds: "Regular Infra - GAA 2023 CSSP", description: "CONST. OF BYPASS ROAD, DONA REMEDIOS TRINIDAD TO SAN JOSE DEL MONTE (PHASE 3) SAN JOSE DEL MONTE, BULACAN." })]
  );
  assert.equal(m.project, null);
});

test("phaseOf reads arabic and roman phase numbers", () => {
  assert.equal(phaseOf("Construction of Road (Phase II), Bulacan"), "2");
  assert.equal(phaseOf("CONST. OF BYPASS RD. (PHASE 8) AT DONA"), "8");
  assert.equal(phaseOf("Slope Protection, Phase 3B - Carissa 3-A"), "3b");
  assert.equal(phaseOf("Construction of Dike along Santo Cristo River"), null);
});

test("reads DPWH's '(P4)' and 'By-Pass' spellings", () => {
  // Real 2022 Phase 4 pair: DPWH writes "TO SJDMB, (P4)".
  const [m] = matchAppropriations(
    [line("Construction of Bypass Road at Dona Remedios Trinidad to San Jose Del Monte, Bulacan (Phase 4)", 2022, 50_000_000)],
    [project({ contractId: "22C00129", infraYear: "2022", sourceOfFunds: "Regular Infra - GAA 2022 CSSP", description: "CONVERGENCE AND SPECIAL SUPPORT PROGRAM-SUSTAINABLE INFRA PROJS. ALLEVIATING GAPS (SIPAG)-ACCESS ROADS AND/OR BRIDGES FROM THE NAT'L. ROAD/S LEAD. TO MAJOR/STRATEGIC PUBLIC BLDGS./FACILITIES, CONST. OF BYPASS ROAD AT DONA REMEDIOS TRINIDAD TO SJDMB, (P4)" })]
  );
  assert.equal(m.project?.contractId, "22C00129");
  assert.equal(phaseOf("CONST. OF BYPASS ROAD AT DONA REMEDIOS TRINIDAD TO SJDMB, (P4)"), "4");
  assert.ok(titleTokens("Construction of By-Pass Road").has("bypass"));
});

test("isSjdmTitle accepts DPWH's short spellings of the city", () => {
  assert.ok(isSjdmTitle("CONST. OF BYPASS RD. (PHASE 7) AT DONA REMEDIOS TRINIDAD TO SN JOSE DEL MONTE CITY"));
  assert.ok(isSjdmTitle("CONST. OF BYPASS ROAD AT DONA REMEDIOS TRINIDAD TO SJDMB, (P4)"));
  assert.ok(isSjdmTitle("CONSTRUCTION OF DIKE, CITY OF SAN JOSE DEL MONTE, BULACAN"));
  assert.ok(!isSjdmTitle("REHAB. OF SIBUL-DRT ROAD, DONA REMEDIOS TRINIDAD, BULACAN (PHASE 6)"));
  assert.ok(!isSjdmTitle("CONSTRUCTION OF ROAD, SAN JOSE, BATANGAS"));
});

test("uses contract amounts to keep same-title lines apart", () => {
  // Real 2024 case: two San Isidro buildings, ₱50M and ₱10M. Titles alone swapped them.
  const lines = [
    line("Construction of Multi - purpose Building, Barangay San Isidro, City of San Jose del Monte, Bulacan", 2024, 50_000_000),
    line("Construction of Multi - Purpose Building, Barangay San Isidro, San Jose del Monte, Bulacan", 2024, 10_000_000),
  ];
  const projects = [
    project({ contractId: "SMALL", infraYear: "2024", sourceOfFunds: "Regular Infra - GAA 2024 SSP", budget: 9_600_524, description: "CONSTRUCTION OF MULTI-PURPOSE BUILDING, BARANGAY SAN ISIDRO, SAN JOSE DEL MONTE, BULACAN" }),
    project({ contractId: "BIG", infraYear: "2024", sourceOfFunds: "Regular Infra - GAA 2024 SSP", budget: 49_004_920, description: "CONSTRUCTION OF MULTI-PURPOSE BUILDING, BARANGAY SAN ISIDRO, CITY OF SAN JOSE DEL MONTE, BULACAN" }),
  ];
  const [big, small] = matchAppropriations(lines, projects);
  assert.equal(big.project?.contractId, "BIG");
  assert.equal(small.project?.contractId, "SMALL");
});

test("rejects a contract far above or below its appropriation", () => {
  const [m] = matchAppropriations(
    [line("Construction of St. Bernadette Children's Hospital City of San Jose Del Monte, Bulacan", 2020, 5_000_000)],
    [project({ contractId: "H", infraYear: "2020", sourceOfFunds: "Regular Infra - GAA 2020 LP", budget: 28_199_921, description: "CONSTRUCTION OF ST. BERNADETTE CHILDREN'S HOSPITAL, BRGY. MUZON, SAN JOSE DEL MONTE CITY, BULACAN" })]
  );
  assert.equal(m.project, null);
});

test("phaseOf reads hyphenated, abbreviated and lettered phases", () => {
  assert.equal(phaseOf("Construction of Road, Phase-2"), "2");
  assert.equal(phaseOf("CONST. OF ROAD PH. 3"), "3");
  assert.equal(phaseOf("Construction of Road, Phase 1-A"), "1");
  assert.equal(phaseOf("Multi-purpose building, Phase IV"), "4");
});

test("never matches a project funded in another year", () => {
  const [m] = matchAppropriations(
    [line("Construction of Dike along Santo Cristo River, Barangay Kaypian, San Jose del Monte City, Bulacan", 2024)],
    [project({ contractId: "X", infraYear: "2023", sourceOfFunds: "Regular Infra - GAA 2023 CSSP", description: "CONSTRUCTION OF DIKE ALONG SANTO CRISTO RIVER, BARANGAY KAYPIAN, SAN JOSE DEL MONTE CITY, BULACAN" })]
  );
  assert.equal(m.project, null);
  assert.equal(m.confidence, null);
});

test("leaves a line unmatched when no title is close enough", () => {
  const [m] = matchAppropriations(
    [line("Construction of Multi-Purpose Building, St. Bernadette Children's Hospital, Brgy. Kaybanban, San Jose Del Monte City, Bulacan", 2021)],
    [project({ contractId: "Y", infraYear: "2021", sourceOfFunds: "Regular Infra - GAA 2021 LP", description: "CONSTRUCTION OF ROAD, BARANGAY MUZON, CITY OF SAN JOSE DEL MONTE, BULACAN" })]
  );
  assert.equal(m.project, null);
});

test("keeps input order in the result", () => {
  const lines = [line("A road one", 2024), line("Construction of Dike along Santo Cristo River, Barangay Kaypian", 2024)];
  const result = matchAppropriations(lines, []);
  assert.deepEqual(result.map((r) => r.line.name), lines.map((l) => l.name));
});
