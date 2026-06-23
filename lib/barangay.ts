import type { DpwhProject } from "./types";

// All 64 barangays of City of San Jose del Monte, Bulacan
// Aliases handle common abbreviations found in DPWH project descriptions.
const BARANGAYS: { name: string; aliases: string[] }[] = [
  { name: "Bagong Buhay I",          aliases: ["bagong buhay i", "bagong buhay 1"] },
  { name: "Bagong Buhay II",         aliases: ["bagong buhay ii", "bagong buhay 2"] },
  { name: "Bagong Buhay III",        aliases: ["bagong buhay iii", "bagong buhay 3"] },
  { name: "Bagong Nayon I",          aliases: ["bagong nayon i", "bagong nayon 1"] },
  { name: "Bagong Nayon II",         aliases: ["bagong nayon ii", "bagong nayon 2"] },
  { name: "Bagong Nayon III",        aliases: ["bagong nayon iii", "bagong nayon 3"] },
  { name: "Balagtas",                aliases: ["balagtas"] },
  { name: "Banca-Banca",            aliases: ["banca-banca", "banca banca"] },
  { name: "Cay Pombo",               aliases: ["cay pombo"] },
  { name: "Citrus",                  aliases: ["citrus"] },
  { name: "Ciudad Real",             aliases: ["ciudad real"] },
  { name: "Dulong Bayan I",          aliases: ["dulong bayan i", "dulong bayan 1"] },
  { name: "Dulong Bayan II",         aliases: ["dulong bayan ii", "dulong bayan 2"] },
  { name: "Fatima I",                aliases: ["fatima i", "fatima 1"] },
  { name: "Fatima II",               aliases: ["fatima ii", "fatima 2"] },
  { name: "Fatima III",              aliases: ["fatima iii", "fatima 3"] },
  { name: "Fatima IV",               aliases: ["fatima iv", "fatima 4"] },
  { name: "Fatima V",                aliases: ["fatima v", "fatima 5"] },
  { name: "Francisco Homes-Guijo",   aliases: ["francisco homes-guijo", "francisco homes guijo"] },
  { name: "Francisco Homes-Mulawin", aliases: ["francisco homes-mulawin", "francisco homes mulawin"] },
  { name: "Francisco Homes-Narra",   aliases: ["francisco homes-narra", "francisco homes narra"] },
  { name: "Francisco Homes-Yakal",   aliases: ["francisco homes-yakal", "francisco homes yakal"] },
  { name: "Gaya-Gaya",               aliases: ["gaya-gaya", "gaya gaya"] },
  { name: "Graceville",              aliases: ["graceville"] },
  { name: "Gumaok Central",          aliases: ["gumaok central"] },
  { name: "Gumaok East",             aliases: ["gumaok east"] },
  { name: "Gumaok West",             aliases: ["gumaok west"] },
  { name: "Kaybanban",               aliases: ["kaybanban"] },
  { name: "Kaypian",                 aliases: ["kaypian"] },
  { name: "Lawang Pare",             aliases: ["lawang pare"] },
  { name: "Maharlika",               aliases: ["maharlika"] },
  { name: "Malanday",                aliases: ["malanday"] },
  { name: "Malolos",                 aliases: ["malolos"] },
  { name: "Minuyan I",               aliases: ["minuyan i", "minuyan 1"] },
  { name: "Minuyan II",              aliases: ["minuyan ii", "minuyan 2"] },
  { name: "Minuyan III",             aliases: ["minuyan iii", "minuyan 3"] },
  { name: "Minuyan IV",              aliases: ["minuyan iv", "minuyan 4"] },
  { name: "Minuyan V",               aliases: ["minuyan v", "minuyan 5"] },
  { name: "Minuyan Proper",          aliases: ["minuyan proper"] },
  { name: "Muzon",                   aliases: ["muzon"] },
  { name: "Nagkaisang Nayon",        aliases: ["nagkaisang nayon"] },
  { name: "Niugan",                  aliases: ["niugan"] },
  { name: "Paltok",                  aliases: ["paltok"] },
  { name: "Pandayan",                aliases: ["pandayan"] },
  { name: "Paradise III",            aliases: ["paradise iii", "paradise 3"] },
  { name: "Pasong Putik",            aliases: ["pasong putik"] },
  { name: "Poblacion",               aliases: ["poblacion"] },
  { name: "Pop. Uno",                aliases: ["pop. uno", "poblacion uno"] },
  { name: "San Isidro",              aliases: ["san isidro"] },
  { name: "San Manuel",              aliases: ["san manuel"] },
  { name: "San Martin I",            aliases: ["san martin i", "san martin 1"] },
  { name: "San Martin II",           aliases: ["san martin ii", "san martin 2"] },
  { name: "San Martin III",          aliases: ["san martin iii", "san martin 3"] },
  { name: "San Martin IV",           aliases: ["san martin iv", "san martin 4"] },
  { name: "San Pedro",               aliases: ["san pedro"] },
  { name: "San Rafael I",            aliases: ["san rafael i", "san rafael 1"] },
  { name: "San Rafael II",           aliases: ["san rafael ii", "san rafael 2"] },
  { name: "San Rafael III",          aliases: ["san rafael iii", "san rafael 3"] },
  { name: "San Rafael IV",           aliases: ["san rafael iv", "san rafael 4"] },
  { name: "San Roque",               aliases: ["san roque"] },
  { name: "Sapang Palay Proper",     aliases: ["sapang palay proper", "sapang palay"] },
  { name: "Sta. Cruz",               aliases: ["sta. cruz", "sta cruz", "santa cruz"] },
  { name: "Sto. Cristo",             aliases: ["sto. cristo", "sto cristo", "santo cristo"] },
  { name: "Tungkong Mangga",         aliases: ["tungkong mangga"] },
];

export interface BarangayBudget {
  name: string;
  totalBudget: number;
  projectCount: number;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Longer aliases shadow shorter ones (e.g. "poblacion uno" wins over "poblacion")
const SORTED_ALIASES: { alias: string; name: string }[] = BARANGAYS
  .flatMap((brgy) => brgy.aliases.map((alias) => ({ alias, name: brgy.name })))
  .sort((a, b) => b.alias.length - a.alias.length);

export function extractBarangay(description: string): string | null {
  const lower = description.toLowerCase();

  // First pass: explicit prefix forms — unambiguous
  for (const { alias, name } of SORTED_ALIASES) {
    if (
      lower.includes(`brgy. ${alias}`) ||
      lower.includes(`brgy ${alias}`) ||
      lower.includes(`barangay ${alias}`)
    ) {
      return name;
    }
  }

  // Second pass: bare word-boundary match; longer aliases checked first
  for (const { alias, name } of SORTED_ALIASES) {
    const re = new RegExp(`(?<![a-z])${escapeRegex(alias)}(?![a-z])`);
    if (re.test(lower)) {
      return name;
    }
  }

  return null;
}

export function aggregateByBarangay(projects: DpwhProject[]): BarangayBudget[] {
  const map = new Map<string, BarangayBudget>();

  for (const project of projects) {
    const name = extractBarangay(project.description);
    if (!name) continue;

    const existing = map.get(name);
    if (existing) {
      existing.totalBudget += project.budget;
      existing.projectCount += 1;
    } else {
      map.set(name, { name, totalBudget: project.budget, projectCount: 1 });
    }
  }

  return Array.from(map.values()).sort((a, b) => b.totalBudget - a.totalBudget);
}
