"use client";

import { useState, useMemo } from "react";
import type { Contract } from "@/lib/types";
import { formatPeso } from "@/lib/data";

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
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedStatuses, setSelectedStatuses] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const categories = useMemo(
    () => [...new Set(contracts.map((c) => c.category))].sort(),
    [contracts]
  );

  const toggleCategory = (cat: string) =>
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });

  const toggleStatus = (status: string) =>
    setSelectedStatuses((prev) => {
      const next = new Set(prev);
      next.has(status) ? next.delete(status) : next.add(status);
      return next;
    });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
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
    if (selectedCategories.size > 0) {
      result = result.filter((c) => selectedCategories.has(c.category));
    }
    if (selectedStatuses.size > 0) {
      result = result.filter((c) => selectedStatuses.has(c.status));
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

  return (
    <div className="space-y-3">
      <input
        type="text"
        placeholder="Search by title or awardee..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />

      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-muted-foreground self-center pr-1">Category:</span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => toggleCategory(cat)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              selectedCategories.has(cat)
                ? (CATEGORY_COLORS[cat] ?? "bg-primary text-primary-foreground") + " border-transparent"
                : "bg-background text-muted-foreground border-border hover:bg-muted"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-muted-foreground self-center pr-1">Status:</span>
        {(["Active", "Completed", "Cancelled"] as const).map((status) => (
          <button
            key={status}
            onClick={() => toggleStatus(status)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              selectedStatuses.has(status)
                ? STATUS_COLORS[status] + " border-transparent"
                : "bg-background text-muted-foreground border-border hover:bg-muted"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-max min-w-full text-sm">
          <thead className="bg-muted">
            <tr>
              {/* Title takes all remaining space */}
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Title</th>
              {/* All other columns shrink to content width via w-px + whitespace-nowrap */}
              <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Awardee</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Category</th>
              <th
                className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap"
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
                className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap"
                aria-sort={sortKey === "date" ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
              >
                <button
                  onClick={() => handleSort("date")}
                  className="flex items-center gap-0.5 hover:text-foreground transition-colors"
                >
                  Date <SortIcon active={sortKey === "date"} dir={sortDir} />
                </button>
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No contracts match the current filters.
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr
                  key={c.id}
                  title={`Contract ID: ${c.id}`}
                  className="border-t hover:bg-muted/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium leading-snug">{c.title}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{c.awardee}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[c.category] ?? "bg-muted text-muted-foreground"}`}>
                      {c.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold whitespace-nowrap">{formatPeso(c.amount)}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{c.date}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[c.status]}`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">
        Showing {filtered.length} of {contracts.length} contracts
      </p>
    </div>
  );
}
