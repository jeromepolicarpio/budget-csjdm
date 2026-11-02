import { test } from "node:test";
import assert from "node:assert/strict";
import { pickSjdmProjects } from "./bettergov";
import type { DpwhProject } from "./types";

function project(contractId: string, description: string, infraYear: string): DpwhProject {
  return {
    contractId, description, infraYear, category: "Other", status: "Completed", budget: 0,
    amountPaid: 0, progress: 0, contractor: "", startDate: "", completionDate: "",
    sourceOfFunds: "", latitude: null, longitude: null,
  };
}

test("pickSjdmProjects keeps SJDM titles in any spelling, once, newest first", () => {
  const byName = [
    project("A", "CONSTRUCTION OF DIKE, CITY OF SAN JOSE DEL MONTE, BULACAN", "2022"),
    project("X", "CONSTRUCTION OF ROAD, SAN JOSE, BATANGAS", "2025"),
  ];
  const byShortName = [
    project("B", "CONST. OF BYPASS ROAD AT DONA REMEDIOS TRINIDAD TO SJDMB, (P4)", "2022"),
    project("A", "CONSTRUCTION OF DIKE, CITY OF SAN JOSE DEL MONTE, BULACAN", "2022"),
  ];
  const bySn = [project("C", "CONST. OF BYPASS RD. (PHASE 7) AT DONA REMEDIOS TRINIDAD TO SN JOSE DEL MONTE CITY", "2023")];

  const picked = pickSjdmProjects([byName, byShortName, bySn]);
  assert.deepEqual(picked.map((p) => p.contractId), ["C", "A", "B"]);
});

test("pickSjdmProjects drops records with no contract id", () => {
  assert.equal(pickSjdmProjects([[project("", "ROAD, SAN JOSE DEL MONTE", "2024")]]).length, 0);
});
