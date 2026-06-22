import type { BudgetYear, Contract, DpwhProject } from "./types";

// ⚠️ PLACEHOLDER — NOT real BLGF figures. BetterGov has no public query API for dataset #9.
// To load real data: download CSV from data.bettergov.ph/datasets/9, filter for CSJDM, run npm run import:blgf
export const BUDGET_DATA: BudgetYear[] = [
  { year: 2020, income: 1_820_000_000, expenditure: 1_650_000_000, drrf: 91_000_000, sef: 182_000_000 },
  { year: 2021, income: 1_950_000_000, expenditure: 1_780_000_000, drrf: 97_500_000, sef: 195_000_000 },
  { year: 2022, income: 2_100_000_000, expenditure: 1_900_000_000, drrf: 105_000_000, sef: 210_000_000 },
  { year: 2023, income: 2_340_000_000, expenditure: 2_150_000_000, drrf: 117_000_000, sef: 234_000_000 },
  { year: 2024, income: 2_580_000_000, expenditure: 2_290_000_000, drrf: 129_000_000, sef: 258_000_000 },
];

// Seed PhilGEPS contract awards for CSJDM
// Replace with live PhilGEPS API or BetterGov procurement data
export const CONTRACTS: Contract[] = [
  { id: "PH-2024-001", title: "Supply of Potable Water to Resettlement Areas", awardee: "SJDM Water Consortium", amount: 45_000_000, category: "Water & Utilities", date: "2024-03-15", status: "Active" },
  { id: "PH-2024-002", title: "Road Rehabilitation - Muzon-Sapang Palay Road", awardee: "Suncon Builders Inc.", amount: 28_500_000, category: "Roads", date: "2024-05-10", status: "Completed" },
  { id: "PH-2024-003", title: "Flood Control Infrastructure - Barangay San Rafael I", awardee: "Metro Builders Corp.", amount: 62_000_000, category: "Flood Control", date: "2024-07-22", status: "Active" },
  { id: "PH-2024-004", title: "Construction of Multi-Purpose Hall - Brgy. Graceville", awardee: "Grandconst Builders Corp.", amount: 12_800_000, category: "Buildings", date: "2024-02-01", status: "Completed" },
  { id: "PH-2023-005", title: "Street Lighting Program Phase 2", awardee: "Luzon Electric Supply Co.", amount: 8_200_000, category: "Street Lighting", date: "2023-09-18", status: "Completed" },
  { id: "PH-2023-006", title: "Drainage Improvement - Minuyan District", awardee: "Construct PH Inc.", amount: 34_000_000, category: "Flood Control", date: "2023-11-05", status: "Active" },
];

// Seed DPWH infrastructure projects (from DPWH open data, filtered for CSJDM)
export const DPWH_PROJECTS: DpwhProject[] = [
  {
    contractId: "20CD0147",
    description: "CONSTRUCTION AND REHABILITATION OF SAN JOSE DEL MONTE SPORTS COMPLEX, BRGY. MINUYAN",
    category: "Buildings and Facilities",
    status: "Completed",
    budget: 14_106_670,
    amountPaid: 14_106_670,
    progress: 100,
    contractor: "GRANDCONST BUILDERS CORP.",
    startDate: "2020-11-26",
    completionDate: "2021-08-22",
    infraYear: "2020",
    sourceOfFunds: "GAA 2020",
    latitude: 14.8440908,
    longitude: 121.0776233,
  },
  {
    contractId: "21CD0089",
    description: "FLOOD CONTROL ALONG ANGAT RIVER TRIBUTARY, SAN JOSE DEL MONTE CITY",
    category: "Flood Control",
    status: "Completed",
    budget: 38_500_000,
    amountPaid: 38_500_000,
    progress: 100,
    contractor: "METRO BUILDERS CORP.",
    startDate: "2021-03-10",
    completionDate: "2022-01-15",
    infraYear: "2021",
    sourceOfFunds: "GAA 2021",
    latitude: 14.8520000,
    longitude: 121.0650000,
  },
  {
    contractId: "22CD0214",
    description: "ROAD WIDENING AND PAVEMENT OF MUZON-TUNGKONG MANGGA ROAD",
    category: "Roads and Bridges",
    status: "Completed",
    budget: 52_000_000,
    amountPaid: 52_000_000,
    progress: 100,
    contractor: "SUNCON BUILDERS INC.",
    startDate: "2022-06-01",
    completionDate: "2023-03-30",
    infraYear: "2022",
    sourceOfFunds: "GAA 2022",
    latitude: 14.8350000,
    longitude: 121.0600000,
  },
  {
    contractId: "23CD0301",
    description: "CONSTRUCTION OF EVACUATION CENTER, BRGY. SAN RAFAEL I, CSJDM",
    category: "Buildings and Facilities",
    status: "On-going",
    budget: 18_000_000,
    amountPaid: 9_000_000,
    progress: 50,
    contractor: "PHIL INFRA BUILDERS",
    startDate: "2023-08-15",
    completionDate: "2024-06-30",
    infraYear: "2023",
    sourceOfFunds: "GAA 2023",
    latitude: 14.8600000,
    longitude: 121.0800000,
  },
  {
    contractId: "24CD0102",
    description: "DRAINAGE IMPROVEMENT ALONG BALAGTAS CREEK, BRGY. MINUYAN PROPER",
    category: "Flood Control",
    status: "On-going",
    budget: 44_000_000,
    amountPaid: 11_000_000,
    progress: 25,
    contractor: "CONSTRUCT PH INC.",
    startDate: "2024-02-20",
    completionDate: "2025-02-19",
    infraYear: "2024",
    sourceOfFunds: "GAA 2024",
    latitude: 14.8410000,
    longitude: 121.0720000,
  },
];

export function formatPeso(amount: number): string {
  if (amount >= 1_000_000_000) return `₱${(amount / 1_000_000_000).toFixed(2)}B`;
  if (amount >= 1_000_000) return `₱${(amount / 1_000_000).toFixed(1)}M`;
  return `₱${amount.toLocaleString("en-PH")}`;
}
