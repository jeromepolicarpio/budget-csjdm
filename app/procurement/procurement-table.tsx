"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import type { Contract } from "@/lib/types";
import { formatPeso } from "@/lib/data";

const ITEMS_PER_PAGE = 10;

const STATUS_COLORS: Record<string, string> = {
  Active: "bg-green-100 text-green-800",
  Completed: "bg-blue-100 text-blue-800",
  Cancelled: "bg-red-100 text-red-800",
};

const CATEGORY_COLORS: Record<string, string> = {
  "Flood Control": "bg-amber-100 text-amber-800",
  "Water & Utilities": "bg-cyan-100 text-cyan-800",
  Roads: "bg-slate-100 text-slate-800",
  Buildings: "bg-purple-100 text-purple-800",
  "Street Lighting": "bg-yellow-100 text-yellow-800",
  Health: "bg-pink-100 text-pink-800",
};

type SortKey = "amount" | "date";
type SortDir = "asc" | "desc";

interface Props {
  contracts: Contract[];
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <span className="text-muted-foreground/40 ml-1">↕</span>;
  return <span className="ml-1">{dir === "desc" ? "↓" : "↑"}</span>;
}

export function ProcurementTable({ contracts }: Props) {
  const [query, setQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selectedCategories, selectedStatuses, page]);

  const categories = useMemo(
    () => [...new Set(contracts.map((c) => c.category))].sort(),
    [contracts]
  );

  const statuses = useMemo(
    () => [...new Set(contracts.map((c) => c.status))].sort(),
    [contracts]
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of contracts) counts[c.category] = (counts[c.category] ?? 0) + 1;
    return counts;
  }, [contracts]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of contracts) counts[c.status] = (counts[c.status] ?? 0) + 1;
    return counts;
  }, [contracts]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
    setPage(1);
  };

  const toggleStatus = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
    setPage(1);
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
    setPage(1);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedStatuses([]);
    setPage(1);
  };

  const filtered = useMemo(() => {
    let result = contracts;
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.awardee.toLowerCase().includes(q)
      );
    }
    if (selectedCategories.length > 0) {
      result = result.filter((c) => selectedCategories.includes(c.category));
    }
    if (selectedStatuses.length > 0) {
      result = result.filter((c) => selectedStatuses.includes(c.status));
    }
    if (sortKey) {
      result = [...result].sort((a, b) => {
        const valA = sortKey === "amount" ? a.amount : a.date;
        const valB = sortKey === "amount" ? b.amount : b.date;
        const cmp = valA < valB ? -1 : valA > valB ? 1 : 0;
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return result;
  }, [contracts, query, selectedCategories, selectedStatuses, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);

  const paginated = useMemo(
    () => filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE),
    [filtered, safePage]
  );

  // Changes whenever the displayed dataset changes, ensuring React fully
  // replaces rows rather than patching stale ones in-place.
  const viewKey = `${filtered.length}-${safePage}-${selectedCategories.join(",")}-${selectedStatuses.join(",")}`;

  const hasFilters = selectedCategories.length > 0 || selectedStatuses.length > 0;
  const start = filtered.length === 0 ? 0 : (safePage - 1) * ITEMS_PER_PAGE + 1;
  const end = Math.min(safePage * ITEMS_PER_PAGE, filtered.length);

  return (
    <div className="space-y-3">
      <input
        type="text"
        placeholder="Search by title or awardee..."
        value={query}
        onChange={(e) => { setQuery(e.target.value); setPage(1); }}
        className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground pr-1">Category:</span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => toggleCategory(cat)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              selectedCategories.includes(cat)
                ? (CATEGORY_COLORS[cat] ?? "bg-primary text-primary-foreground") + " border-transparent"
                : "bg-background text-muted-foreground border-border hover:bg-muted"
            }`}
          >
            {cat} <span className="opacity-60">({categoryCounts[cat] ?? 0})</span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground pr-1">Status:</span>
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => toggleStatus(status)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              selectedStatuses.includes(status)
                ? (STATUS_COLORS[status] ?? "bg-primary text-primary-foreground") + " border-transparent"
                : "bg-background text-muted-foreground border-border hover:bg-muted"
            }`}
          >
            {status} <span className="opacity-60">({statusCounts[status] ?? 0})</span>
          </button>
        ))}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="ml-2 px-3 py-1 rounded-full text-xs font-medium border border-border text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
          >
            ✕ Clear
          </button>
        )}
      </div>

      <div ref={resultsRef}>
      {/* Mobile card layout */}
      <div className="md:hidden space-y-3">
        {paginated.length === 0 ? (
          <div className="border rounded-lg px-4 py-10 text-center text-muted-foreground text-sm">
            No contracts match the current filters.
          </div>
        ) : (
          paginated.map((c, i) => (
            <div key={`${viewKey}-${i}`} className="border rounded-lg p-4 space-y-2">
              <p className="font-medium leading-snug text-sm">{c.title}</p>
              <p className="text-xs text-muted-foreground">{c.awardee}</p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[c.category] ?? "bg-muted text-muted-foreground"}`}>
                  {c.category}
                </span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[c.status] ?? "bg-muted text-muted-foreground"}`}>
                  {c.status}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="font-semibold tabular-nums text-sm">{formatPeso(c.amount)}</span>
                <span className="text-xs text-muted-foreground tabular-nums">{c.date}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop table layout */}
      <div className="hidden md:block rounded-lg border overflow-x-auto">
        <table className="w-full table-fixed text-sm">
          <colgroup>
            <col style={{ width: "32%" }} />
            <col style={{ width: "23%" }} />
            <col style={{ width: "15%" }} />
            <col style={{ width: "14%" }} />
            <col style={{ width: "9%" }} />
            <col style={{ width: "7%" }} />
          </colgroup>
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Title</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Awardee</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Category</th>
              <th
                className="px-4 py-3 text-left font-medium text-muted-foreground"
                aria-sort={sortKey === "amount" ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
              >
                <button
                  onClick={() => handleSort("amount")}
                  className="flex items-center gap-0.5 hover:text-foreground transition-colors"
                >
                  Amount <SortIcon active={sortKey === "amount"} dir={sortDir} />
                </button>
              </th>
              <th
                className="px-4 py-3 text-left font-medium text-muted-foreground"
                aria-sort={sortKey === "date" ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
              >
                <button
                  onClick={() => handleSort("date")}
                  className="flex items-center gap-0.5 hover:text-foreground transition-colors"
                >
                  Date <SortIcon active={sortKey === "date"} dir={sortDir} />
                </button>
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  No contracts match the current filters.
                </td>
              </tr>
            ) : (
              paginated.map((c, i) => (
                <tr
                  key={`${viewKey}-${i}`}
                  title={`Contract ID: ${c.id}`}
                  className="border-t hover:bg-muted/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium leading-snug">{c.title}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground truncate" title={c.awardee}>
                    {c.awardee}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${CATEGORY_COLORS[c.category] ?? "bg-muted text-muted-foreground"}`}>
                      {c.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold tabular-nums">{formatPeso(c.amount)}</td>
                  <td className="px-4 py-3 text-muted-foreground tabular-nums whitespace-nowrap">{c.date}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${STATUS_COLORS[c.status] ?? "bg-muted text-muted-foreground"}`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <p className="text-xs text-muted-foreground">
          {filtered.length === 0
            ? "No results"
            : `Showing ${start}–${end} of ${filtered.length} contracts`}
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="px-3 py-1.5 rounded-md text-xs font-medium border border-border hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ← Prev
            </button>
            <span className="px-3 py-1.5 text-xs text-muted-foreground">
              {safePage} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="px-3 py-1.5 rounded-md text-xs font-medium border border-border hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
