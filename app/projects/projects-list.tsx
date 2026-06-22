"use client";

import { useState, useMemo } from "react";
import type { DpwhProject } from "@/lib/types";
import { formatPeso } from "@/lib/data";

const STATUS_COLORS: Record<string, string> = {
  Completed: "bg-green-100 text-green-800",
  "On-going": "bg-blue-100 text-blue-800",
  Suspended: "bg-red-100 text-red-800",
  Terminated: "bg-red-100 text-red-800",
};

const STATUS_BAR_COLORS: Record<string, string> = {
  "On-going": "bg-blue-400",
  Completed: "bg-green-400",
  Suspended: "bg-red-300",
  Terminated: "bg-red-300",
};

interface Props {
  projects: DpwhProject[];
}

function ProjectCard({ project: p }: { project: DpwhProject }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border rounded-lg p-5">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <button
            onClick={() => setExpanded((e) => !e)}
            className="text-left w-full"
          >
            <p className={`font-medium leading-snug ${expanded ? "" : "line-clamp-1"}`}>
              {p.description}
            </p>
            <span className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              {expanded ? "▲ show less" : "▼ show more"}
            </span>
          </button>
          {expanded && (
            <p className="text-xs text-muted-foreground mt-1">
              Contract ID: {p.contractId} · {p.infraYear} · {p.sourceOfFunds}
            </p>
          )}
        </div>
        <span className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[p.status] ?? "bg-muted text-muted-foreground"}`}>
          {p.status}
        </span>
      </div>

      {expanded ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-4">
            <div>
              <p className="text-xs text-muted-foreground">Budget</p>
              <p className="font-semibold">{formatPeso(p.budget)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Amount Paid</p>
              <p className="font-semibold">{formatPeso(p.amountPaid)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Contractor</p>
              <p className="font-medium truncate">{p.contractor}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Category</p>
              <p className="font-medium">{p.category}</p>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Progress</span>
              <span>{p.progress}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${p.progress === 100 ? "bg-green-500" : "bg-primary"}`}
                style={{ width: `${p.progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Started: {p.startDate}</span>
              <span>Target: {p.completionDate}</span>
            </div>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Budget</p>
            <p className="font-semibold">{formatPeso(p.budget)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Progress</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${p.progress === 100 ? "bg-green-500" : "bg-primary"}`}
                  style={{ width: `${p.progress}%` }}
                />
              </div>
              <span className="text-xs font-medium">{p.progress}%</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Contractor</p>
            <p className="font-medium truncate">{p.contractor}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function ProjectsList({ projects }: Props) {
  const [query, setQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedStatuses, setSelectedStatuses] = useState<Set<string>>(new Set());

  const categories = useMemo(
    () => [...new Set(projects.map((p) => p.category))].sort(),
    [projects]
  );

  const statuses = useMemo(
    () => [...new Set(projects.map((p) => p.status))].sort(),
    [projects]
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

  const filtered = useMemo(() => {
    let result = projects;
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter((p) => p.description.toLowerCase().includes(q));
    }
    if (selectedCategories.size > 0) {
      result = result.filter((p) => selectedCategories.has(p.category));
    }
    if (selectedStatuses.size > 0) {
      result = result.filter((p) => selectedStatuses.has(p.status));
    }
    return result;
  }, [projects, query, selectedCategories, selectedStatuses]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of projects) {
      counts[p.status] = (counts[p.status] ?? 0) + 1;
    }
    return counts;
  }, [projects]);

  const total = projects.length || 1;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border p-4 bg-card">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
          Project Status Breakdown
        </p>
        <div className="flex h-4 rounded-full overflow-hidden gap-px">
          {Object.entries(statusCounts).map(([status, count]) => (
            <div
              key={status}
              className={`h-full ${STATUS_BAR_COLORS[status] ?? "bg-muted"}`}
              style={{ width: `${(count / total) * 100}%` }}
              title={`${status}: ${count}`}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-4 mt-2">
          {Object.entries(statusCounts).map(([status, count]) => (
            <span key={status} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className={`w-2.5 h-2.5 rounded-sm inline-block ${STATUS_BAR_COLORS[status] ?? "bg-muted"}`} />
              {count} {status}
            </span>
          ))}
        </div>
      </div>

      <input
        type="text"
        placeholder="Search projects..."
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
                ? "bg-primary text-primary-foreground border-transparent"
                : "bg-background text-muted-foreground border-border hover:bg-muted"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-muted-foreground self-center pr-1">Status:</span>
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => toggleStatus(status)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              selectedStatuses.has(status)
                ? (STATUS_COLORS[status] ?? "bg-primary text-primary-foreground") + " border-transparent"
                : "bg-background text-muted-foreground border-border hover:bg-muted"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="border rounded-lg p-8 text-center text-muted-foreground text-sm">
            No projects match the current filters.
          </div>
        ) : (
          filtered.map((p) => <ProjectCard key={p.contractId} project={p} />)
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Showing {filtered.length} of {projects.length} projects
      </p>
    </div>
  );
}
