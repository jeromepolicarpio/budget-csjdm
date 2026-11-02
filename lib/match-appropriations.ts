import type { DpwhProject } from "./types";

/**
 * Pairs enacted budget lines (GAA, via the BetterGov Budget API) with the DPWH
 * e-IPIS projects that carried them out.
 *
 * The two sources share no id. They share a funding year and a title, but
 * DPWH titles add a long program prefix ("CONVERGENCE & SPL. SUPP. PROG.-…"),
 * abbreviate ("CONST.", "RD.") and spell Doña several ways. So a line matches
 * a project when nearly all of the line's title words appear in the project's
 * title, within the same funding year, the contract is 50–105% of the
 * appropriation, and each project is used once. A second pass matches the
 * remaining lines to the parts of contracts that bundle several works, when
 * those lines' appropriations add up to the bundle's contract.
 *
 * A match is a lead with a stated confidence, not proof that the project is
 * the line. Unmatched lines mean "no matching DPWH record found", nothing more.
 */

export type GaaLine = {
  /** BetterGov family key, stable across years. */
  key: string;
  name: string;
  year: number;
  /** Appropriation in pesos: the authority to spend, not spending. */
  amount: number;
};

export type Confidence = "high" | "medium";

export type AppropriationMatch = {
  line: GaaLine;
  project: DpwhProject | null;
  /** Share of the line's title words found in the project's title (or bundle part), 0–1. */
  score: number;
  confidence: Confidence | null;
  /** True when the project is one contract covering several budget lines. */
  bundled: boolean;
};

const HIGH = 0.9;
const MEDIUM = 0.75;
/** Lines with fewer distinct words than this are too vague to match. */
const MIN_TOKENS = 3;
/**
 * A contract is awarded at or below its appropriation: across 320 SJDM matches
 * (2020–2025), 314 came in at 90–100%, and every one outside 50–105% was a
 * title match to the wrong project. Contracts not yet awarded (₱0) are allowed.
 */
const MIN_CONTRACT_SHARE = 0.5;
const MAX_CONTRACT_SHARE = 1.05;

function amountsAgree(appropriation: number, contract: number): boolean {
  if (contract <= 0 || appropriation <= 0) return true;
  const share = contract / appropriation;
  return share >= MIN_CONTRACT_SHARE && share <= MAX_CONTRACT_SHARE;
}

const PLACE_PHRASES = [
  /city of san jose del monte/g,
  /san jose del monte city/g,
  /san jose del monte/g,
  /province of bulacan/g,
  /bulacan/g,
];

const ABBREVIATIONS: Record<string, string> = {
  const: "construction",
  constn: "construction",
  rehabilation: "rehabilitation",
  rehab: "rehabilitation",
  rd: "road",
  rds: "roads",
  br: "bridge",
  brs: "bridges",
  bldg: "building",
  impvt: "improvement",
  projs: "projects",
  prog: "program",
  spl: "special",
  supp: "support",
};

const STOPWORDS = new Set([
  "of", "at", "to", "the", "and", "or", "with", "in", "on", "for", "along",
  "including", "incl", "a", "an",
  // Place words: every line in this portal is in SJDM, so they carry no signal.
  "city", "province", "prov", "barangay", "brgy", "sjdm", "sjdmb",
  // Doña, as the sources spell it: "Doña", "Dona", "Donia", and "Do±a" (→ "do a").
  "dona", "donia", "do",
]);

const ROMAN: Record<string, string> = {
  i: "1", ii: "2", iii: "3", iv: "4", v: "5", vi: "6",
  vii: "7", viii: "8", ix: "9", x: "10", xi: "11", xii: "12",
};

/** Lowercase, strip accents, and spell out DPWH's shorthand that spans word breaks. */
function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    // "Children's" and DPWH's "CHILDRENS" must read alike.
    .replace(/['’`]/g, "")
    .replace(/multi\s*-?\s*purpose/g, "multipurpose")
    .replace(/\bmpb\b/g, "multipurpose building")
    .replace(/by\s*-\s*pass/g, "bypass")
    .replace(/\(\s*p\s*(\d+)\s*\)/g, " phase $1 ");
}

/**
 * True when a DPWH title names SJDM, including its short spellings
 * ("SJDM", "SJDMB", "SN JOSE DEL MONTE"). Wider than the site's
 * "san jose del monte" filter, which misses projects DPWH abbreviates.
 */
export function isSjdmTitle(title: string): boolean {
  return /\bs(a)?n\.?\s+jose\s+del\s+monte\b|\bsjdmb?\b/.test(normalizeTitle(title));
}

export function titleTokens(title: string): Set<string> {
  let t = normalizeTitle(title);
  for (const re of PLACE_PHRASES) t = t.replace(re, " ");

  const tokens = new Set<string>();
  for (const raw of t.split(/[^a-z0-9]+/)) {
    if (!raw) continue;
    const word = ROMAN[raw] ?? ABBREVIATIONS[raw] ?? raw;
    if (!STOPWORDS.has(word)) tokens.add(word);
  }
  return tokens;
}

/** The phase a title names ("Phase II" → "2", "Phase 3B" → "3b"), or null. */
export function phaseOf(title: string): string | null {
  const raw = /\bph(?:ase)?s?\.?[\s-]*([ivx]+|\d+[a-z]?)\b/.exec(normalizeTitle(title))?.[1];
  if (!raw) return null;
  return ROMAN[raw] ?? raw;
}

/** The GAA year a DPWH project was funded from: "GAA 2024" in its source of funds, else its infra year. */
export function fundingYear(p: DpwhProject): number | null {
  const fromSource = /GAA\s*(\d{4})/i.exec(p.sourceOfFunds)?.[1];
  if (fromSource) return Number(fromSource);
  if (/^\d{4}$/.test(p.infraYear) && !p.sourceOfFunds) return Number(p.infraYear);
  return null;
}

/**
 * The works a bundled contract lists, or [] when it lists one. DPWH writes
 * bundles as numbered lists ("1.MPB BRGY. BAGONG BUHAY 1, 2. MPB BRGY. …") or
 * as repeated work clauses ("…, CONST. OF RD. …, CONST. OF RDS. …"). The first
 * part is usually the program name.
 */
export function bundleParts(description: string): string[] {
  const parts = normalizeTitle(description)
    .split(/\s\d{1,2}\s*\.\s*(?=[a-z])|,\s*(?=(?:const|construction|rehab|rehabilitation|improvement|multipurpose)\b)/)
    .map((p) => p.trim())
    .filter(Boolean);
  return parts.length >= 2 ? parts : [];
}

function overlap(a: Set<string>, b: Set<string>): number {
  let n = 0;
  for (const x of a) if (b.has(x)) n++;
  return n;
}

type Candidate = { li: number; pi: number; score: number; jaccard: number };

export function matchAppropriations(lines: GaaLine[], projects: DpwhProject[]): AppropriationMatch[] {
  const projectTokens = projects.map((p) => titleTokens(p.description));
  const projectYears = projects.map(fundingYear);
  const projectPhases = projects.map((p) => phaseOf(p.description));

  const candidates: Candidate[] = [];
  lines.forEach((line, li) => {
    const lt = titleTokens(line.name);
    if (lt.size < MIN_TOKENS) return;
    const linePhase = phaseOf(line.name);
    projects.forEach((_, pi) => {
      if (projectYears[pi] !== line.year) return;
      // Phases of one road share almost every word; differing phases are different works.
      if (linePhase && projectPhases[pi] && linePhase !== projectPhases[pi]) return;
      if (!amountsAgree(line.amount, projects[pi].budget)) return;
      const shared = overlap(lt, projectTokens[pi]);
      const score = shared / lt.size;
      if (score < MEDIUM) return;
      const jaccard = shared / (lt.size + projectTokens[pi].size - shared);
      candidates.push({ li, pi, score, jaccard });
    });
  });

  // Best pairs first; each line and each project is used at most once.
  candidates.sort((a, b) => b.score - a.score || b.jaccard - a.jaccard);
  const byLine = new Map<number, Candidate>();
  const usedProjects = new Set<number>();
  for (const c of candidates) {
    if (byLine.has(c.li) || usedProjects.has(c.pi)) continue;
    byLine.set(c.li, c);
    usedProjects.add(c.pi);
  }

  const bundled = matchBundles(lines, projects, projectYears, byLine, usedProjects);

  return lines.map((line, li) => {
    const c = byLine.get(li);
    if (c) {
      return { line, project: projects[c.pi], score: c.score, confidence: c.score >= HIGH ? "high" : "medium", bundled: false };
    }
    const b = bundled.get(li);
    if (b) return { line, project: projects[b.pi], score: b.score, confidence: "medium", bundled: true };
    return { line, project: null, score: 0, confidence: null, bundled: false };
  });
}

/** Words every work title starts with; inside a bundle the verb is often stated once for all parts. */
const ACTION_WORDS = new Set(["construction", "rehabilitation", "improvement", "completion", "upgrading", "repair"]);
const MIN_BUNDLE_TOKENS = 2;

type PartCandidate = { li: number; pi: number; part: number; score: number; jaccard: number };

/**
 * Second pass for lines the one-to-one pass left unmatched: match each to one
 * part of an unused bundled contract from the same year. A bundle is kept only
 * when its matched lines' appropriations add up to its contract amount.
 */
function matchBundles(
  lines: GaaLine[],
  projects: DpwhProject[],
  projectYears: (number | null)[],
  matchedLines: Map<number, Candidate>,
  usedProjects: Set<number>
): Map<number, { pi: number; score: number }> {
  const bundles = projects.flatMap((p, pi) => {
    if (usedProjects.has(pi)) return [];
    const parts = bundleParts(p.description);
    if (!parts.length) return [];
    return [{ pi, parts: parts.map((text) => ({ tokens: titleTokens(text), phase: phaseOf(text) })) }];
  });
  if (!bundles.length) return new Map();

  const candidates: PartCandidate[] = [];
  lines.forEach((line, li) => {
    if (matchedLines.has(li)) return;
    const lt = new Set([...titleTokens(line.name)].filter((t) => !ACTION_WORDS.has(t)));
    if (lt.size < MIN_BUNDLE_TOKENS) return;
    const linePhase = phaseOf(line.name);
    for (const { pi, parts } of bundles) {
      if (projectYears[pi] !== line.year) continue;
      parts.forEach((part, k) => {
        if (linePhase && part.phase && linePhase !== part.phase) return;
        const shared = overlap(lt, part.tokens);
        const score = shared / lt.size;
        if (score < MEDIUM) return;
        candidates.push({ li, pi, part: k, score, jaccard: shared / (lt.size + part.tokens.size - shared) });
      });
    }
  });

  // Best first; each line and each part of a bundle is used at most once.
  candidates.sort((a, b) => b.score - a.score || b.jaccard - a.jaccard);
  const byLine = new Map<number, { pi: number; score: number }>();
  const usedParts = new Set<string>();
  for (const c of candidates) {
    const partKey = `${c.pi}:${c.part}`;
    if (byLine.has(c.li) || usedParts.has(partKey)) continue;
    byLine.set(c.li, { pi: c.pi, score: c.score });
    usedParts.add(partKey);
  }

  // The lines a bundle took must add up to its contract, or none of them stand.
  const totals = new Map<number, number>();
  for (const [li, { pi }] of byLine) totals.set(pi, (totals.get(pi) ?? 0) + lines[li].amount);
  for (const [li, { pi }] of byLine) {
    if (!amountsAgree(totals.get(pi)!, projects[pi].budget)) byLine.delete(li);
  }
  return byLine;
}
